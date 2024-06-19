/**
 * @author The people of GoogleChromeLabs
 * @inheritDoc https://github.com/GoogleChromeLabs/buffer-backed-object
 **/

export type Descriptor<T = unknown> = {
    size: number;
    align?: number;
    offset?: number;
    get(dataView: DataView, byteOffset: number): T;
    set(dataView: DataView, byteOffset: number, value: T): void;
};

export type Descriptors<T = Descriptor> = Record<string, T>;

export type DecodedBuffer<E extends Descriptors> = {
    [K in keyof E]: ReturnType<E[K]["get"]>;
};

/**
 * Returns `true` if `s` can be successfully coerced to a number.
 */
function isNumber(s: unknown): s is number {
    if (typeof s === "symbol") {
        return false;
    }
    // @ts-expect-error It already was like this
    return !isNaN(s);
}

/**
 * Returns the next integer bigger than `current` that has the desirged alignment.
 */
function nextAlign(current: number, align: number): number {
    let aligned = current - (current % align);
    if (current % align != 0) {
        aligned += align;
    }
    return aligned;
}

export function structSize(descriptors: Descriptors): number {
    let stride = 0;
    for (const {align = 1, size} of Object.values(descriptors)) {
        stride = nextAlign(stride, align) + size;
    }
    stride = nextAlign(stride, structAlign(descriptors));
    return stride;
}

export function structAlign(descriptors: Descriptors): number {
    return Math.max(...Object.values(descriptors).map((d) => d.align ?? 1));
}

export function ArrayOfBufferBackedObjects<T extends Descriptors>(
    buffer: ArrayBuffer,
    descriptors: T,
    {byteOffset = 0, length = 0, align = structAlign(descriptors)} = {}
): DecodedBuffer<T>[] {
    const dataView = new DataView(buffer, byteOffset);
    let stride = 0;
    // Copy the descriptors.
    const extendedDescriptors: Descriptors = {
        ...descriptors,
    };
    for (const [name, descriptor] of Object.entries(extendedDescriptors)) {
      const offset= nextAlign(stride, descriptor.align ?? 1);
        extendedDescriptors[name] = {
            ...descriptor,
            offset,
        };
        stride = offset + descriptor.size;
    }
    stride = nextAlign(stride, align);
    if (!length) {
        length = Math.floor((buffer.byteLength - byteOffset) / stride);
    }

    return new Proxy(new Array<DecodedBuffer<T>>(length), {
        has(target, propName) {
            // The underlying array is hole-y, but we want to pretend that it is not.
            // So we need to return `true` for all indices so that `map` et al. work
            // as expected.
            if (isNumber(propName)) {
                return propName < length;
            }
            if (propName === "buffer") {
                return true;
            }
            return propName in target;
        },
        get(target, propName, proxy) {
            if (propName === "buffer") {
                return buffer;
            }

            if (!isNumber(propName)) {
                // @ts-expect-error Existing code
                let prop = target[propName];
                if (typeof prop === "function") {
                    prop = prop.bind(proxy);
                }
                return prop;
            }
            const idx = parseInt(propName);
            const itemOffset = idx * stride;
            // Just like real arrays, we return `undefined`
            // outside the boundaries.
            if (idx >= target.length) {
                return undefined;
            }
            // If there is a hole at the given index, we need to create a new value
            // there that has the correct getter and setter functions.
            if (!target[idx]) {
                target[idx] = {} as DecodedBuffer<T>;
                for (const [name, descriptor] of Object.entries(extendedDescriptors)) {
                    if (!("get" in descriptor)) {
                        continue;
                    }
                    Object.defineProperty(target[idx], name, {
                        enumerable: true,
                        get() {
                            return descriptor.get(dataView, itemOffset + (descriptor.offset ?? 0));
                        },
                        set(value) {
                            return descriptor.set(
                                dataView,
                                itemOffset + (descriptor.offset ?? 0),
                                value
                            );
                        },
                    });
                }
                Object.freeze(target[idx]);
            }
            return target[idx];
        },
    });
}

