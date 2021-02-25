const {express, errorHandling, markdown} = require('../init');
const mysql = require('utility/mysql');
const router = express.Router();

router.get('/', (req, res, next) => {
    req.data.type = "pages";
    page_type = req.originalUrl.split("/")[1].split("?")[0];
    req.data.page_title = page_type[0].toUpperCase() + page_type.slice(1).replace("ae", "ä");
    mysql.$query('SELECT * FROM pages p LEFT JOIN page_content pc on p.page_content_id = pc.page_content_id or p.page_id = pc.page_id and p.page_content_id is null WHERE p.page_type = ? AND p.hidden = 0', [page_type], {
        req, res, next, async handler(error, result, fields, router) {
            if(error) return next(new errorHandling.SutekinaError(error.message, 500));
            if(!result[0]) return next(new errorHandling.SutekinaError("Es gab keine ergebnisse für " + req.data.page_title, 404));
            req.data.content = result;
            res.render("pages/index", req.data);
        }
    });
});
router.get('/:query', (req, res, next) => {
    req.data.type = "article"
    page_type = req.originalUrl.split("/")[1].split("?")[0];
    mysql.$query('SELECT p.created_at, p.page_id, p.page_type, pc.page_content_id, pc.last_update, pc.title, pc.content, c.nick creator, c.user_id creator_id, e.nick editor, e.user_id editor_id, pi.page_image_id page_image_id, pi.file_format file_format FROM pages p LEFT JOIN page_content pc ON p.page_content_id = pc.page_content_id OR p.page_id = pc.page_id AND p.page_content_id IS NULL LEFT JOIN users c ON p.user_id = c.user_id LEFT JOIN users e ON pc.user_id = e.user_id LEFT JOIN page_image pi ON pi.page_image_id = pc.page_image_id OR pi.page_id = pc.page_id AND pc.page_image_id IS NULL WHERE title = ? AND p.page_type = ? AND p.hidden = 0;', [req.params.query, page_type], {
        req, res, next, async handler(error, result, fields, router) {
            if(error) return next(new errorHandling.SutekinaError(error.message, 500));
            if(!result[0]) return next(new errorHandling.SutekinaStatusError(404));
            result[0].content = result[0].content.replace(/(?<!\\)\\n/gm, "\n")
            req.data.page = result[0];
            req.data.page_title = result[0].title
            console.log(result)
            req.data.page.content = markdown.makeHtml(req.data.page.content);
            res.render("pages/index", req.data);
        }
    });
});

// if you wanna search the database this works good 

// let regex = `(?<![.])(${req.params.query.replace('|', "\\|").split(' ').join('|')})(?![.])`

// mysql.$query('SELECT * FROM page_content WHERE (title) REGEXP ?', [regex], {
//     req, res, next, async handler(error, result, fields, router) {
//         if(error) return next(new errorHandling.SutekinaError(error.message, 500));
//         if(!result[0]) return next(new errorHandling.SutekinaStatusError(404));
//         req.data.content = result[0]
//         console.log(result);
//         res.render("pages/index", req.data)
//     }
// });

module.exports = router;