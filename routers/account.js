const {express, String, argon2} = require('../init');
const mysql = require('utility/mysql');
const login_errors = require("../constants/login_errors");
const router = express.Router();

router.get('/login', (req, res, next) => {
    req.data.login_error = req.query.error ? login_errors[req.query.error] : {};
    req.data.type = "login";
    req.data.page_title = "Login"
    if(req.data.user.id) return res.redirect('/konto/logout?redir='+req.data.redir);
    res.render('pages/index', req.data);
});
router.post('/login', (req, res, next) => {
    if(!req.body) return res.redirect(`/konto/login?redir=${req.data.redir}`);
    try {
        String.isEmail(req.body.email);
        String.isPassword(req.body.password);
        mysql.$query(`SELECT user_id, password FROM users WHERE email = ?`, [req.body.email], {
            req, res, next, async handler(error, result, fields, router) {
                if(error) return router.next(new errorHandling.SutekinaError(error.message, 400));
                if(!result[0]) return res.redirect(`/konto/login?error=LOGIN_FAILED&redir=${req.data.redir}`)
                try {
                    if(await argon2.verify(result[0].password, req.body.password)) {
                        req.session.user_id = result[0].user_id;
                        if(!req.body.keeplogin) req.session.cookie.expires = false;
                        return res.redirect(req.data.redir);
                    } else {
                        return res.redirect(`/konto/login?error=LOGIN_FAILED&redir=${req.data.redir}`)
                    }
                } catch(err) {
                    return next(new errorHandling.SutekinaError(err.message, 500));
                }
            }
        });
    } catch(err) {
        return res.redirect(`/konto/login?error=${err.message}&redir=${req.data.redir}`);
    }
});
router.get('/logout', (req, res, next) => {
    if(!req.session.user_id) return res.redirect(req.data.redir);
    req.session.destroy((err) => {
        if(err) return next(new errorHandling.SutekinaError(err.message, 500));
        return res.redirect(req.data.redir);
    });
});
router.post('/cookie', (req, res, next) => {
    if(req.query.consent === "true") {
        req.session.consent = true;
    }
    return res.redirect(req.data.redir);
});
router.get('/register', (req, res, next) => {
    req.data.login_error = req.query.error ? login_errors[req.query.error] : {};
    req.data.type = "register";
    req.data.page_title = "Registrieren";
    if(req.data.user.id) return res.redirect(req.data.redir);
    res.render('pages/index', req.data);
});

// router.post('/create', async (req, res, next) => {
//     console.log(req.body);
//     try {
//         password = await argon2.hash(req.body.password);
//         res.end(password);
//     } catch (err) {
//         next(new errorHandling.SutekinaError(err.message, 500));
//     }
// });

module.exports = router;