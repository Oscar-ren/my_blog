const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const helper = require('./helper');

const app = express();

app.use(function(req, res, next) {
  res.set("Access-Control-Allow-Origin", "*");
  next();
})

// view engine setup
app.set('views', path.join(__dirname, 'public'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());
app.use(cookieParser());
app.use(express.static(path.resolve('public'), { extensions: ['html'] }));
app.use('/statics', express.static(path.join(__dirname, 'dist')));


// app.get('/blog/:name', (req, res, next) => {
//   res.sendFile(`${req.params.name}.html`, {root:  path.resolve('public')});
// })
//
// app.get('/tags', (req, res, next) => {
//   res.sendFile(`tags.html`, {root:  path.resolve('public')});
// })
//
// app.get('/archives', (req, res, next) => {
//   res.sendFile(`archives.html`, {root:  path.resolve('public')});
// })
//
app.get('/json/posts', (req, res, next) => {
  const {page, tag} = req.query;
  res.status(200).send({
    posts: helper.getPosts()
  })
});

app.get('/json/post', (req, res, next) => {
  const post = helper.getPost(req.query.name);
  res.status(200).send({
    post: post
  })
});

app.get('/json/tags', (req, res, next) => {
  res.status(200).send({
    tags: Object.entries(helper.getTagsData()).sort()
  })
});

app.get('/json/archives', (req, res, next) => {
  res.status(200).send({
    archives: Object.entries(helper.getPostListFromDate())
  })
});

app.get('*', (req, res, next) => {
  res.render('index');
})

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
