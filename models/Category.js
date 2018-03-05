/*
 * Created by Sun Wen on 2017/6/26.
 */
var mgs = require('mongoose');
var categoryShm = require('../schemas/category');

module.exports = mgs.model('Category',categoryShm)





