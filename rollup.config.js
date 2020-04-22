import babel from 'rollup-plugin-babel'
import serve from 'rollup-plugin-serve'

export default {
    input:'./src/index.js',//以哪个文件为打包入口，入口路径
    output:{
        file:'dist/umd/vue.js',//出口路径
        name:'Vue',//指定打包后全局变量的名字
        format:'umd',//统一模块规范
        sourcemap:true,//es6->es5开启源码调试，找到源代码的报错位置
    },
    plugins:[
        babel({
            exclude:'node_modules/**'
        }),
        process.env.ENV === 'development' ? serve({
            open:true,
            openPage:'/public/index.html',//默认开启html路径
            port:3000,
            contentBase:'',//以当前文件路径启动一个服务
        }):null
    ]
}
