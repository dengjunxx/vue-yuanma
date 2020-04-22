//ast语法树：用对象描述原生语法；虚拟dom：用对象来描述dom节点
// arguments[0]代表匹配到的标签，arguments[1]代表匹配到的标签名字
// Regular Expressions for parsing tags and attributes
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;//匹配属性的
//<div id="asa" ic='ffd' iq=sasa>
// could use https://www.w3.org/TR/1999/REC-xml-names-19990114/#NT-QName
// but for Vue templates we can enforce a simple charset
const ncname = '[a-zA-Z_][\\w\\-\\.]*';//abc-aaa
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;//?:匹配不捕获，<aaa:asas>
const startTagOpen = new RegExp(`^<${qnameCapture}`);//标签开头的正则，捕获的内容是标签名
const startTagClose = /^\s*(\/?)>/;//匹配标签结束的
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`);//匹配标签结尾的</div>
const doctype = /^<!DOCTYPE [^>]+>/i;
const comment = /^<!--/;
const conditionalComment = /^<!\[/;

let root = null;//ast语法树的树根
let currentParent;//标识出当前的父亲是谁
let stack = [];
const ELEMENT_TYPE = 1;
const TEXT_TYPE = 3;

function createASTElement(tagName,attrs) {
    //首先创建ast元素
    return {
        tag:tagName,
        type:ELEMENT_TYPE,
        children:[],
        attrs,
        parent:null
    }
}

function start(tagName,tagAttrs) {
    console.log('解析开始标签',tagName,'属性是',tagAttrs);
    //遇到开始标签，就创建一个ast语法树
    let element = createASTElement(tagName,tagAttrs);
    if(!root){
        root = element;
    }
    currentParent = element;//把当前标签标记为ast语法树
    stack.push(element);//将开始标签放进栈数组里
}
function chars(text) {
    console.log('文本标签(包括空格)',text);
    //文本节点只需要判断是谁的儿子就行
    text = text.replace(/\s/g,'');//将空标签替换成''
    if(text){
        //说明文本标签有内容
        currentParent.children.push({
            text,
            type:TEXT_TYPE
        })
    }
}
function end(tagName) {
    console.log('解析结束标签',tagName);
    //如果标签闭合了，需要判断这个标签是属于谁的
    let element = stack.pop();//拿出数组中的最后一项
    //我要标识出这个p是属于这个div的儿子的
    currentParent = stack[stack.length-1];//拿到pop完之后的最后一项，就是刚才那项的父亲
    if(currentParent){
        //
        element.parent = currentParent;
        currentParent.children.push(element);

    }
}

export function parseHtml(html) {
    //循环解析html字符串，一边解析一边截取掉html，直到完全截掉后while循环停止
    while (html){
        let textStart = html.indexOf('<');//匹配尖角号
        if(textStart === 0){
            //如果是0，表示是开始标签或者是结束标签
            let startTagMatch = parseStartTag();//通过这个方法，获取匹配到的结果，tagName，attrs;
            if(startTagMatch){
                //如果是开始标签
                start(startTagMatch.tagName,startTagMatch.attrs);
                continue;
            }
            let endTagMatch = html.match(endTag);//匹配结尾标签
            if(endTagMatch){
                //如果是结束标签
                advance(endTagMatch[0].length);
                end(endTagMatch[1]);
                continue;
            }
        }
        let text;
        if(textStart >= 0){
            //不等于0，说明不是开始也不是结束，是一个文本标签
            text = html.substring(0,textStart);
            if(text){
                advance(text.length);
                chars(text);
            }
        }
    }
    function advance(n) {
        //前进的方法,截取掉已经捕获的
        html = html.substring(n);
    }
    function parseStartTag() {
        //解析开始标签和里面的属性
        let start = html.match(startTagOpen);
        if(start){
            const match = {
                tagName:start[1],
                attrs:[]
            };
            advance(start[0].length);//接去掉已经捕获了的
            let end,attr;
            //看看后面的是属性还是结束标签
            while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))){
                //如果匹配到的是一个属性，把它保存到attrs的数组里，再去掉
                advance(attr[0].length);
                match.attrs.push({
                    name:attr[1],
                    value:attr[3] || attr[4] || attr[5]
                })
            }
            if(end){
                //去掉开始标签的">"
                advance(end[0].length);
                return match;
            }
        }
    }
    return root;
}
