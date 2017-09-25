const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const helper = require('./helper');

const app = express();

let gift_KangJia_Num = 130;
let gift_BTSM_Num = 200;

let award = [
  {
    id: 0,
    name: '活力水星开瓶器',
    pic: 'KangJia.jpeg',
    remain: gift_KangJia_Num
  },
  {
    id: 1,
    name: '阿波罗五件套刀具',
    pic: 'BTSM.jpeg',
    remain: gift_BTSM_Num
  }];

let awardLog = [];

// view engine setup
app.set('views', path.join(__dirname, 'public'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(compression());
app.use(cookieParser());
app.use(express.static(path.resolve('public'), {extensions: ['html']}));
app.use('/statics', express.static(path.join(__dirname, 'dist')));


// wanke draw
app.get('/vanke/getAwardInfo', (req, res, next) => {
  if(award.length === 0) {
    res.status(200).send({
      error: 100,
      errMsg: '所有商品已经兑换光了'
    });
    return;
  }
  let index = Math.round(Math.random() * (award.length - 1));
  res.status(200).send({
    id: award[index].id,
    award: award[index]
  });
});

app.get('/vanke/getAward', (req, res, next) => {
  const {id} = req.query;
  const timestamp = Date.now();
  for(let i = 0; i < award.length; i++) {
    if(award[i].id == id) {
      award[i].remain --;
      let remain = award[i].remain;
      if(remain === 0) award.splice(i, 1);
      awardLog.push({
        id,
        timestamp,
        award: award[i]
      });
      res.status(200).send({
        success: true,
        remain: remain
      });
      console.log(id, remain);
      return;
    }
  }
  res.status(200).send({
    error: 101,
    errMsg: '该商品已兑换光，请重新刷新页面'
  });
});

app.get('/vanke/getAwardLog', (req, res, next) => {
  res.status(200).send({
    log: awardLog,
    award: award
  });
});

app.get('/vanke/resetAward', (req, res, next) => {
  award = [
    {
      id: 0,
      name: '活力水星开瓶器',
      pic: 'KangJia.jpeg',
      remain: gift_KangJia_Num
    },
    {
      id: 1,
      name: '阿波罗五件套刀具',
      pic: 'BTSM.jpeg',
      remain: gift_BTSM_Num
    }];

  awardLog = [];
  res.status(200).send({
    award: award
  });
});

app.get('/vanke/:name', (req, res, next) => {
  console.log(req.params.name);
  res.sendFile(`${req.params.name}.html`, {root: path.resolve('public')});
});

app.get('/blog/:name', (req, res, next) => {
  res.sendFile(`${req.params.name}.html`, {root: path.resolve('public')});
});

app.get('/json/posts', (req, res, next) => {
  const {page, tag} = req.query;
  res.set('Access-Control-Allow-Origin', '*');
  res.status(200).send({
    posts: helper.getPosts()
  });
});

app.get('/json/post', (req, res, next) => {
  const post = helper.getPost(req.query.name);
  res.status(200).send({
    post: post
  });
});

app.get('/json/tags', (req, res, next) => {
  res.status(200).send({
    tags: Object.entries(helper.getTagsData()).sort()
  });
});

app.get('/json/archives', (req, res, next) => {
  res.status(200).send({
    archives: Object.entries(helper.getPostListFromDate())
  });
});

// app.get('*', (req, res, next) => {
//   res.render('index');
// })

//catch 404 and forward to error handler
// app.use((req, res, next) => {
//   const err = new Error('Not Found');
//   err.status = 404;
//   next(err);
// });
//
// // error handler
// app.use((err, req, res, next) => {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};
//
//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });


app.listen(process.env.PORT || 3000, (err) => {
  if (err) {
    throw err;
  } else {
    console.log(`server listening on port ${process.env.PORT || 3000}`);
  }
});

module.exports = app;
