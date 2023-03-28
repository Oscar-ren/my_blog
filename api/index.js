const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const helper = require('../helper');

const index = express();

// view engine setup
index.set('views', path.join(__dirname, 'public'));
index.engine('html', require('ejs').renderFile);
index.set('view engine', 'html');

//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
index.use(logger('dev'));
index.use(bodyParser.json());
index.use(bodyParser.urlencoded({extended: false}));
index.use(compression());
index.use(cookieParser());
index.use(express.static(path.resolve('public'), {extensions: ['html']}));
index.use('/statics', express.static(path.join(__dirname, '../public')));

index.get('/blog/:name', (req, res, next) => {
  res.sendFile(`${req.params.name}.html`, {root: path.resolve('public')});
});

index.get('/json/posts', (req, res, next) => {
  const {page, tag} = req.query;
  res.set('Access-Control-Allow-Origin', '*');
  res.status(200).send({
    posts: helper.getPosts()
  });
});

index.get('/json/post', (req, res, next) => {
  const post = helper.getPost(req.query.name);
  res.status(200).send({
    post: post
  });
});

index.get('/json/tags', (req, res, next) => {
  res.status(200).send({
    tags: Object.entries(helper.getTagsData()).sort()
  });
});

index.get('/json/archives', (req, res, next) => {
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


index.listen(process.env.PORT || 3000, (err) => {
  if (err) {
    throw err;
  } else {
    console.log(`start local server`);
  }
});

module.exports = index;
