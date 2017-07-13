---
{
  "title": "Redux 思想和源码解读（一）",
  "date": "2017-07-11",
  "tags": ["JavaScript", "React"]
}
---

# Redux 思想和源码解读（一）
    
> Predictable state container for JavaScript apps http://redux.js.org
    
  学习 React 也有段时间了，早就听说各种状态( state )管理工具大行其道，几个月前曾看过 Redux 官方几个例子，不明所以却没有再继续研究下去。
  前两天恰逢其会，看到一系列实现 Redux 的文章，借着这个由头仔细研读了官方文档和源码，算是对 Redux 有了一个比较深入的了解，介于网上各种资料的繁杂和讲解不够透彻，我打算写下这篇文章将我理解的 Redux 思想和实现原理娓娓道来，说的不详尽的地方，大家尽可以指出，改与不改要看我勤不勤快了。<!--more-->

## Redux 是做什么的

  redux 官方介绍是可预测的状态管理工具，希望大家不要拘泥于和 react 一起使用。

  胡子大哈的 [动手实现 Redux](http://huziketang.com/books/react/lesson30) 这系列文章讲的很好，以一个简单的例子说明了项目引入 redux 的原因。
  
  如果你写过 React 项目，一定会对这种情况感到熟悉，父组件的 `state` 属性传递给子组件做 `props`， 子组件根据 `props` 渲染视图。简单的组件嵌套应用中状态改变和 debug 都很容易，一旦子组件上加入他人写的处理层模块，或者逻辑复杂多层嵌套触发 state 变化时，debug 一些问题时就比较棘手。你很难搞清楚最后的 state 是经由哪一层组件改变的，这时只能挨个去组件内部 `console.log(this.props)`查看了。

  redux 的出现就是 react 项目组为了解决日益复杂的程序中如何管理 state 的问题而提出的，这个演变过程我没研究过，结果就是层层演进到了现在，形成一个稳定好用的版本即 Redux 。

### 怎么管理 state

  既然目的是更好的管理 state 变化和方便追踪，那就不要可以随便改变 state 了，redux 的思想是触发 state 变化加上一把锁，读取 state 加上一把锁，表面看起来较之前的使用方式复杂了许多，但你可以在锁上加一些 middleware 中间件，由于 state 被统一管理起来，你可以随意查看 state 变化、在变化前后做些自定义事件。

   这里可以引申出 redux 的三大原则：
 * 单一数据源 ( Single source of truth )
 `整个应用的 state 被统一管理在唯一对象树 store 中`
 
 * State 是只读的 ( State is read-only )
 `state 的变化只能通过触发 action 去改变`
 
 * 使用纯函数来执行修改 ( Changes are made with pure functions )
 `使用纯函数来描述 action，这里管这种函数叫做 reducer`

这里可以说说为什么改变 state 的函数叫 reducer，大家知道 Array 有个迭代方法叫 reduce，reducer 的意义和此相似，都是传入前一个值，返回一个新的值

> pure function 纯函数简单说就是传入一个固定值，无论执行多少遍返回值都不变的函数

![Redux 运行图](https://p5.ssl.qhimg.com/t014b5afa2e362ac314.png)

  用一个例子来说明 redux 的运行时序：
  初始 state 渲染按钮 ------> 点击增加按钮 ------>  调用 dispatch(IncrementAction)  ------> 
  reducer 处理 IncrementAction 返回 newState ------> 重渲染按钮

### 实例

  光看概念容易头脑不清楚，上代码
```javascript
// reducer 处理 action，返回 newState
const appReducer = (state = {}, action) => {
  switch (action.type) {
    case 'UPDATE_HEADER':
      return Object.assign({}, state, { header: action.header })
    case 'UPDATE_BODY':
      return Object.assign({}, state, { body: action.body })
    default:
      return state
  }
}

// 创建唯一 store
const store = createStore(appReducer, {
  header: 'Header',
  body: 'Body',
})

const renderHeader = () => {
  console.log('render header')
  document.getElementById('header').innerHTML = store.getState().header
}

const renderBody = () => {
  console.log('render body')
  document.getElementById('body').innerHTML = store.getState().body
}
renderHeader()
renderBody()

/* 数据发生变化 */
setTimeout(() => {
  store.dispatch({ type: 'UPDATE_HEADER', header: 'New Header' })
  store.dispatch({ type: 'UPDATE_BODY', body: 'New Body' })
}, 1000)

store.subscribe(renderHeader)
store.subscribe(renderBody)
```

这里有几个 API 之前没有提，分别是 `createStore`、`dispatch`、`subscribe`、`getState`，我简单介绍一下

* `createStore(reducer, [preloadedState], enhancer)` 创建 store 管理整个应用，返回一个 `Store` 对象，对象具有`dispatch`、`subscribe`、`getState`三个方法
* `getState` 返回应用当前的 state
* `dispatch(action)` 分发 action，改变 state 的唯一途径
* `subscribe(listener)` 添加侦听器，订阅 state 变化

上面的例子解释一下，首先创建了 store 应用容器，添加侦听器，每次 state 变化，重新渲染 Header 和 Body，1s 后派发更新事件，UI 改变。

可以看到没有在 1s 后直接改变 Header 和 Body 的 innerHTML，而是通过 appReducer 处理 action 里的内容，返回新的 state，这样做的好处是改变 state 只能通过 dispatch 方法，如果有意外情况发生，可以去查找哪个地方调用了 dispatch，同时还可以细分 action.type 更好的定位问题。

> 有没有感觉只是把简单问题复杂化了？看起来就是这样，操作的门槛提高了，才不会导致 state 滥用

### 复杂问题简单化
从上面的例子可以看出，经由 redux 处理后的应用，若想监听 state 变化都要 subscribe 注册，未免有些麻烦，同时，每次 dispatch action，所有 subscribe 过的组件都会重新渲染，浪费了性能，一种做法是在组件内部做 state 的简单判断，react 可以用 `shouldComponentUpdate()` 方法，或者继承自 `React.PureComponent`

为了节省工具使用人员的时间和提高性能，不同框架和 redux 的结合工具应运而生，比如 react 的 react-redux，这个我们下次再讲。

### 怎么实现一个 Redux

现在来总结一下，如果要我们手写一个 redux 需要写些什么

```javascript
// 创建 store
const createStore = (reducer, preloadedState, enhancer) = {
    // 执行中间件，俗称钩子
    enhancer()
	const getState = () => {}
	const dispatch =(action) => {reducer(action)}
	// 返回 unsubscribe 函数
	const subscribe = (func) => {return unsubscribe = () => {}}
	return {getState, dispatch, subscribe}
}

// 钩子中间件
const applyMiddleware = () => {}
```

主要逻辑就是这两个函数，看起来功能也非常简单直观，这就是 Redux 做的事情，下一节我们详细分析一下 redux 的源码