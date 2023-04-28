"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationData = void 0;
class ApplicationData {
    static data = new Map();
    static get(key) {
        return this.data.get(key);
    }
    static set(key, value) {
        this.data.set(key, value);
    }
    static delete(key) {
        this.data.delete(key);
    }
    static has(key) {
        return this.data.has(key);
    }
    static increment(key, value = 1) {
        this.data.set(key, (this.data.get(key) ?? 0) + value);
        return this.data.get(key);
    }
    static decrement(key, value = 1) {
        this.data.set(key, (this.data.get(key) ?? 0) - value);
        return this.data.get(key);
    }
}
exports.ApplicationData = ApplicationData;
