"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Snowflake = void 0;
const ApplicationData_1 = require("./ApplicationData");
class Snowflake {
    static RADIANCE_EPOCH = new Date(2023, 3, 23).getTime();
    static generate(time = Date.now(), increment = ApplicationData_1.ApplicationData.increment("snowflake_inc"), process_id = process.pid) {
        const timestamp = time - Snowflake.RADIANCE_EPOCH;
        return parseInt(timestamp.toString(2).padStart(42, "0")
            + increment.toString(2).padStart(12, "0")
            + process.pid.toString(2).padStart(5, "0"), 2).toString();
    }
}
exports.Snowflake = Snowflake;
