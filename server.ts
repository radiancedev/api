import { Application, Context } from "@bismuthmoe/arcadia";
import { Routes } from "./routes/main";
const app = new Application();

app.on("error", (ctx: Context, err) => {
    console.log(err);
    ctx.status(500);
    ctx.json({ code: 500, error: "Internal server error" });
})

app.express.set("trust proxy", true);
app.register(Routes);

app.listen(3000);

export default app.express;