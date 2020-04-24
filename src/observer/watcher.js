
class Watcher {
    constructor(vm,exprOrFn,callback,options){
        //写一个类的第一件事，把所有属性放在实例上
        this.vm = vm;
        this.callback = callback;
        this.options = options;
        this.getter = exprOrFn;
        this.get();//watcher只做了一件事，让传进来的exprOrFn执行
    }
    get(){
        this.getter();
    }
}
export default Watcher;
