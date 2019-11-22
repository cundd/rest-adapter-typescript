export interface Dictionary<T = any> {
    [key: string]: T | undefined;
}

export type ParDict = Partial<Dictionary>;
