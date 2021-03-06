export function isObject(data) {
    return typeof data === 'object' && data !== null
}

export function def(data,key,value) {
    Object.defineProperty(data,key,{
        enumerable:false,
        configurable:false,
        value,
    });
}

export function proxy(vm,source,key) {
    Object.defineProperty(vm,source,{
        get(){
            return vm[source][key]
        },
        set(newValue){
            vm[source][key] = newValue;
        }
    })
}
