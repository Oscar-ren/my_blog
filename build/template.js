const template = ({title, state, staticString}) => (
  `<!doctype html>
<html lang="zh-cmn-Hans">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="x-ua-compatible" content="ie=edge">
  <meta http-equiv="keywords" content="任祥磊,rxl">
  <meta name="description" content="任祥磊的博客，写写技术和生活，日子不能过的一尘不变">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  <title>${title}</title>
  <link href="https://fonts.googleapis.com/css?family=Raleway:400,400i,700,700i" rel="stylesheet">
  <link href="/statics/app.css" rel="stylesheet">
  <!--[if lt IE 10]>
  <script src="https://cdn.bootcss.com/html5shiv/3.7.3/html5shiv.min.js"></script>
  <![endif]-->
  <!--[if lte IE 8]>
  <script>
      document.documentElement.className = 'ie8';
  </script>
  <script src="/lib/es5-shim.min.js"></script>
  <script src="/lib/es5-sham.min.js"></script>
  <script src="/lib/json3.min.js"></script>
  <script src="/lib/respond.js"></script>
  <![endif]-->
  <!--[if IE]>
  <script>
      if (!window.location.origin) \{
          window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '');
      }
  </script>
  <![endif]-->
  <script src="https://cdn.polyfill.io/v2/polyfill.min.js?features=Object.assign,Promise,fetch,Map,WeakMap,Set&flags=gated"></script>
  <script>
//    if ('serviceWorker' in navigator) {
//        navigator.serviceWorker.register('/sw.js').then(function(registration) {
//          console.log('ServiceWorker registration successful with scope: ',    registration.scope);
//        }).catch(function(err) {
//          console.log('ServiceWorker registration failed: ', err);
//        });
//     }
     var __INITIAL_STATE__ = ${JSON.stringify(state)}
  </script>
</head>
<body>
  <div id="root">${staticString}</div>
  <script src="/statics/manifest.js"></script>
  <script src="/statics/vendor.js"></script>
  <script src="/statics/app.js"></script>
  <script src="https://s19.cnzz.com/z_stat.php?id=1262801421&web_id=1262801421" language="JavaScript"></script>
</body>
</html>`
);

export default template;
