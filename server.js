const express = require('express');
const config = require('./config.json')
const package = require('./package.json');
const app = express();
const PORT = config.services.nashi.port;
app.listen(PORT, () => console.log(`${config.services.nashi.displayname}:${PORT} // NASHI ${package.version}`));

module.exports = app;

const {errorHandling, mysql} = require('./init');
const routers = require("./routers");

try {
    app.get('/', (req, res, next) => {
        req.data.type = "index";
        req.data.page_title = "Startseite";
        mysql.$query('SELECT image_id, file_format FROM images WHERE type = "temp_banner" AND hidden = false ORDER BY type_id', [], {
        req, res, next, async handler(error, result, fields, router) { 
            if(error) return next(new errorHandling.SutekinaError(error.message, 500));
            req.data.slideshow = result;
            //to set a title use req.data.slideshow[i].title if you want to have a title, NOTE: titles arent fully supported.
            mysql.$query('SELECT pc.title, p.page_type, i.image_id, i.file_format, pc.last_update FROM pages p LEFT JOIN page_content pc on p.page_content_id = pc.page_content_id or p.page_id = pc.page_id and p.page_content_id is null LEFT JOIN images i ON i.image_id = pc.image_id WHERE p.hidden = 0 AND p.page_type NOT IN ("datenschutz", "impressum", "kontakt") ORDER BY pc.last_update desc LIMIT 6', [], {
            req, res, next, async handler(error, result, fields, router) {    
                if(error) return next(new errorHandling.SutekinaError(error.message, 500));
                req.data.recent_pages = result;
                res.render('pages/index', req.data);
            }});
        }});
    });
    routers.map(r => app.use(r.url, r.export));
    app.all('/error', (req, res, next) => {
        if(req.session.error) {
            let error = req.session.error;
            delete req.session.error;
            throw error;
        } else next();
    });
} catch (err) {
    app.use((req, res, next) => next(err));
}

app.use((req, res, next) => next(new errorHandling.SutekinaStatusError(404)));

const debug = require("debug")("NASHI:ERROR");

app.use((err, req, res, next) => {
    debug(err);
    body = {
        code: err.status || err.statusCode || err.code || 500,
        message: err.message.code || err.message || err
    };
    req.data.page_title = "Error"
    if(!req.data) req.data = {
        url: req.path,
        user: {
            id: null,
            language: "ger",
            mode: "light",
            flags: 0
        }
    };
    console.log(err)
    req.data.type = "error";
    req.data.error = body;
    res.statusMessage = errorHandling.ErrorStatusCodes[body.code];
    res.status(body.code).render('pages/index', req.data);
});