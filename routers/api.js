var express = require('express');
var router = express.Router();
var User = require('../models/User')
var Category = require('../models/Category')
var Content = require('../models/Content')
var responseData;

router.use(function(rq,rs,next){
	responseData={
		code : 0,
		msg : ''
	};
	categoryData={
		code : 0,
		msg : ''
	};
	contentData={
		code : 0,
		msg : ''
	}
	next();
})

//注册
router.post('/user/register',function(rq,rs,next){
	var username = rq.body.username;
	var password = rq.body.password;
	var repassword = rq.body.repassword;
	var nicheng = rq.body.nicheng;

	if( username == '' ){
		responseData.code = '201';
		responseData.msg = '用户名不能为空。'
		rs.json(responseData);
		return
	}
	if( password == '' ){
		responseData.code = '202';
		responseData.msg = '密码不能为空。'
		rs.json(responseData);
		return
	}
	if( repassword == '' ){
		responseData.code = '203';
		responseData.msg = '请再次确认密码。'
		rs.json(responseData);
		return
	}
	if( password != repassword ){
		responseData.code = '203';
		responseData.msg = '错误，请重新输入密码。'
		rs.json(responseData);
		return
	}
	User.findOne({
		username: username
	}).then(function( userInfo ){
		if( userInfo ){
			responseData.code = '201',
			responseData.msg = '该用户名已被注册！',
			rs.json(responseData);
			return;
		}

		var u = new User({
			username : username,
			password : password,
			nicheng : nicheng
		});
		return u.save();
	}).then(function(newuserInfo){
		var nicheng = encodeURI(newuserInfo.nicheng)
		responseData.code = 200;
		responseData.msg = '注册成功，请前往登录！';
		rq.cookies.set('userInfo',JSON.stringify({
			_id : newuserInfo.id,
			name : newuserInfo.username,
			nicheng : nicheng
		}));
		rs.json(responseData);
	})

})

/*登录*/
router.post('/user/login',function(rq,rs){
	var username = rq.body.username;
	var password = rq.body.password;

	if( username=='' ){
		responseData.code = 201;
		responseData.msg = '用户名不能为空';
		rs.json(responseData)
		return;
	}else if( password==''){
		responseData.code = 202;
		responseData.msg = '密码不能为空';
		rs.json(responseData)
		return;
	}
	User.findOne({
		username : username,
		password : password
	}).then(function(a){
		if(!a){
			responseData.code = 204;
			responseData.msg = '用户名或者密码错误';
			rs.json(responseData)
			return;
		}
		responseData.code = 200;
		responseData.msg = '登录成功！';
		responseData.userInfo = {
			name : a.username,
			id : a._id,
			nicheng : a.nicheng
		}
		var nicheng = encodeURI(a.nicheng)
		rq.cookies.set('userInfo',JSON.stringify({
			_id : a.id,
			name : a.username,
			nicheng : nicheng
		}));
		rs.json(responseData);
		return;
	})
 })

//退出登录
router.get('/user/logout',function(rq,rs,next){
	rq.cookies.set('userInfo', null);
	responseData.code = '200';
	responseData.msg = '退出成功！';
	rs.json(responseData);
})

//获取用户列表
router.get('/user/users',function(rq,rs,next){
	var page = Number(rq.query.page || 1);
	var limit = Number(rq.query.pagenum || 5);
	var skip = (page - 1)*limit;

	User.count().then(function(count){

		User.find().limit(limit).skip(skip).then(function(a){
			responseData.pages = Math.ceil(count/limit);
			responseData.code = '200';
			responseData.msg = '请求成功！';
			responseData.list = a;
			responseData.pageNum = Number(page);
			rs.json(responseData);
		})
	})

})

//分类列表
router.get('/admin/category',function(rq,rs,next){
	var page = Number(rq.query.page || 1);
	var limit = Number(rq.query.pagenum) || 10;
	var skip = (page - 1)*limit;
	var sorts = Number(rq.query.sort) == 1 ? 1 : -1;
	Category.count().then(function(count){
		/*
		* sort : 1(升序)  -1(降序)
		* */
		Category.find().sort({_id : sorts}).limit(limit).skip(skip).then(function(a){
			categoryData.pages = Math.ceil(count/limit);
			categoryData.code = '200';
			categoryData.msg = '请求成功！';
			categoryData.list = a;
			categoryData.pageNum = Number(page);
			rs.json(categoryData);
		})
	})
});