export function BufferBackedObject<T extends Descriptors>(
    buffer: ArrayBuffer,
    descriptors: T,
    {byteOffset = 0, align = 1} = {}
): DecodedBuffer<T> {
    return ArrayOfBufferBackedObjects(buffer, descriptors, {
        byteOffset,
        align,
    })[0];
}

export interface EndiannessOption {
    endianness: "little" | "big";
}

export interface AlignOption {
    align: number;
}

export function Uint16({
                           endianness = "little",
                           align = 2,
                       }: Partial<EndiannessOption & AlignOption> = {}): Descriptor<number> {
    if (endianness !== "big" && endianness !== "little") {
        throw Error("Endianness needs to be either 'big' or 'little'");
    }
    const littleEndian = endianness === "little";
    return {
        align,
        size: Uint16Array.BYTES_PER_ELEMENT,
        get: (dataView, byteOffset) => dataView.getUint16(byteOffset, littleEndian),
        set: (dataView, byteOffset, value) =>
            dataView.setUint16(byteOffset, value, littleEndian),
    };
}

export function Uint32({
                           endianness = "little",
                           align = 4,
                       }: Partial<EndiannessOption & AlignOption> = {}): Descriptor<number> {
    if (endianness !== "big" && endianness !== "little") {
        throw Error("Endianness needs to be either 'big' or 'little'");
    }
    const littleEndian = endianness === "little";
    return {
        align,
        size: Uint32Array.BYTES_PER_ELEMENT,
        get: (dataView, byteOffset) => dataView.getUint32(byteOffset, littleEndian),
        set: (dataView, byteOffset, value) =>
            dataView.setUint32(byteOffset, value, littleEndian),
    };
}

export function Int16({
                          endianness = "little",
                          align = 2,
                      }: Partial<EndiannessOption & AlignOption> = {}): Descriptor<number> {
    if (endianness !== "big" && endianness !== "little") {
        throw Error("Endianness needs to be either 'big' or 'little'");
    }
    const littleEndian = endianness === "little";
    return {
        align,
        size: Int16Array.BYTES_PER_ELEMENT,
        get: (dataView, byteOffset) => dataView.getInt16(byteOffset, littleEndian),
        set: (dataView, byteOffset, value) =>
            dataView.setInt16(byteOffset, value, littleEndian),
    };
}

export function Int32({
                          endianness = "little",
                          align = 4,
                      }: Partial<EndiannessOption & AlignOption> = {}): Descriptor<number> {
    if (endianness !== "big" && endianness !== "little") {
        throw Error("Endianness needs to be either 'big' or 'little'");
    }
    const littleEndian = endianness === "little";
    return {
        align,
        size: Int32Array.BYTES_PER_ELEMENT,
        get: (dataView, byteOffset) => dataView.getInt32(byteOffset, littleEndian),
        set: (dataView, byteOffset, value) =>
            dataView.setInt32(byteOffset, value, littleEndian),
    };
}

export function Float32({
                            endianness = "little",
                            align = 4,
                        }: Partial<EndiannessOption & AlignOption> = {}): Descriptor<number> {
    if (endianness !== "big" && endianness !== "little") {
        throw Error("Endianness needs to be either 'big' or 'little'");
    }
    const littleEndian = endianness === "little";
    return {
        align,
        size: Float32Array.BYTES_PER_ELEMENT,
        get: (dataView, byteOffset) =>
            dataView.getFloat32(byteOffset, littleEndian),
        set: (dataView, byteOffset, value) =>
            dataView.setFloat32(byteOffset, value, littleEndian),
    };
}

export function Float64({
                            endianness = "little",
                            align = 8,
                        }: Partial<EndiannessOption & AlignOption> = {}): Descriptor<number> {
    if (endianness !== "big" && endianness !== "little") {
        throw Error("Endianness needs to be either 'big' or 'little'");
    }
    const littleEndian = endianness === "little";
    return {
        align,
        size: Float64Array.BYTES_PER_ELEMENT,
        get: (dataView, byteOffset) =>
            dataView.getFloat64(byteOffset, littleEndian),
        set: (dataView, byteOffset, value) =>
            dataView.setFloat64(byteOffset, value, littleEndian),
    };
}

