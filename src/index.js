//这里是Vue核心配置,只是vue的一个声明
import {initMixMin} from './init'
function Vue(options) {
    //惊醒vue的初始化操作
    this._init(options);
}
//在vue原型上扩展方法
initMixMin(Vue);//给vue原型上添加一个_init方法
export default Vue
