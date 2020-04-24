
export function createElement(tag,data={},...children) {
    let key = data.key;
    if(key){
        delete data.key;
    }
    return vnode(tag,data,key,children,undefined);
}
export function createTextNode(text) {
    return vnode(undefined,undefined,undefined,undefined,text);
}
function vnode(tag,data,key,children,text) {
    return {
     tag,
     data,
     key,
     children,
     text
    }
}

//虚拟节点就是通过_c,_v，实现用对象的形式来描述dom的操作(也是个对象)
//将template转换成ast语法树-->生成render方法-->生成虚拟dom-->真实dom
//当视图更新的时候，重新生成虚拟dom，做对比，更新dom

// let xunidom = {
//     tag:'div',
//     key:undefined,
//     data:{},
//     children:[],
//     text:undefined,
// }
