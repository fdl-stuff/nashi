const {express, errorHandling, markdown, mysql} = require('../init');
const router = express.Router();

router.get('/', (req, res, next) => {
    req.data.type = "contact";
    req.data.page_title = "Kontakt"
    res.render("pages/index", req.data);
});

module.exports = router;