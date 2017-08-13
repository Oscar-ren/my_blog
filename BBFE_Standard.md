# BBFE 团队 JS 编码规范（初稿）

## 参考自 Javascript Standard 和 Airbnb JS Style Guide

- [JavaScript Standard Style](https://standardjs.com/rules-zhcn.html) 
- [Airbnb JS Style Guide](https://github.com/airbnb/javascript)

规范主要来自 Javascript Standard Style，Airbnb 规范作为补充。

> 请先看 [JavaScript Standard Style](https://standardjs.com/rules-zhcn.html) ，下面是补充说明

### 规范补充

- 语句块后使用分号。(按照 Airbnb 规范)
```js
window.alert('hi')    // ✗ avoid
window.alert('hi');   // ✓ ok 
```
- 多行注释用 /** ... */
- 单行注释用 //
- 使用 //FIXME 标明问题
```js
class Calculator extends Abacus {
  constructor() {
    super();

    // FIXME: shouldn’t use a global here
    total = 0;
  }
}
```
- 使用 //TODO 注释要去解决的问题
```js
class Calculator extends Abacus {
  constructor() {
    super();

    // TODO: total should be configurable by an options param
    this.total = 0;
  }
}
```

### es6 推荐用法
> airbnb 规范多是 es6 代码更优书写方式，推荐但不做强制要求
- 使用模板字符串拼接字符串，而不是 + 号
```js
// bad
function sayHi(name) {
  return 'How are you, ' + name + '?';
}

// bad
function sayHi(name) {
  return ['How are you, ', name, '?'].join();
}

// bad
function sayHi(name) {
  return `How are you, ${ name }?`;
}

// good
function sayHi(name) {
  return `How are you, ${name}?`;
}
```
- 使用方法和属性缩写
```js
// bad
const atom = {
  value: 1,

  addValue: function (value) {
    return atom.value + value;
  },
};

// good
const atom = {
  value: 1,

  addValue(value) {
    return atom.value + value;
  },
};
```
```js
const lukeSkywalker = 'Luke Skywalker';

// bad
const obj = {
  lukeSkywalker: lukeSkywalker,
};

// good
const obj = {
  lukeSkywalker,
};
```
- [使用命名函数表达式而不是函数声明](https://github.com/airbnb/javascript/issues/794)
```js
// bad
function foo() {
  // ...
}

// bad
const foo = function () {
  // ...
};

// good
const foo = function bar() {
  // ...
};
```
- 函数默认参数避免副作用
```js
var b = 1;
// bad
function count(a = b++) {
  console.log(a);
}
count();  // 1
count();  // 2
count(3); // 3
count();  // 3
```
- 默认参数写在最后
```js
// bad
function handleThings(opts = {}, name) {
  // ...
}

// good
function handleThings(name, opts = {}) {
  // ...
}
```
- 总是使用 class，避免直接使用 prototype
- 方法总是返回 this，以便链式调用
```js
// bad
Jedi.prototype.jump = function () {
  this.jumping = true;
  return true;
};

Jedi.prototype.setHeight = function (height) {
  this.height = height;
};

const luke = new Jedi();
luke.jump(); // => true
luke.setHeight(20); // => undefined

// good
class Jedi {
  jump() {
    this.jumping = true;
    return this;
  }

  setHeight(height) {
    this.height = height;
    return this;
  }
}

const luke = new Jedi();

luke.jump()
  .setHeight(20);
```
- 不要使用空的 constructor 函数
```js
// bad
class Jedi {
  constructor() {}

  getName() {
    return this.name;
  }
}

// bad
class Rey extends Jedi {
  constructor(...args) {
    super(...args);
  }
}

// good
class Rey extends Jedi {
  constructor(...args) {
    super(...args);
    this.name = 'Rey';
  }
}
```
- 使用箭头函数而不是保存 this 引用
```js
// bad
function foo() {
  const self = this;
  return function () {
    console.log(self);
  };
}

// bad
function foo() {
  const that = this;
  return function () {
    console.log(that);
  };
}

// good
function foo() {
  return () => {
    console.log(this);
  };
}
```


## 项目中的使用

使用 eslint 进行代码检查，规范中的要求都配置在 .eslintrc 文件内。

先安装 standard 规范 npm 包
> npm install --save-dev eslint-config-standard eslint-plugin-standard eslint-plugin-promise eslint-plugin-import eslint-plugin-node

然后再项目根目录添加 .eslintrc 文件如下
```js
{
  "extends": "standard",

  "rules": {
    "semi": ["error", "always"],
    "object-shorthand": ["error", "always", { "avoidQuotes": true }],
    "prefer-template": "error",
    "no-useless-constructor": "error"
  }
}
```

在项目 package.json 中配置检查脚本
```js
"test": "eslint --fix src/**"
```
添加`--fix`参数会修复大部分代码书写规范问题，修复完错误后添加代码，提交到代码库即可

## 配合 .editorconfig 文件

[EditorConfig](http://editorconfig.org/)是一个文件格式化工具，具体说明请看官网，添加该文件可以批量格式化代码，适用于不同平台开发者共同使用。

```python
# EditorConfig is awesome: http://EditorConfig.org

# top-most EditorConfig file
root = true

# Unix-style newlines with a newline ending every file
# 指定文件编码格式
[*]
charset = utf-8
end_of_line = lf
trim_trailing_whitespace = true
insert_final_newline = true

# 2 space indentation
indent_style = space
indent_size = 2
tab_width = 2
```