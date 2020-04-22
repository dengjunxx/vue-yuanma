@balel-core 核心，高级语法转低级语法
@babel-preset-env 预设，插件集合
rollup-plugin-babel 让rollup中能够使用babel的插件
rollup-plugin-serve 本地起静态服务的插件
cross-env 开发中环境变量的设置值
"serve": "cross-env ENV=development rollup -c -w" 设置环境变量 -c指定配置文件 -w监控文件变化
