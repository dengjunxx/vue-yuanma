import Watcher from "./observer/watcher";

export function lifecycleMixin(Vue) {
    //vnode是传进来的虚拟节点，需要在这里变成真实节点，更新页面
    Vue.prototype._update = function (vnode) {
        // console.log(vnode,'vnode');
    }
}

export function mountComponent(vm,el) {
    const options = vm.$options;//后面需要拿到render方法
    vm.$el = el;
    //接下来渲染页面
    let updateComponent = () =>{
        //无论是渲染还是更新，都需要调这个方法
        //调_render这个方法(专门用来渲染虚拟dom的方法)，里面解析刚才的render方法，返回一个虚拟dom，再_update生成真实dom
        vm._update(vm._render());
    };
    // 调updateComponent方法，会先执行_render ,再执行_update，从里到外执行
    //vue核心概念，渲染watcher，每个组件都有一个watcher
    //true表示是一个渲染watcher，回调是vm.$watcher里面的回调，用的少
    //watcher观察数据的变化，数据变化，视图更新
    //每次数据变化，调watcher，watcher调里面的updateComponent,updateComponent调vm上的_render,_render调原型上的render方法，转成虚拟节点，然后通过_update转成真是dom
    new Watcher(vm,updateComponent,()=>{},true)

}
