//start app
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
app.listen(PORT);

module.exports = app;

const {errorHandling, String, argon2} = require('./init');
const mysql = require('utility/mysql');

try {
    // app.post('/create', async (req, res, next) => {
    //     try {
    //         password = await argon2.hash(req.body.password);
    //         res.end(password);
    //     } catch (err) {
    //         next(new errorHandling.SutekinaError(err.message, 500));
    //     }
    // });
    app.get('/', (req, res, next) => {
        req.data.type = "index";    
        res.render('pages/index', req.data);
    });
    app.get('/login', (req, res, next) => {
        //add remember me and password forgotten
        req.data.type = "login";
        req.data.redir = req.query.redir || '/';
        if(req.data.user.id) return res.redirect('/logout');
        res.render('pages/index', req.data);
    });
    app.post('/login', (req, res, next) => {
        if(!req.body || !req.body.email || !req.body.password) return res.redirect('/login');
        if(String.isPasswordValidator(req.body.password)) {
            mysql.$query(`SELECT password FROM users WHERE email = ?`, [req.body.email], {
                req, res, next, async handler(error, result, fields, router) {
                    if(error) return router.next(new errorHandling.SutekinaError(error.message, 400));
                    //if the email is invalid
                    if(!result[0]) return res.redirect('/login')
                    try {
                        if(await argon2.verify(result[0].password, req.body.password)) {
                            req.session.email = req.body.email;
                            res.redirect(req.data.redir || '/');
                        } else {
                            //wrong password
                            return res.redirect('/login')
                        }
                    } catch(err) {
                        //internal failure
                        next(new errorHandling.SutekinaError(err.message, 500));
                    }
                }

            });
            //if the password isnt a valid password (too short too long yea :D idk can happen if someone requests manually this isnbt perfect cause someone could set a short password in hte database and then would be unable to login hm id change the minimum to 1 in the utility config for strings)
        } else return res.redirect('/login');
    });
    app.get('/logout', (req, res, next) => {
        req.session.destroy((err) => {
            if(err) return next(new errorHandling.SutekinaError(err.message, 500));
            res.redirect('/');
        });
    });
    
    app.get('/br', (req, res, next )=> {
        req.data.type = "br";
        res.render('pages/index', req.data);
    });
    app.all('/error', (req, res, next) => {
        throw new errorHandling.SutekinaStatusError(420)
    });
} catch (err) {
    app.use((req, res, next) => next(err));
}

app.use((req, res, next) => next(new errorHandling.SutekinaStatusError(404)));

const debug = require("debug")("MOMO:ERROR");

app.use((err, req, res, next) => {
    debug(err);
    body = {
        code: err.status || err.statusCode || 500,
        message: err.message || err
    };
    req.data.type = "error";
    req.data.error = body;
    res.statusMessage = errorHandling.ErrorStatusCodes[body.code];
    res.status(body.code).render('pages/index', req.data);
});