import {createElement,createTextNode} from './vdom/create-element'

export function renderMixin(Vue) {
    /*
    * _c创建元素的虚拟节点
    * _v创建文本的虚拟节点
    * _s JSON.stringify
    * */
    Vue.prototype._c = function (){
        //arguments包括tag,data和很多children
        return createElement(...arguments);
    };
    Vue.prototype._v = function (text){
        return createTextNode(text);
    };
    Vue.prototype._s = function (val){
        return val === null?'':(typeof val === 'object'?JSON.stringify(val):val);
    };
    Vue.prototype._render = function () {
        const vm = this;
        let {render} = vm.$options;
        // let vnode = render.call(vm);//render执行，改变里面的this指向vm，通过with函数让虚拟dom上的属性(如name)能够自动去this(vm)上取值；
        // return vnode
    }
}
