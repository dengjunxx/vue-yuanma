//通过引入文件的方式，给vue原型上添加方法
import Vue from "./index";
import {initState} from './state'
import {compileToFunction} from './compiler/index.js'
import {mountComponent} from './lifecycle'
import Watcher from './observer/watcher'
export function initMixin(Vue) {
    //初始化流程
    Vue.prototype._init = function (options) {
        //首先需要做的就是数据的劫持
         const vm = this;//vue中使用 this.$options 指代的就是用户传进来的属性
         vm.$options = options;
         //初始化状态
         initState(vm);//分割状态

        // 如果用户传入了el属性，就需要实现挂载功能，将页面渲染出来*/
        if(vm.$options.el){
            //$mount原型上的方法
            vm.$mount(vm.$options.el)
        }
    };
    Vue.prototype.$mount = function (el) {
        let vm = this;
        let options = vm.$options;
        el = document.querySelector(el);
        //默认先取render，没有render取template，没template取el
        if(!options.render){
            //对模板进行编译
            let template = options.template;//取出模板
            if(!template && el){
                template = el.outerHTML;
            }
            options.render = compileToFunction(template);
            //mountComponent挂载方法，通过render更新之前的dom元素
            mountComponent(vm,el);

            //要把template转换为render
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
    }
}
