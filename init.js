const {errorHandling, mysql, String} = require('./utility');

const config = require('./config.json')
const argon2 = require('argon2'); 

const db_config = {
    host : config.mysql.host,
    user : config.mysql.user,
    password : config.mysql.password,
    database : config.mysql.database,
    timezone: config.mysql.timezone,
    insecureAuth : true
}

  
let connection;

handleDisconnect = () => {
    connection = mysql.createConnection(db_config);
    connection.connect(function(err) {
        if(err) {
            console.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 2000);
        }
        mysql.$connect(connection);
    });

    connection.on('error', function(err) {
        console.log('db error', err);
        handleDisconnect();                         
    });
}

handleDisconnect();

const express = require('express');
const expressSession = require('express-session');
/*
if you get the error ER_NOT_SUPPORTED_AUTH_MODE, execute this mysql query 

ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';

flush privileges;
*/
const MySQLStore = require('express-mysql-session')(expressSession);

let session_config = Object.assign({}, db_config, {
    clearExpired: true,
    checkExpirationInterval: 900000,
    expiration: 86400000,
    createDatabaseTable: true,
    connectionLimit: 2,
    schema: {
        tableName: 'user_sessions',
        columnNames: {
            session_id: 'session_id',
            expires: 'expires',
            data: 'data'
        }
    }
});
const sessionStore = new MySQLStore(session_config);

const app = require('./server');

app.enable('trust proxy');
app.disable('case sensitive routing');
app.disable('strict routing');
app.disable('x-powered-by');
app.set('etag', 'strong');
app.set('view engine', 'ejs');

app.use('/public', express.static('public'));

//require middleware
const middleware = {
    morgan: require('morgan'),
    cors: require('cors'),
    favicon: require('serve-favicon'),
    bodyParser: require('body-parser'),
    expressSession: expressSession
};

app.use(middleware.morgan('dev'));
app.use(middleware.cors({
    origin: 'http://localhost',
    optionsSuccessStatus: 200,
    methods: 'GET,PUT,POST,DELETE',
    allowedHeaders: 'Origin,X-Requested-With,Content-Type,Accept,Authorization'
}));
app.use(middleware.bodyParser.urlencoded({
    extended:true
}));

app.use(middleware.favicon('./public/img/favicon/favicon.ico'));
app.use(middleware.expressSession({
    key: config.cookies.session.name,
    secret: config.cookies.session.secret,
    store: sessionStore,
    saveUninitialized: false,
    resave: false,
    // proxy: true,
    cookie: {
        domain: config.services.nashi.domain.split("://")[1],
        maxAge: 315569259747,
        httpOnly: true, 
        sameSite: true,
        secure: false //in production set https ig
    } 
}));

app.use((req, res, next) => {
    req.data = {
        // this line means
        // if req.query.redir is set (e.g the url includes for example ?redir=${anyUrl}) then that specific url will be set as redir,
        // if req.session.redir and the current path are the same then set it to '/'.
        // if req.session.redir is not the same as the current path then set the redir to the req.session.redir,
        // if req.session.redir is unset and therefore the current path isnt the same as req.session.redir then set it to '/' 
        redir: (req.query.redir || ((req.session.redir === req.originalUrl.split('?')[0]) ? '/' : req.session.redir || '/' )),
        page_title: undefined,
        url: req.path,
        services: config.services,
        user: {
            id: null,
            language: "ger",
            flags: 0,
        }
    };
    req.session.redir = req.data.redir;
    if(req.session.nick) {
        mysql.$query(`SELECT * FROM users WHERE nick = ?`, [req.session.nick], {
            req, res, next, handler(error, result, fields, router) {
                if(error) return router.next(new errorHandling.SutekinaError(error.message, 400));
                if(!result[0]) return router.next(new errorHandling.SutekinaError("You are logged in with an invalid email address, please reset your cookies for this website!", 400))
                req.data.user.mode = result[0].mode;
                req.data.user.id = result[0].user_id;
                req.data.user.language = result[0].language;
                req.data.user.flags = result[0].flags;
                req.session.user_id = result[0].user_id;
                next();
            }
        });
    } else {
        next();
    }
});

app.use((req, res, next) => {
    if(req.session.consent) {
        req.data.show_notice = false;
    } else req.data.show_notice = true;
    next();
});

app.use((req, res, next) => {
    switch(req.query.mode) {
        case "dark":
            req.session.mode = "dark";
            break;
        case "light":
            req.session.mode = "light";
            break;
        default:
            break;
    };
    if(req.session.mode) {
        if(req.query.mode || !req.data.user.mode) req.data.user.mode = req.session.mode;
        if(req.session.nick) {
            mysql.$query(`UPDATE users SET mode = ? WHERE nick = ?`, [req.session.mode, req.session.nick], {
                req, res, next, handler(error, result, fields, router) {
                    if(error) return router.next(new errorHandling.SutekinaError(error.message, 500));
                    return next();
                }
            });
        } else return next();
    } else return next();
});

module.exports = {
    errorHandling,
    mysql,
    String,
    app,
    argon2,
    express,
    middleware
}
