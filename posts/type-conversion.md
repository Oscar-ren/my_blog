---
{
  "title": "JavaScript 类型转换",
  "date": "2016-12-09",
  "tags": ["JavaScript"]
}
---

# JavaScript 类型转换

从原理上讲一下 `javascript` 的隐式类型转换，10分钟学会类型判断原理。 <!--more-->

#### 内置七种基本类型

- null
- undefined
- boolean
- number
- string
- object
- symbol

`typeof`返回的是类型的字符串值，但是`null`是例外，`typeof null === 'object'`，这是个`bug`

`typeof function`的返回值也不是基本类型的字符串值，是因为`function`是`object`的一个子类型
```javascript
typeof function a(){} === 'function';   //true
```
详情见[typeof 规范](http://es5.github.io/#x11.4.3)

![typeof.png](https://p0.ssl.qhimg.com/d/inn/ad0dcf1f/typeof.png)


#### 位运算符

位运算符要求的是32位整数，小数位和超过32位的整数位忽略

- `|`按位或运算符可以将小数转换成整数`a | 0`，不过要注意整数不能超过32位

- `~`按位非运算符将操作数所有位取反，在`javascript`中相当于`-(x+1)`

```javascript
//5 二进制 101，补满 32位
00000000000000000000000000000101
//按位取反
11111111111111111111111111111010
//由于32位开头第一个是1，所以这是一个负数，将二进制转换成负数，需要先反码
00000000000000000000000000000101
//之后，再+1
00000000000000000000000000000110
//转换成十进制为6，加上符号变成负数 -6
```
一个应用是`~-1 == 0`可以替换

```javascript
if(arr.indexOf('a') > -1) {}

if(~arr.indexOf('a')) {
	//有值
}
```
`~~a`也可以将a取整

#### 一元运算符

- `+`运算符把操作数转换成数字
- `-`运算符把操作数转换成数字再改变结果的符号

```javascript
//涉及到类型转换，下面讲
+[]; //0
+'42'; //42
//++ --会被识别为运算符，所以使用时要加空格
5 + +'3'; //8
```

### 类型转换
基础概念就不写了，直接来容易迷糊的`and`原理，抛几个问题
```javascript
[] == ![]; //true
"0" == ""; //false
"" == 0; //true
"foo"  == ["foo"]; //true
```

#### ToPrimitive
首先介绍一下es内部抽象操作[`ToPrimitive`](http://es5.github.io/#x9.1)，它的作用是将输入转换成非对象类型数据，最后的返回值是基本类型值，或者抛错
> The abstract operation ToPrimitive takes an input argument and an optional argument PreferredType. The abstract operation ToPrimitive converts its input argument to a non-Object type. 


![Paste_Image.png](https://p2.ssl.qhimg.com/d/inn/7b76ffe6/ToPrimitive.png)

`ToPrimitive`转换对象的时候调用`[[DefaultValue]]`内部方法，可带一个参数`hint`，代表如果这个对象可以转成多种基本类型值，我们把它转成哪种，默认是`Number`

`[[DefaultValue]]`的转换办法是
- `hint`是`String`的话先看有没有`toString`方法，有调用`toString`，如果是基本类型值则返回，否则看有没有`valueOf`方法，有调用`valueOf`，是基本类型值返回，不是的话抛`TypeError`错误
- `hint`是`Number`的话则是先看`valueOf`方法，后看`toString`方法
- 没有`hint`参数则按`Number`的规则转，`Date`对象例外，用`String`转

#### 字符串和数字之间的隐式强制类型转换

```javascript
var a = [1,2];
var b = [3,4];

a + b; //'1,23,4'
```

`+` 加号转换原则简单说就是某个操作数是字符串，或者可以通过`ToPrimitive`转成字符串，那就执行字符串拼接操作，否则进行数字加法。

`[1,2]`是个对象，调用内部的`[[DefaultValue]]`方法，`valueOf`方法得到的是`[1,2]`不是基本类型值，调用`toString`得到字符串`'1,2'`，`[3,4]`同理，最后执行字符串拼接得到`'1,23,4'`

**疑惑**
```javascript
[] + {}; //"[object Object]"
{} + []; //0
```
这里先说一下后者，因为`{}`在javascript里被识别为代码块，自己就执行了，所以`{} + []`被解析成`+ []`，这里的`+`是一元运算符，将`[]`转换成数字，也就是通过`ToPrimitive`得到字符串`""`，转成数字为`0`
前者被解析成了字符串拼接，`""`+`[object Object]`

#### 宽松相等和严格相等
> “ ==允许在相等比较中进行强制类型转换，而 === 不允许”

规范里算法很多，挑几个代表性的
##### 一、Number Compare String
![Paste_Image.png](https://p5.ssl.qhimg.com/t0116760129d3211811.png)

##### 二、Boolean Compare with other
![Paste_Image.png](https://p2.ssl.qhimg.com/t01655fc1603510c153.png)

##### 三、Object Compare with String or Number
![Paste_Image.png](https://p3.ssl.qhimg.com/t01fca09e489bcddf09.png)

##### 四、null == undefined

现在来看一下之前提出的几个问题
```javascript
//![]转换成boolean值为0,[] == 0，[]根据规则进行ToPrimitive([]),得到"" == 0,再转成 ToNumber("") == 0
[] == ![]; //true

//字符串比较
"0" == ""; //false

//ToNumber("") == 0
"" == 0; //true

//ToPrimitive(["foo"]) == "foo"
"foo" == ["foo"]; //true
```

### 收获

明白了隐式类型转换规则，平时写代码的时候也要注意，不要写容易让别人困惑的代码；
最大的收获是查官方规范，看别人的博客太麻烦了，这里讲的不清楚，那里讲的模模糊糊，直接看规范，一看就懂了。