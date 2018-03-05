var express = require('express');
var router = express.Router();

router.get('/',function(rq,rs,next){
	rs.render('index',{
		userInfo : rq.userInfo
	})
})

module.exports = router;





