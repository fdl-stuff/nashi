const {express, String, argon2} = require('../init');
const mysql = require('utility/mysql');
const router = express.Router();

router.get('/login', (req, res, next) => {
    //add remember me and password forgotten
    req.data.type = "login";
    req.data.page_title = "Login"
    if(req.data.user.id) return res.redirect('/konto/logout?redir='+req.data.redir);
    res.render('pages/index', req.data);
});
router.post('/login', (req, res, next) => {
    if(!req.body || !req.body.email || !req.body.password) return res.redirect('/login');
    if(String.isPasswordValidator(req.body.password)) {
        mysql.$query(`SELECT password FROM users WHERE email = ?`, [req.body.email], {
            req, res, next, async handler(error, result, fields, router) {
                if(error) return router.next(new errorHandling.SutekinaError(error.message, 400));
                //if the email is invalid
                if(!result[0]) return res.redirect('/konto/login')
                try {
                    if(await argon2.verify(result[0].password, req.body.password)) {
                        req.session.email = req.body.email;
                        res.redirect(req.data.redir);
                    } else {
                        //wrong password
                        return res.redirect('/konto/login')
                    }
                } catch(err) {
                    //internal failure
                    next(new errorHandling.SutekinaError(err.message, 500));
                }
            }

        });
        //if the password isnt a valid password (too short too long yea :D idk can happen if someone requests manually this isnbt perfect cause someone could set a short password in hte database and then would be unable to login hm id change the minimum to 1 in the utility config for strings)
    } else return res.redirect('/konto/login');
});
router.get('/logout', (req, res, next) => {
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