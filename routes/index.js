var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  return res.json({ success: true, message: 'This is the homepage' });
});

module.exports = router;