export function BigInt64({
                             endianness = "little",
                             align = 8,
                         }: Partial<EndiannessOption & AlignOption> = {}): Descriptor<bigint> {
    if (endianness !== "big" && endianness !== "little") {
        throw Error("Endianness needs to be either 'big' or 'little'");
    }
    const littleEndian = endianness === "little";
    return {
        align,
        size: BigInt64Array.BYTES_PER_ELEMENT,
        get: (dataView, byteOffset) =>
            dataView.getBigInt64(byteOffset, littleEndian),
        set: (dataView, byteOffset, value) =>
            dataView.setBigInt64(byteOffset, value, littleEndian),
    };
}

export function BigUint64({
                              endianness = "little",
                              align = 8,
                          }: Partial<EndiannessOption & AlignOption> = {}): Descriptor<bigint> {
    if (endianness !== "big" && endianness !== "little") {
        throw Error("Endianness needs to be either 'big' or 'little'");
    }
    const littleEndian = endianness === "little";
    return {
        align,
        size: BigUint64Array.BYTES_PER_ELEMENT,
        get: (dataView, byteOffset) =>
            dataView.getBigUint64(byteOffset, littleEndian),
        set: (dataView, byteOffset, value) =>
            dataView.setBigUint64(byteOffset, value, littleEndian),
    };
}

export function Uint8(): Descriptor<number> {
    return {
        align: 1,
        size: 1,
        get: (dataView, byteOffset) => dataView.getUint8(byteOffset),
        set: (dataView, byteOffset, value) => dataView.setUint8(byteOffset, value),
    };
}

export function Int8(): Descriptor<number> {
    return {
        align: 1,
        size: 1,
        get: (dataView, byteOffset) => dataView.getInt8(byteOffset),
        set: (dataView, byteOffset, value) => dataView.setInt8(byteOffset, value),
    };
}

export function NestedBufferBackedObject<T extends Descriptors>(
    descriptors: T
): Descriptor<DecodedBuffer<T>> {
    const size = structSize(descriptors);
    return {
        align: structAlign(descriptors),
        size,
        get: (dataView, byteOffset) =>
            ArrayOfBufferBackedObjects(dataView.buffer, descriptors, {
                byteOffset: dataView.byteOffset + byteOffset,
                length: 1,
            })[0],
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        set: (_dataView, _byteOffset, _value) => {
            throw Error("Can’t set an entire struct");
        },
    };
}

export function NestedArrayOfBufferBackedObjects<T extends Descriptors>(
    length: number,
    descriptors: T
): Descriptor<Array<DecodedBuffer<T>>> {
    const size = structSize(descriptors) * length;
    return {
        align: Object.values(descriptors)[0].align ?? 1,
        size,
        get: (dataView, byteOffset) =>
            ArrayOfBufferBackedObjects(dataView.buffer, descriptors, {
                byteOffset: byteOffset + dataView.byteOffset,
                length,
            }),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        set: (_dataView, _byteOffset, _value) => {
            throw Error("Can’t set an entire array");
        },
    };
}

export function UTF8String(maxBytes: number): Descriptor<string> {
    return {
        align: 1,
        size: maxBytes,
        get: (dataView, byteOffset) =>
            new TextDecoder()
                .decode(new Uint8Array(dataView.buffer, byteOffset, maxBytes))
                // eslint-disable-next-line no-control-regex
                .replace(/\u0000+$/, ""),
        set: (dataView, byteOffset, value) => {
            const encoding = new TextEncoder().encode(value);
            const target = new Uint8Array(dataView.buffer, byteOffset, maxBytes);
            target.fill(0);
            target.set(encoding.subarray(0, maxBytes));
        },
    };
}

export function reserved(size: number): Descriptor<void> {
    return {
        align: 1, size, get() {
        }, set() {
        }
    };
}