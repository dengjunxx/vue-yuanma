import {observe} from './observer/index'
export function initState(vm) {
    const opts = vm.$options;
    //vue的数据来源 属性，方法，数据，计算属性，watch（vue初始化的默认顺序）
    if(opts.props){
        initProps(vm);
    }
    if(opts.methods){
        initMethods(vm);
    }
    if(opts.data){
        initData(vm);
    }
    if(opts.computed){
        initComputed(vm)
    }
    if(opts.watch){
        initWatch(vm)
    }
}
function initProps() {

}
function initMethods() {

}
function initData(vm) {
//初始化data数据
    let data = vm.$options.data;
    data = vm._data = typeof data === 'function' ? data.call(vm) : data;
    //data.call(vm) 是为了让data函数中的this指向vm
    //对象劫持，用户改变了数据，我希望能够得到通知-->刷新页面
    //MVVM模式，数据变化可以驱动视图变化
    //Object.defineProperty() 给属性增加get和set方法

    observe(data);//vue的核心响应式原理
}
function initComputed() {

}
function initWatch() {

}
