var createError = require('http-errors');
var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var expressJWT = require('express-jwt');
var roleUtil = require('./plugins/util/roleUtil')
var fs = require('fs');

var app = express();

app.use(express.static('public'))

app.use('/found',function(req,res,next){
  var form=fs.readFileSync("./public/index.html",{encoding:'utf-8'})
  res.send(form)
})

// CORS & Preflight request
app.all("*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Methods", "*");
  res.header("Content-Type", "application/json;charset=utf-8");
  res.header("Access-Control-Allow-Credentials", true); //Carrying a cookie across domain request
  req.method.toUpperCase() === "OPTIONS" ? res.sendStatus(200) : next(); //Prevents interfaces from being responded to during the pre-request phase
});

//token验证
app.use(
  expressJWT({
    secret: 'tokenSecret',
    algorithms: ['HS256'],
    credentialsRequired: false,
    getToken: req => {
      if (req.headers.authorization) {
        return req.headers.authorization;
      }
      return null;
    }
  }).unless({
    path: ['/api/user/login', '/api/user/code', '/api/user/cellphone','/api/contract/getContractList'] //白名单
  })
);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

app.use(cookieParser());

app.use('/', require('./routes/index'));
app.use('/api/user', require('./routes/user'));
app.use('/api/userManage', require('./routes/userManage'));
app.use('/api/roleManage', function (req, res, next) {roleUtil.userPermission(req,res,next)}, require('./routes/roleManage'));
app.use('/',require('./routes/editor'))
app.use('/api/game',require('./routes/game'))
app.use('/api/type',require('./routes/type'))
app.use('/api/contract',require('./routes/contract'))

app.use(function (req, res, next) {
  next(createError(404));
});


// error handler
app.use(function (err, req, res, next) {
  console.log(err);
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: err
  });
});



var debug = require('debug')('my-application');
app.set('port', process.env.PORT || 4000); // 设定监听端口

//启动监听
var server = app.listen(app.get('port'), function () {
  debug('Express server listening on port ' + server.address().port);
  console.log(`服务启动成功,请打开 http://localhost:${process.env.PORT || 4000}`);
});




module.exports = app;