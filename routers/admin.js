var express = require('express');
var router = express.Router();

var User =require('../models/User');
var Category =require('../models/Category');
var Content = require('../models/Content')

router.get('/',function(rq,rs,next){
	if(!rq.userInfo.isAdmin){
		rs.send('对不起，只有管理员可以进入后台管理页面。');
		return
	}
	next();
})
/*
* 首页
* */
router.get('/',function(rq,rs,next){
	rs.render('admin/index',{
		userInfo : rq.userInfo
	})
})
/*
* 用户管理
* */
/*router.get('/user',function(rq,rs,next){
	/!*
	*从数据库中读取数据
	*limit(number)限制获取条数
	*
	* skip(number)忽略数据条数
	* 每页显示2条
	* 1: 1,2 skip:0;
	* 2: 3,4 skip:2;
	* *!/
	var page = Number(rq.query.page || 1);
	var limit = 10;
	var skip = (page - 1)*limit;
	var allPage3 = 0;
	User.count().then(function(count){
		allPages = Math.ceil(count/limit);
	});
	User.find().limit(10).skip(skip).then(function(users){

		rs.render('admin/user',{
			userInfo : rq.userInfo,
			users : users,
			page: page,
			allPages : allPages,
			skip : skip,
			limit : limit
		})
	});
})*/
router.get('/user',function(rq,rs,next){
	rs.render('admin/user',{
		userInfo : rq.userInfo
	})
});

router.get('/category_index',function(rq,rs,next){
	rs.render('admin/category_index',{
		userInfo : rq.userInfo
	})
});

router.get('/category_add',function(rq,rs,next){
	rs.render('admin/category_add',{
		userInfo : rq.userInfo
	})
});
/*
* 分类添加保存*/
router.get('/category_add',function(rq,rs,next){
	rs.render('admin/category_add',{
		userInfo : rq.userInfo
	})
});

router.post('/category_add',function(rq,rs,next){
	var name = rq.body.name;
	if(name == ''){
		rs.render('admin/error',{
			userInfo : rq.userInfo,
			message : '名称不能为空'
		});
		return;
	}

	Category.findOne({
		name:name
	}).then(function(msg){
		if(msg){
			rs.render('admin/error',{
				userInfo : rq.userInfo,
				message : '分类已经存在'
			});
			return Promise.reject();
		}else{
			return new Category({
				name : name
			}).save();
		}
	}).then(function(newMsg){
		rs.render('admin/success',{
			userInfo :rq.userInfo,
			message : '保存成功',
			url : '/admin/category_index',
			url1 : '/admin/category_add'
		})
	})
});

/*
* 分类的修改
* */
router.get('/category_edit',function(rq,rs,next){
	var id = rq.query.id || '';
	Category.findOne({
		_id : id
	}).then(function(a){
		if(!a){
			rs.render('admin/error',{
				userInfo : rq.userInfo,
				message : '当前分类不存在'
			});
			return;
		}
		rs.render('admin/category_edit',{
			userInfo : rq.userInfo,
			category : a
		})
	})
});

/*
* 分类信息修改保存*/
router.post('/category_edit',function(rq,rs,next){
	var id = rq.query.id || '';
	var name = rq.body.name;

	Category.findOne({
		_id : id
	}).then(function(a){
		if(!a){
			rs.render('admin/error',{
				userInfo : rq.userInfo,
				message : '分类信息不存在'
			});
			return Promise.reject()
		}else{
			if(name == a.name){

				rs.render('admin/success',{
					userInfo : rq.userInfo,
					message : '修改成功',
					url : '/admin/category_index'
				});
				return Promise.reject()
			}else{
				return Category.findOne({
					_id : {$ne: id},
					name : name
				})
			}
		}
	}).then(function(b){
		if(b){
			rs.render('admin/error',{
				userInfo : rq.userInfo,
				message : '该分类已经存在',
				url : '/admin/category_edit?id='+id
			});
			return Promise.reject();
		}else{
			return Category.update({
				_id : id
			},{
				name : name
			});
		}
	}).then(function(a){
		rs.render('admin/success',{
			userInfo: rq.userInfo,
			message : '修改成功',
			url : '/admin/category_index'
		})
	})
});
/*
* 内容首页
* */
router.get('/content_index',function(rq,rs,next){
	rs.render('admin/content_index',{
		userInfo : rq.userInfo
	})
});
/*
* 内容添加
* */
router.get('/content_add',function(rq,rs,next){
	rs.render('admin/content_add',{
		userInfo : rq.userInfo
	})
})
/*
 * 内容的修改
 * */
router.get('/content_edit',function(rq,rs,next){
	var id = rq.query.id || '';
	Content.findOne({
		_id : id
	}).then(function(a){
		if(!a){
			rs.render('admin/error',{
				userInfo : rq.userInfo,
				message : '内容不存在'
			});
			return Promise.reject();
		}else{
			rs.render('admin/content_edit',{
				userInfo : rq.userInfo,
				content : a
			})
		}
	})
});

/*
 * 内容信息修改保存
 * */
router.post('/content_edit',function(rq,rs,next){
	var id = rq.query.id || '';
	var name = rq.body.name;

	Content.findOne({
		_id : id
	}).then(function(b){
		return Content.update({
			_id : id
		},{
			name : name,
			cate : rq.body.cate,
			title : rq.body.title,
			intro : rq.body.intro,
			content : rq.body.content
		});
	}).then(function(a){
		rs.render('admin/success',{
			userInfo: rq.userInfo,
			message : '修改成功',
			url : '/admin/content_index'
		})
	})
});
/*
* 内容阅读量统计
* */
router.get('/content_msg',function(rq,rs,next){
	var id = rq.query.id || '';
	Content.findOne({
		_id : id
	}).then(function(b){
		b.read++;
		b.save();
		rs.render('admin/content_msg',{
			userInfo: rq.userInfo,
			message : '读取成功',
			list : b,
			url : '/admin/content_msg'
		})
	})
})





module.exports = router;





