import { env } from "./config/env.js";
import { createApp } from "./server.js";
const app = createApp();
const port = Number(env.PORT);
if (env.VENICE_API_KEY === "replace-me") {
    // eslint-disable-next-line no-console
    console.warn("[warn] VENICE_API_KEY is using placeholder value. Set a real key before production.");
}
app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`[info] Base44 backend listening on ${port}`);
});
