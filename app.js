/*
 * Created by Sun Wen on 2017/6/23.
 */
//加载express模块
var express = require('express');
//加载模版
var swig = require('swig')
//加载数据库
var mgs = require('mongoose')
//加载body-paser，处理上传数据
var bdpaser = require('body-parser');
//加载cookies模块
var Cookies = require('cookies');
var app = express();

var user = require('./models/User')

app.use('/public',express.static( __dirname + '/public'))
//配置模版
//参数1：模版引擎的名称
//参数2：解析处理模版内容的方法
app.engine('html',swig.renderFile);

//bodyparser设置
app.use( bdpaser.urlencoded({extended: true}))


//设置cookies
app.use(function(rq,rs,next){
	rq.cookies = new Cookies(rq,rs);

	//解析登录用户cookies信息
	rq.userInfo = {};
	if(rq.cookies.get('userInfo')){
		try{
			rq.userInfo = JSON.parse(rq.cookies.get('userInfo'))
			user.findById(rq.userInfo._id).then(function(userInfo){
				rq.userInfo.isAdmin = Boolean(userInfo.isAdmin);
				next();
			})
		}catch(e){
			next();
		}
	}else{
		next();
	}
})



//设置模版文件存放目录，参数1必须是‘views’，第二个是目录
app.set('views','./views');
//第一个参数必须是‘view engine’，第二个是app.engine这个方法中定义的模版引擎名称
app.set('view engine', 'html')
//清除缓存
swig.setDefaults({cache: false})


//设置静态文件托管
app.use('/admin',require("./routers/admin"))
app.use('/api',require("./routers/api"))
app.use('/',require("./routers/main"))

mgs.connect('mongodb://localhost:27018/login',function(err){
	if(err){
		console.log('数据库连接失败')
	}else{
		console.log('数据库连接成功')
		app.listen(8080);
	}
});