//删除分类
router.get('/category/delete',function(rq,rs,next){
	var id = rq.query.id || '';
	Category.remove({
		_id : id
	}).then(function(a){
		categoryData.code = '200';
		categoryData.message = '删除成功';
		rs.json(categoryData);
	})
});


/*
 * 内容添加上传模块
 * */
router.post('/content/add',function(rq,rs,next){
	var cate = rq.body.cate;
	var title = rq.body.title;
	var intro = rq.body.intro;
	var content = rq.body.content;
	var time = rq.body.time;
	var author = rq.userInfo.name;
	var commont = new Array();
	var read = 0;
	var like = 0;
	if( title=='' ){
		responseData.code = 201;
		responseData.msg = '标题不能为空';
		rs.json(responseData);
		return;
	}else if( intro==''){
		responseData.code = 202;
		responseData.msg = '简介不能为空';
		rs.json(responseData);
		return;
	}else if( content==''){
		responseData.code = 203;
		responseData.msg = '内容不能为空';
		rs.json(responseData);
		return;
	}
	responseData.code = 200;
	responseData.msg = '添加成功';
	rs.json(responseData);
	var u = new Content({
		cate : cate,
		title : title,
		intro : intro,
		content : content,
		time : time,
		author : author,
	 	commont : commont,
	 	read : read,
	 	like : like
	});
	return u.save();
});

/*
* 首页读取内容模块
* */
router.get('/content/list',function(rq,rs,next){
	var page = Number(rq.query.page || 1);
	var limit = Number(rq.query.pagenum) || 10;
	var skip = (page - 1)*limit;
	var sorts = Number(rq.query.sort) == 1 ? 1 : -1;
	var cates = rq.query.cate;

	if(cates == '*'){
		cates = new Array();
		Category.find().then(function(a){
			for (var i = 0; i<a.length; i++){
				cates.push(a[i].name)
			}
		}).then(function(a){
			Content.count().then(function(count){
				/*
				 * sort : 1(升序)  -1(降序)
				 * */
				Content.find({
					cate : cates
				}).sort({_id : sorts}).limit(limit).skip(skip).then(function(a){
					contentData.pages = Math.ceil(count/limit);
					contentData.code = '200';
					contentData.msg = '请求成功！';
					contentData.list = a;
					contentData.pageNum = Number(page);
					rs.json(contentData);
				})
			})
		})

	}else{
		Content.count().then(function(count){
			/*
			 * sort : 1(升序)  -1(降序)
			 * */
			Content.find({
				cate : cates
			}).sort({_id : sorts}).limit(limit).skip(skip).then(function(a){
				contentData.pages = Math.ceil(count/limit);
				contentData.code = '200';
				contentData.msg = '请求成功！';
				contentData.list = a;
				contentData.pageNum = Number(page);
				rs.json(contentData);
			})
		})
	}

});

//删除内容
router.get('/content/delete',function(rq,rs,next){
	var id = rq.query.id || '';
	Content.remove({
		_id : id
	}).then(function(a){
		contentData.code = '200';
		contentData.message = '删除成功';
		rs.json(contentData);
	})
});

//评论提交
router.post('/commont/add', function(rq,rs,next){
	var id = rq.body.id;
	var time = new Date().getTime();
	var nicheng = decodeURI(rq.userInfo.nicheng)
	var commontData = {
			content : rq.body.txt,
			author : rq.userInfo.name,
			nicheng : nicheng,
			time : time
		}

	Content.findOne({
		_id : id
	}).then(function(a){
		a.commont.unshift(commontData)
		a.save();
		contentData.code = '200';
		contentData.msg = '评论成功';
		rs.json(contentData);
	})
})

//读取评论
router.get('/commont/getCommont', function(rq,rs,next){
	var id = rq.query.id;
	Content.findOne({
		_id : id
	}).then(function(a){
		contentData.code = '200';
		contentData.msg = '获取成功';
		contentData.data = a.commont
		rs.json(contentData);
	})
})

//文章点赞功能
router.get('/commont/like',function(rq,rs,next){
	var id = rq.query.id || '';
	Content.findOne({
		_id : id
	}).then(function(a){
		console.log(a)
		a.like++;
		a.save();
		contentData.code = '200';
		contentData.msg = '点赞成功';
		contentData.like = a.like;
		rs.json(contentData)
	})
})


module.exports = router;





