var CACHE_NAME = 'rxl-blog-v1';
var urlsToCache = [
  '/',
  '/style.css',
  '/vendor.js',
  '/app.js'
];

var ignoreFetch = [
  /\.png/,
  /\.jpg/,
  /fonts.googleapis.com/,
  /cdn.polyfill.io/,
  /vendor.js/,
  /cdn.bootcss.com/,
  /s19.cnzz.com/
]

function shouldAlwaysCache (url) {
  return ignoreFetch.some(function(regex) {
    return url.match(regex)
  })
}

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache)
      })
      .then(() => self.skipWaiting())
  );
});


self.addEventListener('fetch', event => {

  // should only intercept GET requests
  if (event.request.method !== 'GET' || event.request.url.includes('hot-update') || event.request.url.includes('sockjs-node')) {
    return event.respondWith(fetch(event.request));
  }

  return event.respondWith(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.match(event.request)
        .then(function (response) {

          if(response && shouldAlwaysCache(event.request.url)) return response;

          var fetchPromise = fetch(event.request).then(function(networkResponse) {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          })
          return response || fetchPromise;

        }).catch(function() {
          console.log("no cache and can't fetch " + event.request.url);
        })
    })
  );
});


self.addEventListener('activate', event => {

  var cacheWhitelist = ['v1'];

  event.waitUntil(
    caches.keys()
      .then(function (cacheNames) {
        return Promise.all(
          cacheNames.map(function (cacheName) {
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener('error', event => {
  // 上报错误信息
  // 常用的属性：
  // event.message
  // event.filename
  // event.lineno
  // event.colno
  // event.error.stack
})
self.addEventListener('unhandledrejection', event => {
  // 上报错误信息
  // 常用的属性：
  // event.reason
})

