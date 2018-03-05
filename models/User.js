/*
 * Created by Sun Wen on 2017/6/26.
 */
var mgs = require('mongoose');
var usershm = require('../schemas/users');

module.exports = mgs.model('User',usershm);







