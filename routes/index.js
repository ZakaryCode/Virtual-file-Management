var express = require('express');
var router = express.Router();

var path = require('path');
var fs = require("fs");

var ResourceStorage = require( path.join(__dirname, '..', '/public/javascripts/ResourceStorage') );
var ResourceStorageDir = new ResourceStorage();	//	文件资源管理器
/* 检测本地文件，初始化并检测状况 */
ResourceStorageDir.init();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { 
  	title: 'Online Compiler',
  	ResourceStorageStatus: JSON.stringify(ResourceStorageDir.STATUS)
  });
});

module.exports = router;
