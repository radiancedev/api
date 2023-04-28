"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const arcadia_1 = require("@bismuthmoe/arcadia");
const main_1 = require("./routes/main");
const app = new arcadia_1.Application();
app.on("error", (err, ctx) => {
    console.warn(err);
    ctx.status(500);
    ctx.json({ code: 500, error: "Internal server error" });
});
app.express.set("trust proxy", true);
app.register(main_1.Routes);
app.listen(3000);
