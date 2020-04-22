//首先明确需要重写的都有哪些数组的方法，push,pop,shift,unshift,sort,reverse,splice，这些都是会导致数组本身发生变化的方法
//slice不会改变数组本身，这样的方法不需要去劫持

let oldArrayMethods = Array.prototype;//首先把数组原有方法保存一份
/*
* Object.create在内部可以再创建一个对象，非原来的oldArrayMethods，
* 相当于 arrayMethods.__proto__ = oldArrayMethods
*用户会这么value.__proto__ = arrayMethods;
* 当调用value.push时，首先找arrayMethods的push方法，如果没有，顺着原型链__proto__网上找到oldArrayMethods
* 当调用slice，因为arrayMethods里没有重写这个方法，所以会找oldArrayMethods中的slice
 */
export const arrayMethods = Object.create(oldArrayMethods);
const methods = ['push','pop','shift','unshift','sort','reserve','splice'];
methods.forEach(method=>{
    arrayMethods[method] = function (...arg) {
        console.log(`用户调用了${method}方法`);
        const result = oldArrayMethods[method].apply(this,arg);//调用原生数组的方法
        //当调用push,unshift,splice这种能够给数组新增属性的方法时，需要判断，如果新增的也是个对象，也要监控
        let inserted;//记录用户当前插入的元素
        let ob = this['__ob__'];//拿到value上挂在的__ob__属性;
        switch (method) {
            case 'push':
            case 'unshift':
                inserted = arg;//arr.push(xxx);中的xxx就是插入的元素，也是方法的arg
                break;
            case 'splice'://splice有三参数，有删除，新增的功能arr.splice(0,1,{name:1});
                inserted = arg.slice(2);//把arg的第二个参数截取出来
                break;
            default:
                break;
        }
        if(inserted) {
            ob.observeArray(inserted);
        }//如果inserted存在，把它监控起来
        return result;
    }
});

