//start app

// waki said do refresh so that cookies call after you login
const express = require('express');
const config = require('./config.json')
const app = express();
const PORT = config.port;
app.listen(PORT, () => console.log(config.app_name + ' running on ' + PORT));

module.exports = app;

const {errorHandling} = require('./init');
const routers = require("./routers");

try {
    app.get('/', (req, res, next) => {
        req.data.type = "index";
        req.data.page_title = "Startseite"
        req.data.content = [{
            page_id: 1,
            url: "1.png",
            title: "BOOS LOL BOOBS"
        },
        {
            page_id: 2,
            url: "2.png",
            title: "COICOCKKCOCK XD :;§) SMIKLE :)"
        },
        {
            page_id: 3,
            url: "3.png",
            title: "meow :)"
        },
        {
            page_id: 4,
            url: "4.png",
            title: "BOOS LOL BOOBS"
        },
        {
            page_id: 5,
            url: "5.png",
            title: "COICOCKKCOCK XD :;§) SMIKLE :)"
        },
        {
            page_id: 6,
            url: "6.png",
            title: "meow :)"
        }];
        res.render('pages/index', req.data);
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