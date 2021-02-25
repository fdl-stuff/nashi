const {express, errorHandling, markdown} = require('../init');
const mysql = require('utility/mysql');
const router = express.Router();

router.get('/', (req, res, next) => {
    req.data.type = "contact";
    req.data.page_title = "Kontakt"
    res.render("pages/index", req.data);
});

module.exports = router;