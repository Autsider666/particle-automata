// Fixme because it's not very good
export function DeepMerge<O extends Record<string, object | Record<string, object>>>(obj1: O, obj2: O): O {
    const result: O = {...obj1};

    for (const key in obj2) {
        if (Object.prototype.hasOwnProperty.call(obj2, key)) {
            if (obj2[key] instanceof Object && obj1[key] instanceof Object) {
                // @ts-expect-error It's just weird
                result[key] = DeepMerge(obj1[key], obj2[key]);
            } else {
                result[key] = obj2[key];
            }
        }
    }

    return result;
}
