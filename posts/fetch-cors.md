---
{
  "title": "学习记录 Fetch API mode 跨域模式",
  "date": "2017-07-13",
  "tags": ["JavaScript"]
}
---

# 学习记录 Fetch API mode 跨域模式

  之前给自己的博客站添加了 Service Worker 服务，其中涉及到请求跨域资源，参考的[资料](https://www.w3ctech.com/topic/866#fetch-)有讲，对于跨域的资源可以加上参数 `fetch(url, {mode: 'cors'})`，代表跨域请求，但是昨天在引入第三方统计服务时报错该资源不允许跨域，一头雾水的我决定好好研究一下这个问题究竟是怎么回事<!--more-->

## 参数的默认值

  容易记混 mode 属性的默认值，特地记录一下：

![fetch](https://ws3.sinaimg.cn/large/006tKfTcly1fhibgv5le5j312i0f4jtn.jpg)


  Fetch 请求的第一个参数可以是 Request 对象，也可以是 URL 字符串，如果是字符串，mode 的默认参数是 no-cors

```javascript
fetch(url)
// 相当于
fetch(url, {mode: 'no-cors'})
```

而如果第一个参数是 Request，这里存在一种情况是在 Request 对象里声明 mode 属性值，这里的属性值默认是 cors

```javascript
fetch(new Request(url))
// 相当于
fetch(new Request(url, {mode: 'cors'})) // 这里的 cors 优先级比 fetch 的默认值 no-cors 高
```

根据 [Fetch 草案](https://fetch.spec.whatwg.org/#concept-filtered-response-opaque), Fetch mode 属性有 5 个值，分别是 `same-origin`, `cors`, `no-cors`, `navigate`, 和 `websocket`，我主要研究了一下 `same-origin`, `cors`, `no-cors`这三个

* `same-origin`：同域，设置此属性值请求跨域资源报错
* `cors`：允许跨域请求，不过需要服务端设置 `Access-Control-Allow-Origin: * `，如果服务端没有设置会报错

![5D5742D0-82F7-4DB8-B47A-8B370831D47B](https://ws3.sinaimg.cn/large/006tNc79ly1fhibhfm0v1j30wo044wg3.jpg)

* `no-cors`:  不允许跨域，请求跨域资源会返回一个 opaque 的 response 对象，没法根据返回值判断请求是否成功，js 不能操作 response 对象，否则会报错

![no-core response](https://ws1.sinaimg.cn/large/006tKfTcly1fhidro8s2rj30wo01cmxl.jpg)


## 使用

  所以像我最上面碰到的问题，请求的第三方资源不允许跨域，我们就需要设置 **fetch 的 mode 属性为 no-cors**。

  研究到这里的时候我彻底蒙圈了，不能访问 response，那我怎么加载第三方文件，跨域请求数据？那我是怎么成功加载的？不是说不能访问吗？jsonp？

  然而，Fetch 不支持 jsonp 请求，jQuery 的 ajax 方法是集成了 jsonp 请求方式，如果想要 fetch 也支持 jsonp 需要再封装一下。

  带着疑问搜到一个 [Service Worker 官方的跨域例子](https://demo.service-worker.org/cors-fetch/)，读了一下测试代码，原来 Service Worker 中的 fetch 请求虽然不能访问跨域资源 response，但是可以[通过 respondWith() 方法抛给前端主线程去处理](https://www.w3.org/TR/2014/WD-service-workers-20140508/#h1-x-origin-resources)，大哭，原来症结在这里，w3c 官方规定。。。。

```javascript
temp.html
$.ajax({url: url, dataType: 'jsonp', jsonpCallback: 'cb'})
  .then(function(data) {
  $('#result').text(JSON.stringify(data, null, 4))
})
  .catch(function(data) {
  $('#result').text('Error occurred, checkout the Console!')
})
```

  官方例子中主线程采用的是 ajax jsonp 请求，即使是请求不支持跨域的跨域资源，返回了不透明的 response，还是可以通过 Service Worker 的 respondWith 方法抛给前端，按正常 ajax jsonp 的处理方式处理请求返回，这里感觉 Service Worker 只是做了中间件的作用，拿到这个请求返回值自己不能读取，但是可以缓存。

## 总结

  这篇文章主要是给自己提个醒，下回忘记了再回来看看，很多细节的地方依然不求甚解，有待补充。
