---
{
  "title": "Redux 思想和源码解读（二）",
  "date": "2017-07-11",
  "tags": ["JavaScript", "React"]
}
---

# Redux 思想和源码解读（二）

> Predictable state container for JavaScript apps http://redux.js.org

  学习 React 也有段时间了，早就听说各种状态( state )管理工具大行其道，几个月前曾看过 Redux 官方几个例子，不明所以却没有再继续研究下去。
  前两天恰逢其会，看到一系列实现 Redux 的文章，借着这个由头仔细研读了官方文档和源码，算是对 Redux 有了一个比较深入的了解，介于网上各种资料的繁杂和讲解不够透彻，我打算写下这篇文章将我理解的 Redux 思想和实现原理娓娓道来，说的不详尽的地方，大家尽可以指出，改与不改要看我勤不勤快了。<!--more-->

## 源码解析

毕竟本文不是入门教程，主要的目的还是通过阅读源码提高自己的架构能力，所以，直入正题啦，先看 github 目录。
![Redux 代码结构](https://p0.ssl.qhimg.com/t01f8719bfc8566d4c5.png)

redux 代码量非常少，不压缩才 2K 而已，核心方法只有 5 个，其中还有大量的类型检测，通读下来简单易懂（万万没想到，各种衍生工具代码量指数倍上涨）

咱们从基础方法开始。

### createStore

下面是我精简过的 creatStore 源码，官方还有 obervable 观察器相关代码，因为我从未使用过暂时省略。

```javascript
/**
 * Creates a Redux store that hold the state tree
 * @param {Function} reducer
 * @param {any} [preloadedState]
 * @param {Function} [enhancer]
 * @returns {Store}, you can dispatch actions to change state, read the state and subscribe to change
 */
const createStore = (reducer, preloadedState = {}, enhancer) => {

  // 一堆类型检测
  if(typeof reducer !== 'function') {
    throw new Error('Expected the reducer to be a function.');
  }

  if(typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
    enhancer = preloadedState;
    preloadedState = undefined;
  }

/**
 * enhancer 处理中间件
 * ... 暂时省略，讲 applyMiddleware 方法的时候再说
 */

  let currentState = preloadedState;
  let currentListeners = [];
  let nextListeners = currentListeners;
  let isDispatching = false

  // dispatch 的时候需使用侦听器副本，防止 unsubscribe 时打乱侦听器数组顺序
  // 侦听器的改变均反映在 nextListeners 里
  // dispatch 调用时更新 currentListeners
  // 即，每次侦听器要改变时使用当前侦听器副本 currentListeners.slice() ，改变副本值，dispatch 时再赋给 currentListeners
  const ensureCanMutateNextListeners = () => {
      if(nextListeners === currentListeners) {
        nextListeners = currentListeners.slice();
      }
  }

  const getState = () => currentState;

  const dispatch = (action) => {
    
    if(!action || typeof action !== 'object') {
      throw new Error('Expected the action to be a object.');
    }
    if(typeof action.type === 'undefined') {
      throw new Error('Actions may not have "type" property.');
    }

    if (isDispatching) {
      throw new Error('Reducers may not dispatch actions.')
    }

    // 得到 newState
    try {
      isDispatching = true
      currentState = reducer(currentState, action)
    } finally {
      isDispatching = false
    }

    // 更新 currentListeners
    let listeners = currentListeners = nextListeners;
    // for 循环比 forEach 性能好
    // (https://github.com/reactjs/redux/commit/5b586080b43ca233f78d56cbadf706c933fefd19)
    for(let i = 0; i < listeners.length; i++) {
      let listener = listeners[i];
      listener();
    }

    // 此处返回 action，方便链式调用
    return action;
  }

  // 典型的注册侦听模式
  const subscribe = (listener) => {
    if(typeof listener !== 'function') {
      throw new Error('Expected the listener to be a function.');
    }

    let isSubscribed = true;
    // 改变侦听器前使用 currentListeners 副本
    ensureCanMutateNextListeners();
    nextListeners.push(listener);

    return function unsubscribe() {

      if(!isSubscribed) return;
      isSubscribed = false;
      // 改变侦听器前使用 currentListeners 副本
      ensureCanMutateNextListeners();
      const index = nextListeners.indexOf(listener);
      nextListeners.splice(index, 1);
    }
  }

  // 简单替换，替换后初始化 state
  const replaceReducer = (newReducer) => {
    if(typeof newReducer !== 'function') {
      throw new Error('Expected the reducer to be a function.');
    }

    reducer = newReducer;
    dispatch({type: '@@redux_init'});
  }

  // 初始化 state
  // 需要 action 有默认 state
  dispatch({type: '@@redux_init'});

  return {getState, dispatch, subscribe, replaceReducer};
}
```

这部分代码初看时，有两处让我疑惑，一是使用 for 代替 forEach，二是引入 currentListeners 和 nextListeners，经过查看代码的 History、PR 后才了解作者的意图。

for 代替 forEach 纯粹是出于性能考虑，这有个[例子](https://jsperf.com/quick-for-vs-foreach) 可以看出，forEach 慢的不是一星半点。

之所以引入 currentListeners 和 nextListeners 变量就是因为解决采用 for 循环引起的问题。

比如有数组 [1, 2, 3, 4, 5]，当执行到 i == 1 的时候调用 unsubscribe 删除了数组第一项 1，下一次循环时从 i == 2，也就是从 4 开始执行响应逻辑，导致跳过了 3 这个值。为了解决这个问题，每次 dispatch 的时候都应该调用 listeners 的副本，大家可以看下这段代码的 history：

```javascript
// 最开始替换 for 循环时的代码
var currentListeners = listeners.slice()
for (var i = 0; i < currentListeners.length; i++) {
  currentListeners[i]()
}
```

这样做会导致每次执行 dispatch 方法时都会复制一份 listeners，存在很大的浪费，我们只需要在 listeners 确实改变的时候获取副本就可以了，所以将 slice 操作放到 subscribe 方法中。

### combineReducers

这里我删除了环境判断和错误警告语句

```javascript
/**
 * combine reducers, return the state pass the each reducer
 * reducers key is the state key
 * @param reducers
 * @returns {Function}
 */
const combineReducers = (reducers) => {

  // 先进行健全检查
  const reducerKeys = Object.keys(reducers)
  const finalReducers = {}
  for (let i = 0; i < reducerKeys.length; i++) {
    const key = reducerKeys[i]
    if (typeof reducers[key] === 'function') {
      finalReducers[key] = reducers[key]
    }
  }
  const finalReducerKeys = Object.keys(finalReducers)

  return function combination(state = {}, action) {
    let nextState = {};
    let hasChanged = false;

    for(let i = 0; i < finalReducerKeys.length; i++) {
      const key = finalReducerKeys[i];
      const reducer = finalReducers[key]
      const previousStateForKey = state[key];
      // 得到 newState
      const nextStateForKey = reducer(previousStateForKey, action)
      nextState[key] = nextStateForKey
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey
    }

    return hasChanged ? nextState : state;
  }
}
```

combineReducers 的代码很简单，作用就是拆分 Reducers，使用最终的 stateKey 作为 combineReducers 参数对象的 key，参数对象的值为 stateKey 对应的 stateReducer。

举个例子：

```javascript
const reducer = combineReducers({
  a: doSomethingWithA,
  b: processB,
  c: c
})

// 等于
function reducer(state = {}, action) {
  return {
    a: doSomethingWithA(state.a, action),
    b: processB(state.b, action),
    c: c(state.c, action)
  }
}
```

这块有个问题，为什么写了一大段 for 循环去处理 `finalReducers`，我们明明可以很方便的拷贝 reducers 如 `const finalReducers = Object.assign({} ,reducers);`，再把类型判断放到下面的执行函数中，节省好多行代码。

抱着这样的疑问我提了个 issue，作者告诉我这属于他们团队开发的一个规范，在执行真正的处理逻辑之前做完所有的健全性检查，保证处理逻辑的功能单一。

### bindActionCreators

有一种函数叫做 actionCreator，传递参数后返回一个 action，比如

```javascript
const addTodo = (todo) = {
  type: 'ADD',
  value: todo
}
```

在应用中需要添加新 action 的时候，需要先 `addTodo(string)` 再 `dispatch(action)`，每次这么写太麻烦，所以官方提供了bindActionCreators方法，这只是一个`dispatch(actionCreator(param))`的语法糖。

同时此方法可以合并多个actionCreator，便于向子组件传递，省的每个子组件都要一一引入相同 actionCreator 或者父组件传递一堆 actionCreator，简言之就是一个工具函数。

```javascript
function bindActionCreator(actionCreator, dispatch) {
  return (...args) => dispatch(actionCreator(...args))
}

/**
 * Target is pass some action creators down to a component
 * @param {Function | Object} actionCreators
 * @param {Function} dispatch
 * @returns {Function|Object}
 */
const bindActionCreators = (actionCreators, dispatch) => {
  if(typeof actionCreators === 'function') {
    return bindActionCreator(actionCreators, dispatch);
  }

  if(typeof actionCreators !== 'object' || actionCreators === null) {
    throw new Error('actionCreator expected  an object or a function.');
  }

  const keys = Object.keys(actionCreators);
  let boundActionCreators = {};
  for(let i = 0; i< keys.length; i++) {
    const key = keys[i];
    const actionCreator = actionCreators[key];
    if(typeof actionCreator === 'function') {
      boundActionCreators[keys] = bindActionCreator(actionCreator, dispatch);
    }
  }

  return boundActionCreators;
}
```

参数是 actionCreators 对象，返回一个包装过的对象，对象中每个 key 的值是 `dispatch(key(param))`的函数。

### compose

这也是一个工具函数，主要用于装配中间件，大家可以拿出去当作自己的常备工具库。

```javascript
/**
 * compose many function deal with dispatch
 * @param funcs
 * @returns {*}
 */
const compose = (...funcs) => {
  // 两种特殊情况
  if(funcs.length == 0) {
    return args => args;
  }

  if(funcs.length == 1) {
    return funcs[0];
  }
  return funcs.reduce((a, b) => (...args) => a(b(...args)));
}
```

利用 `Array.prototype.reduce`方法，包洋葱式处理参数，也算是一种链式调用。

### applyMiddleware

中间件函数，基于 redux 的很多库都是利用这个机制，在 dispatch 函数的执行前后挂上钩子，这种中间件的做法已经很常见了，比如 Express 和 koa。

我们先分析一下如何给我们的 Redux 挂上中间件，我们想要的是控制 state 变化前后，也就是 dispatch 方法前后执行自定义的方法，一种方式是

```javascript
for(key in middlewares)
{
  middlewares[key](action)
}
dispatch(action)
```

这种方法每个 middleware 互不影响，也无法共同合作，还有一种就是

```javascript
middleware3(middleware2(middleware1(dispatch))))(action)
```

每个中间件处理上一个中间件处理后的结果，像是管道流通，每部分管道只要保证能把最初的 action 传下去就可以了，管道之间可以合作和拆分，是比较流行的中间件处理方法。Redux 采用的是后一种方法。

```javascript
/**
 * load middleware
 * applyMiddleware() can as an enhancer
 * @param middlewares
 * @returns {function()}
 */
const applyMiddleware = (...middlewares) => {
  return (createStore) => (reducer, preloadedState, enhancer) => {
    // 只改变 dispatch 函数
    const store = createStore(reducer, preloadedState, enhancer);
    let dispatch = store.dispatch;
    let chain = [];

    // 将 getState 和 dispatch 方法暴露给中间件
    const middlewareAPI = {
      getState: store.getState,
      dispatch: (action) => dispatch(action)
    }

    chain = middlewares.map((middleware) => middleware(middlewareAPI));
    // 相当于 middleware3(middleware2(middleware1(dispatch))))
    dispatch = compose(...chain)(dispatch);

    return Object.assign(
      {},
      store,
      {dispatch: dispatch}
    )
  }
}
```

从源码中可以看出，经由 applyMiddleware 处理过的 store 只改变了 dispatch 方法，当调用 dispatch 方法时，会逐步调用中间件函数，最后一个中间件再调用 Redux 原生的 dispatch 方法

这样一来，便对中间件函数的格式有所要求，中间件的格式需如下

  ```javascript
const middleware = (middlewareAPI) => (dispatch) = (action) => { 
  /* code */ 
  dispatch(action)
  // 作为下一个中间件的 action 参数
  return action
}
  ```

举一个例子，我们想在每次状态变化时打印出变化前后的 log

```javascript
function printStateMiddleware(middlewareAPI) => (dispatch) => (action) => {
      console.log('state before dispatch', middlewareAPI.getState())
      const returnValue = dispatch(action)
      console.log('state after dispatch', middlewareAPI.getState())
      return returnValue
    }
  }
}

// 调用
const store = createStore(reducers, applyMiddleware(printStateMiddleware))
```

中间件已经定义出来了，`Store` 该怎么应用这些中间件呢，不知道大家注意到没有，`applyMiddleware` 返回函数的参数是 `creatStore`，此函数返回一个加载中间件后的 `Store`

 这也就是讲 `createStore` 函数时所省略的 `enhancer` 处理部分，相关代码如下：

```javascript
if (typeof enhancer !== 'undefined') {
    if (typeof enhancer !== 'function') {
      throw new Error('Expected the enhancer to be a function.')
    }

    return enhancer(createStore)(reducer, preloadedState)
  }
```

`enhancer` 函数就是 `applyMiddleware` 函数调用后返回的函数，经过 enhancer 函数处理后返回增强后的 Store，其他方法属性均不变，这样，我们就实现了加载中间件。

## 处理异步请求和 Redux 相关

笔者尝试做一些归纳，redux 的思想是统一管理 state 变化，至于怎么变化全交给 action，而 reducer 用于组装 newState。真正的业务逻辑不关心数据来源和改变方式，只是发出自己想要的改变指令(diapatch)和根据数据渲染UI视图。

这样就有一个问题，如果我的数据源是异步来的（这很正常），那我发请求的方法写在哪里呢，想要做到数据处理和视图分离，数据变化交给 action，可是异步请求给了 action 拿不到返回值，我想要的是 `async().success(dispatch(action))`,这就需要中间件来帮忙了，基本的 redux 只能实现同步 action 改变，异步的解决方案流行的有 [redux-thunk](https://github.com/gaearon/redux-thunk) 和 [redux-saga](https://github.com/redux-saga/redux-saga)

redux-thunk 十分轻量，代码只有14行

```javascript
function createThunkMiddleware(extraArgument) {
  return ({ dispatch, getState }) => next => action => {
    if (typeof action === 'function') {
      return action(dispatch, getState, extraArgument);
    }

    return next(action);
  };
}

const thunk = createThunkMiddleware();
thunk.withExtraArgument = createThunkMiddleware;

export default thunk;
```

原理简单的令人发指，action 可以为函数，如果是异步函数，等到异步请求回来后再执行 dispatch，目前有 5755 个 star！！！

redux-saga 体量比较大，thunk 虽然源代码很简单，但需要使用者配合着去修改 action 为函数，saga 则是自己实现一套逻辑处理异步请求，saga 笔者还没有掌握，就不在这里班门弄斧了。

看懂了源代码并不意味着完全掌握，笔者在研读官方例子时深有体会，所以在这里也建议大家配合官方demo继续深入学习。



## 总结

至此，我们已经将 redux 源码全都堵读了一遍，笔者在其中省略了一些环境判断和错误处理，有兴趣的同学可以去[redux Github](https://github.com/reactjs/redux)上看完整版，redux 的代码如此简洁，初次看完后的我表示相当震惊，这还是我几个月都不明所以的高大上库吗，原来只是不敢去面对而已。

redux 的衍生库相当多，笔者正在研究 react-redux，在学习过程中又听说了 mobx 状态管理工具，深感学习路线之繁杂和曲折，路漫漫其修远兮，我将上下而求索，期待下一篇产出。

本文多参考于[官方文档](http://redux.js.org/)、胡子大哈的文章[动手实现 Redux](http://huziketang.com/books/react/lesson30)和[kenberkeley](https://github.com/kenberkeley)的[Redux 进阶教程](https://github.com/kenberkeley/redux-simple-tutorial/blob/master/redux-advanced-tutorial.md)，感谢