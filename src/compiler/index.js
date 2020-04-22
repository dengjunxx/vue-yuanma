import {parseHtml} from './parse-html'
/*
* 判断标签是不是符合规范，比如是否正常闭合，
* 匹配一个往数组里放一个，直到遇到第一个结束标签，看看这个结束标签类容是否和数组中的最后一项匹配
* 如果匹配，删掉数组最后一项，继续往前匹配，直到数组为空，说明符合规范
* 如果数组里最后还留了别的东西，说明不符合规范，比如有标签只写了开头，没写结尾
* [div,p,span]
* <div><p><span></span></p></div>
* */

function genProps(attrs) {
    let str = '';
    for(let i= 0;i<attrs.length;i++){
        let attr = attrs[i];
        if(attr.name === 'style'){
            //如果是一个样式属性，需要把属性携程对象{style:{color:'red'}}
            let obj = {};
            attr.value.split(';').forEach(item=>{
                let [key,value] = item.split(':');
                obj[key] = value;
            });
            attr.value = obj;
        }
        str+= `${attr.name}:${JSON.stringify(attr.value)},`//后面用","分隔开
    }
    return `{${str.slice(0,-1)}}`//截取掉最后一项是","
}
function genChildren(el) {
    //需要递归
    let children = el.children;
    if(children && children.length > 0){
        return `${children.map(child=>gen(child)).join(',')}`
    }
}

const defaultTagRE = /\{\{((?:.|\n)+?)\}\}/g;
function gen(node) {
    if(node.type === 1){
        return generate(node);//递归
    }else {
        let text = node.text;
        let tokens = [];
        let match,index;
        let lastIndex = defaultTagRE.lastIndex = 0;//这里每次匹配完都需要把索引置为0
        while (match = defaultTagRE.exec(text)){
            index = match.index;
            if(index > lastIndex){
                tokens.push(JSON.stringify(text.slice(lastIndex,index)))
            }
            tokens.push(`_s(${match[1].trim()})`);
            lastIndex = index + match[0].length;
        }
        if(lastIndex < text.length){
            tokens.push(JSON.stringify(text.slice(lastIndex)))
        }
        //需要把a{{name}} b{{age}} c处理成 _v("a"+_s(name)+"b"+_s(age)+"c")
        return `_v(${tokens.join('+')})`;
    }
}
function generate(el) {
    let children = genChildren(el);
    return `_c("${el.tag}",${el.attrs.length?genProps(el.attrs):'undefined'}${children?`,${children}`:''})`;
}

export function compileToFunction(template) {
    // console.log(template);
    let root = parseHtml(template);//获得ast语法树
    // console.log(root);
    //需要把ast语法树，生成最终的render函数，最终逻辑就是模板引擎字符串拼接；
    //_c('div',{id:'app'},_c('p',undefined,_v(_s(name))),_c('span',undefined,_v(_s(age))))
    let code = generate(root);
    console.log(code,'code');
    let renderFn = new Function(`with(this){ return ${code}}`);
    console.log(renderFn);
    return renderFn
}
// renderFn 相当于 function f() {
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
