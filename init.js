const {errorHandling, mysql, String} = require('utility');
const argon2 = require('argon2'); 

const mysqlOptions = {
    host : 'localhost',
    user : 'root',
    password : process.env.MYSQL_PASSWORD || 'sutekina#SQL',
    database : process.env.MYSQL_DATABASE || 'ringo',
    timezone: 'Z',
    insecureAuth : true
}

const connection = mysql.createConnection(mysqlOptions);

const express = require('express');
const expressSession = require('express-session');
/*
if you get the error ER_NOT_SUPPORTED_AUTH_MODE, execute this mysql query 

ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password'

flush privileges;
*/
const MySQLStore = require('express-mysql-session')(expressSession);

const sessionStore = new MySQLStore(Object.assign(mysqlOptions, {
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
}));

/* yes this is needed */ 
connection.connect();
mysql.$connect(connection);

const app = require('./server');
const session = require('express-session');

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
    key: 'session',
    secret: 'uwu',
    store: sessionStore,
    saveUninitialized: false,
    resave: false,
    cookie: {
        httpOnly: true, 
        sameSite: true,
        secure: false, //in production set https ig
        maxAge: 315569259747 
    }
}));

app.use((req, res, next) => {
    req.data = {
        url: req.path,
        user: {
            id: null,
            language: "ger",
            mode: "light",
            flags: 0
        }
    };

    if(req.session.email) {
        mysql.$query(`SELECT * FROM users WHERE email = ?`, [req.session.email], {
            req, res, next, handler(error, result, fields, router) {
                if(error) return router.next(new errorHandling.SutekinaError(error.message, 400));
                if(!result[0]) return router.next(new errorHandling.SutekinaError("You are logged in with an invalid email address, please reset your cookies for this website!", 400))
                req.data.user.mode = result[0].mode;
                req.data.user.id = result[0].user_id;
                req.data.user.language = result[0].language;
                req.data.user.flags = result[0].flags;
                next();
            }
        });
    } else {
        next();
    }
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
        req.data.user.mode = req.session.mode;
        if(req.session.email) {
            mysql.$query(`UPDATE users SET mode = ? WHERE email = ?`, [req.session.mode, req.session.email], {
                req, res, next, handler(error, result, fields, router) {
                    if(error) return router.next(new errorHandling.SutekinaError(error.message, 400));
                    return next();
                }
            });
        } else next();
    } else next();
})

app.disable('case sensitive routing');
app.disable('strict routing');
app.disable('x-powered-by');
app.set('etag', 'strong');
app.set('view engine', 'ejs');

module.exports = {
    errorHandling,
    mysql,
    String,
    app,
    argon2,
    express,
    middleware
}