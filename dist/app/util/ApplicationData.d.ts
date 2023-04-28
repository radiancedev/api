export declare class ApplicationData {
    static data: Map<string, any>;
    static get(key: string): any;
    static set(key: string, value: any): void;
    static delete(key: string): void;
    static has(key: string): boolean;
    static increment(key: string, value?: number): any;
    static decrement(key: string, value?: number): any;
}
