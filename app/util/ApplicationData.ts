export class ApplicationData {
    static data = new Map<string, any>();

    static get(key: string) {
        return this.data.get(key);
    }

    static set(key: string, value: any) {
        this.data.set(key, value);
    }

    static delete(key: string) {
        this.data.delete(key);
    }

    static has(key: string) {
        return this.data.has(key);
    }

    static increment(key: string, value: number = 1) {
        this.data.set(key, (this.data.get(key) ?? 0) + value);

        return this.data.get(key);
    }

    static decrement(key: string, value: number = 1) {
        this.data.set(key, (this.data.get(key) ?? 0) - value);

        return this.data.get(key);
    }
}