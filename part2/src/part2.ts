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
        const promise = store.get(param)
        return await promise.then((x) => x)
        .catch((x) => {
            const result = f(param)
            store.set(param, result)
            return result
        })
    }
}

/* 2.3 */

// export function lazyFilter<T>(genFn: () => Generator<T>, filterFn: ???): ??? {
//     ???
// }

// export function lazyMap<T, R>(genFn: () => Generator<T>, mapFn: ???): ??? {
//     ???
// }

/* 2.4 */
// you can use 'any' in this question

// export async function asyncWaterfallWithRetry(fns: [() => Promise<any>, ...(???)[]]): Promise<any> {
//     ???
// }