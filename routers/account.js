const {express, errorHandling, String, argon2, mysql} = require('../init');
const router = express.Router();

router.get('/login', (req, res, next) => {
    req.data.login_error = req.query.error ? errorHandling.LoginErrors[req.query.error] : {};
    req.data.type = "login";
    req.data.page_title = "Login";
    if(req.data.user.id) return res.redirect(req.data.redir);
    res.render('pages/index', req.data);
});
router.post('/login', (req, res, next) => {
    if(req.data.user.id) return res.redirect(req.data.redir);
    if(!req.body) return res.redirect(`/konto/login?redir=${req.data.redir}`);
    try {
        String.isEmail(req.body.email);
        String.isPassword(req.body.password);
        mysql.$query(`SELECT nick, password FROM users WHERE email = ?`, [req.body.email], {req, res, next, 
            async handler(error, result, fields, router) {
                if(error) return router.next(new errorHandling.SutekinaError(error.message, 400));
                if(!result[0]) return res.redirect(`/konto/login?error=LOGIN_FAILED&redir=${req.data.redir}`)
                try {
                    if(await argon2.verify(result[0].password, req.body.password)) {
                        req.session.nick = result[0].nick;
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
    if(!req.data.user.id) return res.redirect(req.data.redir);
    req.session.destroy((err) => {
        if(err) return next(new errorHandling.SutekinaError(err.message, 500));
        return res.redirect(req.data.redir);
    });
});
router.get('/register', (req, res, next) => {
    req.data.login_error = req.query.error ? errorHandling.LoginErrors[req.query.error] : {};
    req.data.type = "register";
    req.data.page_title = "Registrieren";
    if(req.data.user.id) return res.redirect(req.data.redir);
    res.render('pages/index', req.data);
});
router.post('/register', (req, res, next) => {
    if(req.data.user.id) return res.redirect(req.data.redir);
    if(!req.body) return res.redirect(`/konto/register?redir=${req.data.redir}`);
    if(req.body.tos != "true") return res.redirect(`/konto/register?error=NO_TOS_CONSENT&redir=${req.data.redir}`);
    try {
        String.isNick(req.body.nick);
        String.isEmail(req.body.email);
        String.isPassword(req.body.password);
        mysql.$query(`SELECT email FROM user_whitelist WHERE email = ? AND registered = 0`, [req.body.email], {req, res, next, 
            async handler(error, result, fields, router) {
                if(error) return router.next(new errorHandling.SutekinaError(error.message, 400));
                if(!result[0]) return res.redirect(`/konto/register?error=REGISTER_FAILED&redir=${req.data.redir}`);
                try {
                    let password = await argon2.hash(req.body.password);
                    mysql.$query(`INSERT INTO users(nick, email, password) SELECT ?, ?, ? FROM dual WHERE NOT EXISTS (SELECT * FROM users WHERE nick = ? OR email = ?)`, [req.body.nick, req.body.email, password, req.body.nick, req.body.email], {req, res, next, 
                        async handler(error, result, fields, router) {
                            if(result.affectedRows == 0) return res.redirect(`/konto/register?error=REGISTER_FAILED&redir=${req.data.redir}`);
                            if(error) return router.next(new errorHandling.SutekinaError(error.message, 400));
                            mysql.$query(`UPDATE user_whitelist SET registered = 1 WHERE email = ?`, [req.body.email], {req, res, next,
                                async handler(error, result, fields, router) {
                                    if(error) return router.next(new errorHandling.SutekinaError(error.message, 400));
                                }
                            });
                            req.session.nick = req.body.nick; 
                            return res.redirect(req.data.redir);
                        }
                    });
                } catch (err) {
                    return next(new errorHandling.SutekinaError(err.message, 500));
                }
            }
        });
    } catch(err) {
        return res.redirect(`/konto/register?error=${err.message}&redir=${req.data.redir}`);
    }
});

router.get('/settings', (req, res, next) => {
    if(!req.data.user.id) return res.redirect(req.data.redir);
    req.data.type = "settings";
    req.data.page_title = "Einstellungen";
    req.session.redir = "/konto/settings";
    res.render('pages/index', req.data);
});

router.post('/cookie', (req, res, next) => {
    if(req.query.consent === "true") {
        req.session.consent = true;
    }
    return res.redirect(req.data.redir);
});


module.exports = router;