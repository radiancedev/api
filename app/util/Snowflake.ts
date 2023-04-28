import { ApplicationData } from "./ApplicationData";

export class Snowflake {
    // First second of April 2023
    static readonly RADIANCE_EPOCH = new Date(2023, 3, 23).getTime();

    static generate(time: number = Date.now(), increment: number = ApplicationData.increment("snowflake_inc"), process_id: number = process.pid) {
        const timestamp = time - Snowflake.RADIANCE_EPOCH;

        // Return the snowflake
        return parseInt(
            timestamp.toString(2).padStart(42, "0")
            + increment.toString(2).padStart(12, "0")
            + process.pid.toString(2).padStart(5, "0"), 2
        ).toString();
    }
}