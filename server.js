//start app

// waki said do refresh so that cookies call after you login
const express = require('express');
const config = require('./config.json')
const app = express();
const PORT = config.services.nashi.port;
app.listen(PORT, () => console.log(config.services.nashi.displayname + ' running on ' + PORT));

module.exports = app;

const {errorHandling, } = require('./init');
const mysql = require('utility/mysql');
const routers = require("./routers");

try {
    app.get('/', (req, res, next) => {
        req.data.type = "index";
        req.data.page_title = "Startseite"
        req.data.slideshow = [{
            page_id: 1,
            url: "1.png",
            title: "BOOS LOL BOOBS"
        },
        {
            page_id: 2,
            url: "6.png",
            title: "COICOCKKCOCK XD :;§) SMIKLE :)"
        }];
        mysql.$query('SELECT pc.title, p.page_type, i.image_id, i.file_format, pc.last_update FROM pages p LEFT JOIN page_content pc on p.page_content_id = pc.page_content_id or p.page_id = pc.page_id and p.page_content_id is null LEFT JOIN images i ON i.image_id = pc.image_id WHERE p.hidden = 0 ORDER BY pc.last_update desc LIMIT 3', [], {
        req, res, next, async handler(error, result, fields, router) {    
            if(error) return next(new errorHandling.SutekinaError(error.message, 500));
            console.log(result);
            req.data.recent_pages = result;
            res.render('pages/index', req.data);
        }});
    });
    for(i = 0; i < routers.length; i++) {
        app.use(routers[i].url, routers[i].export);
    }

    app.all('/error', (req, res, next) => {
        throw new errorHandling.SutekinaStatusError(420)
    });
} catch (err) {
    app.use((req, res, next) => next(err));
}

app.use((req, res, next) => next(new errorHandling.SutekinaStatusError(404)));

const debug = require("debug")("NASHI:ERROR");

app.use((err, req, res, next) => {
    debug(err);
    body = {
        code: err.status || err.statusCode || 500,
        message: err.message || err
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
    req.data.type = "error";
    req.data.error = body;
    res.statusMessage = errorHandling.ErrorStatusCodes[body.code];
    res.status(body.code).render('pages/index', req.data);
});