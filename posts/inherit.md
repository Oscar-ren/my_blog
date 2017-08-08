---
{
  "title": "JavaScript 继承",
  "date": "2017-05-18",
  "tags": ["JavaScript", "ES6"]
}
---

# JavaScript 继承

总结一下 `js` 的继承方式，ES2015 之前的我直接列出来两种成熟方案，发展过程就不管了，参考自《JavaScript高级程序设计（第三版）》，ES2015 之后的继承方式待补充。

> 时隔两年重看这块，理解提高了很多，呀，两年好快啊<!--more-->

## ECMAScript5 之前的继承

### 利用构造函数继承
```javascript
//父类函数
var SuperType = function(name){
	this.name = name;
}

SuperType.prototype.say = function(){
	console.log(this.name);
}

//子类函数
var SubType = function(name, age){
	SuperType.call(this, name);
	this.age = age;
}

//子类原型继承父类实例，这样就有了父类的属性和方法
SubType.prototype = new SuperType();

//重写子类构造器
SubType.prototype.constructor = SubType;

SubType.prototype.getAge = function(){
	console.log(this.age);
}

var instance = new SubType('Oscar', '22');

instance.say(); //Oscar
instance.getAge(); //22
```

这样做有一个问题，父类的属性同时存在于子类的属性和原型上。

![Alt text](../pics/1487572312023.png)


### 原型继承

原型继承的思路是子类属性继承父类属性，子类原型继承父类原型。
```javascript
//父类函数
var SuperType = function(name){
	this.name = name;
}

SuperType.prototype.say = function(){
	console.log(this.name);
}

//原型继承函数
var inheritPrototype = function(subType, superType) {
	var clone = function(obj){
		function F(){};
		F.prototype = obj;
		return new F();
	}
	//获得一个父类原型副本
	//Tip 这里 clone 函数可以用 Object.create 替代，IE9+
	var prototype = clone(superType.prototype);
	
	prototype.constructor = subType;
	subType.prototype = prototype;
}

//子类函数
var SubType = function(name, age){
	SuperType.call(this, name);
	this.age = age;
}
//子类继承父类原型
inheritPrototype(SubType, SuperType);

SubType.prototype.getAge = function(){
	console.log(this.age);
}
var instance = new SubType('Oscar', '22');

instance.say(); //Oscar
instance.getAge(); //22
```
可以看出来比利用构造函数继承好

![Alt text](../pics/1487573103137.png)


## ECMAScript 6 的继承


未完待续 ....
