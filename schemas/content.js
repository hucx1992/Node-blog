/*
 * Created by Sun Wen on 2017/7/13.
 */
/*
 * Created by Sun Wen on 2017/6/23.
 */
var mgs = require('mongoose');

//用户的表结构
module.exports = new mgs.Schema({
	cate : String,
	title : String,
	intro : String,
	content : String,
	read : Number,
	commont : Array,
	author : String,
	time : Number,
    like : Number
})