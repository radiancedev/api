export declare class Snowflake {
    static readonly RADIANCE_EPOCH: number;
    static generate(time?: number, increment?: number, process_id?: number): string;
}
