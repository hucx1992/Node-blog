/*
 * Created by Sun Wen on 2017/6/23.
 */
var mgs = require('mongoose');

//用户的表结构
module.exports = new mgs.Schema({
	username : String,
	password : String,
    nicheng : String,
	isAdmin : {
		type : Boolean,
		default : false
	}
})