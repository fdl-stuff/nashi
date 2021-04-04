const {express, errorHandling, markdown, mysql} = require('../init');
const router = express.Router();

router.get('/', (req, res, next) => {
    req.data.type = "pages";
    page_type = req.originalUrl.split("/")[1].split("?")[0];
    req.data.page_title = page_type[0].toUpperCase() + page_type.slice(1).replace("ae", "ä");
    
    mysql.$query('SELECT pc.title, p.page_type, i.image_id, i.file_format, pc.last_update FROM pages p LEFT JOIN page_content pc on p.page_content_id = pc.page_content_id or p.page_id = pc.page_id and p.page_content_id is null LEFT JOIN images i ON i.image_id = pc.image_id WHERE p.hidden = 0 AND p.page_type = ? ORDER BY pc.last_update desc', [page_type], {
        req, res, next, async handler(error, result, fields, router) {
            if(error) return next(new errorHandling.SutekinaError(error.message, 500));
            if(!result[0]) return next(new errorHandling.SutekinaError("Es gab keine Ergebnisse für " + req.data.page_title, 404));
            req.data.content = result;
            res.render("pages/index", req.data);
        }
    });
});
router.get('/:query', (req, res, next) => {
    req.data.type = "article"
    page_type = req.originalUrl.split("/")[1].split("?")[0];
        mysql.$query('SELECT p.created_at, p.page_id, p.page_type, pc.page_content_id, pc.last_update, pc.title, pc.content, c.nick creator, c.user_id creator_id, e.nick editor, e.user_id editor_id, i.image_id image_id, i.file_format file_format FROM pages p LEFT JOIN page_content pc ON p.page_content_id = pc.page_content_id OR p.page_id = pc.page_id AND p.page_content_id IS NULL LEFT JOIN users c ON p.user_id = c.user_id LEFT JOIN users e ON pc.user_id = e.user_id LEFT JOIN images i ON i.image_id = pc.image_id OR i.type = "banner" AND i.type_id = p.page_id WHERE title = ? AND p.page_type = ? AND p.hidden != 2 ORDER BY i.image_id DESC;', [req.params.query, page_type], {
        req, res, next, async handler(error, result, fields, router) {
            if(error) return next(new errorHandling.SutekinaError(error.message, 500));
            if(!result[0]) return next(new errorHandling.SutekinaStatusError(404));
            result[0].content = result[0].content.replace(/(?<!\\)\\n/gm, "\n")
            req.data.page = result[0];
            req.data.page_title = result[0].title;
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