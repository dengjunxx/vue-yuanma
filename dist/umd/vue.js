(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.Vue = factory());
}(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit(arr, i) {
    if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(n);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  function isObject(data) {
    return _typeof(data) === 'object' && data !== null;
  }
  function def(data, key, value) {
    Object.defineProperty(data, key, {
      enumerable: false,
      configurable: false,
      value: value
    });
  }

  //首先明确需要重写的都有哪些数组的方法，push,pop,shift,unshift,sort,reverse,splice，这些都是会导致数组本身发生变化的方法
  //slice不会改变数组本身，这样的方法不需要去劫持
  var oldArrayMethods = Array.prototype; //首先把数组原有方法保存一份

  /*
  * Object.create在内部可以再创建一个对象，非原来的oldArrayMethods，
  * 相当于 arrayMethods.__proto__ = oldArrayMethods
  *用户会这么value.__proto__ = arrayMethods;
  * 当调用value.push时，首先找arrayMethods的push方法，如果没有，顺着原型链__proto__网上找到oldArrayMethods
  * 当调用slice，因为arrayMethods里没有重写这个方法，所以会找oldArrayMethods中的slice
   */

  var arrayMethods = Object.create(oldArrayMethods);
  var methods = ['push', 'pop', 'shift', 'unshift', 'sort', 'reserve', 'splice'];
  methods.forEach(function (method) {
    arrayMethods[method] = function () {
      console.log("\u7528\u6237\u8C03\u7528\u4E86".concat(method, "\u65B9\u6CD5"));

      for (var _len = arguments.length, arg = new Array(_len), _key = 0; _key < _len; _key++) {
        arg[_key] = arguments[_key];
      }

      var result = oldArrayMethods[method].apply(this, arg); //调用原生数组的方法
      //当调用push,unshift,splice这种能够给数组新增属性的方法时，需要判断，如果新增的也是个对象，也要监控

      var inserted; //记录用户当前插入的元素

      var ob = this['__ob__']; //拿到value上挂在的__ob__属性;

      switch (method) {
        case 'push':
        case 'unshift':
          inserted = arg; //arr.push(xxx);中的xxx就是插入的元素，也是方法的arg

          break;

        case 'splice':
          //splice有三参数，有删除，新增的功能arr.splice(0,1,{name:1});
          inserted = arg.slice(2); //把arg的第二个参数截取出来

          break;
      }

      if (inserted) {
        ob.observeArray(inserted);
      } //如果inserted存在，把它监控起来


      return result;
    };
  });

  var Observer = /*#__PURE__*/function () {
    function Observer(value) {
      _classCallCheck(this, Observer);

      //constructor只做初始化的操作
      //vue的缺陷，如果数据的层次太多，需要递归解析对象中的属性，依次添加get和set方法
      //所以vue3中使用了proxy，不需要递归，也不需要set 和 get

      /*
      * 这里data数据第一次进来的时候肯定是个对象，但是第二次以后就有可能进来的是数组了
      * 而且不能对数组的索引进行监控，性能不好，但是需要对数组里的对象进行监控
      * */
      //value.__ob__ = this;//把观测者Observer放到value的__ob__属性上
      //__ob__可描述此对象已是否被观测
      def(value, '__ob__', this);

      if (Array.isArray(value)) {
        /*
         * 如果是数组，不要对数组的索引进行观测,前端开发中很少对数组的索引进行操作
         * 如果数组里放的是对象，再进行监控
         * 需要重写数组的方法，push,shift,unshift，value.__proto__ = xxx
         */
        value.__proto__ = arrayMethods; //装饰模式，函数的劫持

        this.observeArray(value); //遍历数组
      } else {
        this.walk(value); //遍历对象，对对象进行监控
      }
    }

    _createClass(Observer, [{
      key: "observeArray",
      value: function observeArray(value) {
        value.forEach(function (val) {
          observe(val); //对数组中的每个对象进行监控
          //当用户调用类似vm._data.name.push的方法时，也需要监控更新，需要重写array方法
        });
      }
    }, {
      key: "walk",
      value: function walk(data) {
        var keys = Object.keys(data); //拿到data中的key,一次重新定义属性[name,age,....]

        keys.forEach(function (key) {
          var value = data[key];
          defineReactive(data, key, value); //vue响应式的核心方法，利用defineProperty给data上重新定义一个key，值是value;
        });
      }
    }]);

    return Observer;
  }();

  function defineReactive(data, key, value) {
    observe(value); //利用递归原理，当value是object时，继续劫持里面的属性，绑定get和set;

    Object.defineProperty(data, key, {
      configurable: true,
      //是否可编辑
      enumerable: false,
      //是否可枚举
      get: function get() {
        //获取值的时候做一些操作
        return value;
      },
      set: function set(newValue) {
        //改变值的时候做一些操作，依赖收集
        console.log('更新数据');

        if (newValue !== value) {
          observe(newValue); //递归，当用户给vm._data中的属性值设置为新的对象时，继续劫持

          value = newValue;
        }
      }
    });
  }

  function observe(data) {
    //1.判断data是不死一个object
    var isObj = isObject(data);

    if (!isObj) {
      return;
    } //写一个类，用来专门观测数据


    return new Observer(data);
  }

  function initState(vm) {
    var opts = vm.$options; //vue的数据来源 属性，方法，数据，计算属性，watch（vue初始化的默认顺序）

    if (opts.props) ;

    if (opts.methods) ;

    if (opts.data) {
      initData(vm);
    }

    if (opts.computed) ;

    if (opts.watch) ;
  }

  function initData(vm) {
    //初始化data数据
    var data = vm.$options.data;
    data = vm._data = typeof data === 'function' ? data.call(vm) : data; //data.call(vm) 是为了让data函数中的this指向vm
    //对象劫持，用户改变了数据，我希望能够得到通知-->刷新页面
    //MVVM模式，数据变化可以驱动视图变化
    //Object.defineProperty() 给属性增加get和set方法

    observe(data); //vue的核心响应式原理
  }

  //ast语法树：用对象描述原生语法；虚拟dom：用对象来描述dom节点
  // arguments[0]代表匹配到的标签，arguments[1]代表匹配到的标签名字
  // Regular Expressions for parsing tags and attributes
  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; //匹配属性的
  //<div id="asa" ic='ffd' iq=sasa>
  // could use https://www.w3.org/TR/1999/REC-xml-names-19990114/#NT-QName
  // but for Vue templates we can enforce a simple charset

  var ncname = '[a-zA-Z_][\\w\\-\\.]*'; //abc-aaa

  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")"); //?:匹配不捕获，<aaa:asas>

  var startTagOpen = new RegExp("^<".concat(qnameCapture)); //标签开头的正则，捕获的内容是标签名

  var startTagClose = /^\s*(\/?)>/; //匹配标签结束的

  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); //匹配标签结尾的</div>
  var root = null; //ast语法树的树根

  var currentParent; //标识出当前的父亲是谁

  var stack = [];
  var ELEMENT_TYPE = 1;
  var TEXT_TYPE = 3;

  function createASTElement(tagName, attrs) {
    //首先创建ast元素
    return {
      tag: tagName,
      type: ELEMENT_TYPE,
      children: [],
      attrs: attrs,
      parent: null
    };
  }

  function start(tagName, tagAttrs) {
    console.log('解析开始标签', tagName, '属性是', tagAttrs); //遇到开始标签，就创建一个ast语法树

    var element = createASTElement(tagName, tagAttrs);

    if (!root) {
      root = element;
    }

    currentParent = element; //把当前标签标记为ast语法树

    stack.push(element); //将开始标签放进栈数组里
  }

  function chars(text) {
    console.log('文本标签(包括空格)', text); //文本节点只需要判断是谁的儿子就行

    text = text.replace(/\s/g, ''); //将空标签替换成''

    if (text) {
      //说明文本标签有内容
      currentParent.children.push({
        text: text,
        type: TEXT_TYPE
      });
    }
  }

  function end(tagName) {
    console.log('解析结束标签', tagName); //如果标签闭合了，需要判断这个标签是属于谁的

    var element = stack.pop(); //拿出数组中的最后一项
    //我要标识出这个p是属于这个div的儿子的

    currentParent = stack[stack.length - 1]; //拿到pop完之后的最后一项，就是刚才那项的父亲

    if (currentParent) {
      //
      element.parent = currentParent;
      currentParent.children.push(element);
    }
  }

  function parseHtml(html) {
    //循环解析html字符串，一边解析一边截取掉html，直到完全截掉后while循环停止
    while (html) {
      var textStart = html.indexOf('<'); //匹配尖角号

      if (textStart === 0) {
        //如果是0，表示是开始标签或者是结束标签
        var startTagMatch = parseStartTag(); //通过这个方法，获取匹配到的结果，tagName，attrs;

        if (startTagMatch) {
          //如果是开始标签
          start(startTagMatch.tagName, startTagMatch.attrs);
          continue;
        }

        var endTagMatch = html.match(endTag); //匹配结尾标签

        if (endTagMatch) {
          //如果是结束标签
          advance(endTagMatch[0].length);
          end(endTagMatch[1]);
          continue;
        }
      }

      var text = void 0;

      if (textStart >= 0) {
        //不等于0，说明不是开始也不是结束，是一个文本标签
        text = html.substring(0, textStart);

        if (text) {
          advance(text.length);
          chars(text);
        }
      }
    }

    function advance(n) {
      //前进的方法,截取掉已经捕获的
      html = html.substring(n);
    }

    function parseStartTag() {
      //解析开始标签和里面的属性
      var start = html.match(startTagOpen);

      if (start) {
        var match = {
          tagName: start[1],
          attrs: []
        };
        advance(start[0].length); //接去掉已经捕获了的

        var _end, attr; //看看后面的是属性还是结束标签


        while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
          //如果匹配到的是一个属性，把它保存到attrs的数组里，再去掉
          advance(attr[0].length);
          match.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || attr[5]
          });
        }

        if (_end) {
          //去掉开始标签的">"
          advance(_end[0].length);
          return match;
        }
      }
    }

    return root;
  }

  /*
  * 判断标签是不是符合规范，比如是否正常闭合，
  * 匹配一个往数组里放一个，直到遇到第一个结束标签，看看这个结束标签类容是否和数组中的最后一项匹配
  * 如果匹配，删掉数组最后一项，继续往前匹配，直到数组为空，说明符合规范
  * 如果数组里最后还留了别的东西，说明不符合规范，比如有标签只写了开头，没写结尾
  * [div,p,span]
  * <div><p><span></span></p></div>
  * */

  function genProps(attrs) {
    var str = '';

    for (var i = 0; i < attrs.length; i++) {
      var attr = attrs[i];

      if (attr.name === 'style') {
        (function () {
          //如果是一个样式属性，需要把属性携程对象{style:{color:'red'}}
          var obj = {};
          attr.value.split(';').forEach(function (item) {
            var _item$split = item.split(':'),
                _item$split2 = _slicedToArray(_item$split, 2),
                key = _item$split2[0],
                value = _item$split2[1];

            obj[key] = value;
          });
          attr.value = obj;
        })();
      }

      str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ","); //后面用","分隔开
    }

    return "{".concat(str.slice(0, -1), "}"); //截取掉最后一项是","
  }

  function genChildren(el) {
    //需要递归
    var children = el.children;

    if (children && children.length > 0) {
      return "".concat(children.map(function (child) {
        return gen(child);
      }).join(','));
    }
  }

  var defaultTagRE = /\{\{((?:.|\n)+?)\}\}/g;

  function gen(node) {
    if (node.type === 1) {
      return generate(node); //递归
    } else {
      var text = node.text;
      var tokens = [];
      var match, index;
      var lastIndex = defaultTagRE.lastIndex = 0; //这里每次匹配完都需要把索引置为0

      while (match = defaultTagRE.exec(text)) {
        index = match.index;

        if (index > lastIndex) {
          tokens.push(JSON.stringify(text.slice(lastIndex, index)));
        }

        tokens.push("_s(".concat(match[1].trim(), ")"));
        lastIndex = index + match[0].length;
      }

      if (lastIndex < text.length) {
        tokens.push(JSON.stringify(text.slice(lastIndex)));
      } //需要把a{{name}} b{{age}} c处理成 _v("a"+_s(name)+"b"+_s(age)+"c")


      return "_v(".concat(tokens.join('+'), ")");
    }
  }

  function generate(el) {
    var children = genChildren(el);
    return "_c(\"".concat(el.tag, "\",").concat(el.attrs.length ? genProps(el.attrs) : 'undefined').concat(children ? ",".concat(children) : '', ")");
  }

  function compileToFunction(template) {
    // console.log(template);
    var root = parseHtml(template); //获得ast语法树
    // console.log(root);
    //需要把ast语法树，生成最终的render函数，最终逻辑就是模板引擎字符串拼接；
    //_c('div',{id:'app'},_c('p',undefined,_v(_s(name))),_c('span',undefined,_v(_s(age))))

    var code = generate(root);
    console.log(code, 'code');
    var renderFn = new Function("with(this){ return ".concat(code, "}"));
    console.log(renderFn);
    return renderFn;
  } // renderFn 相当于 function f() {
  //     with (this) {
  //         return '_c(\'div\',{id:\'app\'},_c(\'p\',undefined,_v(_s(name))),_c(\'span\',undefined,_v(_s(age))))'
  //     }
  // }
  // new Function能把字符串参数转换为对象
  // var str='{name:"Helen",age:"22",sex:"female"}';
  //
  // var obj=new Function('return '+str)();
  // console.log(obj.name);//Helen
  // function Parsejson(data){
  //     return (new Function('return '+data))();
  // }
  // var str="{'a':'123','b':'abc'}";
  // var obj=Parsejson(str); //传入参数 str1
  // console.log(obj.b);
  // 如果传道入的 str 是number 类型 new Function 会把 str 当数值使用 例如 str = 123; 结果就是版123
  // 如果传入的 str 是非number类型 new Function 会把 str 当引用类型使用
  // 会去寻找 串的对象；
  // new Function()的参数是某个字符串，在使用时，编译器会将参数中的字符串当作正常的脚本代码来执行。利用这种方法来把字符串转对象，可以简单的想象成就是new出一个对象。
  // <div id="app">
  //     <p>hello</p>
  // </div>
  // 截取一个，删除一个
  // start div: attrs:[{name:'id',value:'app'}];
  // start p
  // text hello
  // end p
  // end div
  // ast语法树
  // let root = {
  //     tag:'div',
  //     attrs:[{name:'id',value:'app'}],//标签的属性集合
  //     parent:null,//父节点
  //     type:1,//节点属性，1代表标签节点，3代表文本节点
  //     children:[//子元素
  //         {
  //             tag:'p',
  //             attrs:[],
  //             parent: root,
  //             type:1,
  //             children: [
  //                 {
  //                     text:'hello',
  //                     type:3
  //                 }
  //             ]
  //         }
  //     ]
  // };

  //通过引入文件的方式，给vue原型上添加方法
  function initMixMin(Vue) {
    //初始化流程
    Vue.prototype._init = function (options) {
      //首先需要做的就是数据的劫持
      var vm = this; //vue中使用 this.$options 指代的就是用户传进来的属性

      vm.$options = options; //初始化状态

      initState(vm); //分割状态

      /*
      * 如果用户传入了el属性，就需要实现挂载功能，将页面渲染出来*/

      if (vm.$options.el) {
        //$mount原型上的方法
        vm.$mount(vm.$options.el);
      }
    };

    Vue.prototype.$mount = function (el) {
      var vm = this;
      var options = vm.$options;
      el = document.querySelector(el); //默认先取render，没有render取template，没template取el

      if (!options.render) {
        //对模板进行编译
        var template = options.template; //取出模板

        if (!template && el) {
          template = el.outerHTML;
        }

        options.render = compileToFunction(template); //要把template转换为render
        // <div id="app">
        // <p>{{name}}</p>
        // <span>{{age}}</span>
        // </div>
        // 转换为render大概是这个样子
        // render(){
        //     return _c('div',{id:'app'},_c('p',undefined,_v(_s(name))),_c('span',undefined,_v(_s(age))))
        // }
        //1.把dom标签转换成ast语法树
      }
    };
  }

  //这里是Vue核心配置,只是vue的一个声明

  function Vue(options) {
    //惊醒vue的初始化操作
    this._init(options);
  } //在vue原型上扩展方法


  initMixMin(Vue); //给vue原型上添加一个_init方法

  return Vue;

})));
//# sourceMappingURL=vue.js.map
