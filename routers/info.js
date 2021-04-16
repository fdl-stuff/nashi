const {express, errorHandling, markdown, mysql} = require('../init');
const router = express.Router();

router.get('/', (req, res, next) => {
    req.data.type = "article";
    mysql.$query('SELECT p.created_at, p.page_id, pc.page_content_id, pc.last_update, pc.title, pc.content, c.nick creator, c.user_id creator_id, e.nick editor, e.user_id editor_id FROM pages p LEFT JOIN page_content pc ON p.page_content_id = pc.page_content_id OR p.page_id = pc.page_id AND p.page_content_id IS NULL LEFT JOIN users c ON p.user_id = c.user_id LEFT JOIN users e ON pc.user_id = e.user_id WHERE p.page_type = ? AND p.hidden = 0;', [req.originalUrl.split("/")[1].split("?")[0]], {
        req, res, next, async handler(error, result, fields, router) {
            if(error) return next(new errorHandling.SutekinaError(error.message, 500));
            if(!result[0]) return next(new errorHandling.SutekinaStatusError(404));
            result[0].content = result[0].content.replace(/(?<!\\)\\n/gm, "\n")
            req.data.page = result[0];
            req.data.page_title = result[0].title
            req.data.page.content = markdown.makeHtml(req.data.page.content);
            res.render("pages/index", req.data);
        }
    });
});

module.exports = router;