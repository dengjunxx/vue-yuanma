//把data中的数据都使用Object.defineProperty重新定义
//Object.defineProperty是es5语法，不兼容ie8及以下版本，所以vue2不能兼容ie8以下版本
import {isObject,def} from '../util/index'
import {arrayMethods} from './array.js'

//通过这个类，后续可以得知数据是不是一个已经被观测了的数据，后面需要互相调用
class Observer {
    constructor(value) {//constructor只做初始化的操作
        //vue的缺陷，如果数据的层次太多，需要递归解析对象中的属性，依次添加get和set方法
        //所以vue3中使用了proxy，不需要递归，也不需要set 和 get
        /*
        * 这里data数据第一次进来的时候肯定是个对象，但是第二次以后就有可能进来的是数组了
        * 而且不能对数组的索引进行监控，性能不好，但是需要对数组里的对象进行监控
        * */
        //value.__ob__ = this;//把观测者Observer放到value的__ob__属性上
        //__ob__可描述此对象已是否被观测
        def(value,'__ob__',this);
        if(Array.isArray(value)){
            /*
             * 如果是数组，不要对数组的索引进行观测,前端开发中很少对数组的索引进行操作
             * 如果数组里放的是对象，再进行监控
             * 需要重写数组的方法，push,shift,unshift，value.__proto__ = xxx
             */
            value.__proto__ = arrayMethods; //装饰模式，函数的劫持
            this.observeArray(value);//遍历数组
        }else {
            this.walk(value);//遍历对象，对对象进行监控
        }
    }
    observeArray(value){
        value.forEach(val=>{
            observe(val);//对数组中的每个对象进行监控
            //当用户调用类似vm._data.name.push的方法时，也需要监控更新，需要重写array方法
        })
    }
    walk(data) {
        let keys = Object.keys(data);//拿到data中的key,一次重新定义属性[name,age,....]
        keys.forEach(key => {
            let value = data[key];
            defineReactive(data, key, value);//vue响应式的核心方法，利用defineProperty给data上重新定义一个key，值是value;
        })
    }
}

function defineReactive(data, key, value) {
    observe(value);//利用递归原理，当value是object时，继续劫持里面的属性，绑定get和set;
    Object.defineProperty(data, key, {
        configurable:true,//是否可编辑
        enumerable:false,//是否可枚举
        get() {
            //获取值的时候做一些操作
            return value
        },
        set(newValue) {
            //改变值的时候做一些操作，依赖收集
            console.log('更新数据');
            if (newValue !== value) {
                observe(newValue);//递归，当用户给vm._data中的属性值设置为新的对象时，继续劫持
                value = newValue
            }
        }
    })

}

export function observe(data) {
    //1.判断data是不死一个object
    let isObj = isObject(data);
    if (!isObj) {
        return;
    }
    //写一个类，用来专门观测数据
    return new Observer(data);
}
