/* 2.1 */

export const MISSING_KEY = '___MISSING___'


type PromisedStore<K, V> = {
    get(key: K): Promise<V>,
    set(key: K, value: V): Promise<void>,
    delete(key: K): Promise<void>
}

export function makePromisedStore<K, V>(): PromisedStore<K, V> {
    const map = new Map<K,V>()
    return {
        get(key: K) {
            return new Promise<V>((resolve, reject) => {
                const val : V | undefined = map.get(key)
                return val ? resolve(val) : reject(MISSING_KEY)
            })
        },
        set(key: K, value: V) {
            return new Promise<void>((resolve, reject) => {
                map.set(key, value)
                return resolve()
            })
        },
        delete(key: K) {
            return new Promise<void>((resolve, reject) => {
                const success : boolean = map.delete(key)
                return success ? resolve() : reject(MISSING_KEY)
            })
        },
    }
}


export function getAll<K, V>(store: PromisedStore<K, V>, keys: K[]): Promise<V[]> {
    const promises = keys.map((x) => store.get(x))
    return Promise.all(promises)
}

/* 2.2 */

// ??? (you may want to add helper functions here)

export function asycMemo<T, R>(f: (param: T) => R): (param: T) => Promise<R> {
    const store = makePromisedStore<T, R>()
    return async (param: T): Promise<R> => {
        try{
            const result = await store.get(param)
            return result
        }catch(err){
            const result = f(param)
            await store.set(param, result)
            return result
        }
    }
}

/* 2.3 */

export function lazyFilter<T>(genFn: () => Generator<T>, filterFn: (t :T) => boolean): () => Generator<T> {
    function * output(): Generator<T>{
        const gen = genFn()
        for(let x of gen){
            if(filterFn(x)){
                yield x
            }
        }
    }
    return output;
}

export function lazyMap<T, R>(genFn: () => Generator<T>, mapFn:(t: T) => R): () => Generator<R> {
    function * output(): Generator<R>{
        const gen = genFn()
        for(let x of gen){
           yield mapFn(x)
        }
    }
    return output;
}

/* 2.4 */
// you can use 'any' in this question


export async function asyncWaterfallWithRetry(fns: [() => Promise<any>, ...((param: any) => Promise<any>)[]]): Promise<any> {
    try{
        const currResult = await fns[0]()
        return async2(fns, 1, 0, currResult)
    }catch(err){
        setTimeout(() => {}, 2000)
        return async2(fns, 0, 1, err)
    }
}

async function async2(fns: [() => Promise<any>, ...((param: any) => Promise<any>)[]], i: number, j: number, lastResult: any): Promise<any> {
    if(i == fns.length){
        return lastResult
    }try{
        const currResult = await fns[i](lastResult)
        return async2(fns, i + 1, 0, currResult)
    }catch(err){
            setTimeout(() => {}, 2000)
            return j == 2 ? err : async2(fns, i, j + 1, lastResult)
    }
}