var express = require('express');
var router = express.Router();
/*
  var restify = require('restify');
  var server = restify.createServer();
*/
var path = require('path');

var Result = require( path.join(__dirname, '..', '/public/javascripts/ajaxResult') );

/* POST users listing. */
router.post('/', function(req, res, next) {
	req.accepts('json, text');
  // 参数接收
  var ajaxQuery = req.query.TYPE;//地址传参 TYPE
  var ajaxBodeRequest = {};
  ajaxBodeRequest = req.body.input;
  /* 接口请求 */
  var ajaxResult = new Result(ajaxQuery,ajaxBodeRequest,function(){
        res.send({
          "query":ajaxQuery,
          "request":ajaxBodeRequest,
          "response":this["RESPONSE"],
          "status":this["STATUS"],
    });
  });
});
/*
  server.on('uncaughtException', function (req, res, route, err) {
      console.log(route);     // log the route, woo...
      console.log(err.stack); // log the error
      var message = 'WTF';
      if (err instanceof MyError) {
          message = err.message; // custom output message, cool
      }
      res.send(400, { message: message }); // status code can depend on the Error Type
  });
*/
module.exports = router;
