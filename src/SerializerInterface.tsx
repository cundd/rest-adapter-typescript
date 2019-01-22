export interface SerializerInterface<B extends object> {
    /**
     * Convert a the input instance(s) into a serialized string
     *
     * @param {T[] | T} input
     * @return {string}
     */
    serialize<T extends object = B>(input: T[] | T): string;
}
