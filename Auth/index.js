const Koa = require("koa");
const Router = require("koa-router");
const views = require("koa-views");
const path = require("path");
const app = new Koa();
const router = new Router();
const login = require("./routes/login");
const checkToken = require("./routes/check-token");
const bodyparser = require("koa-bodyparser");
const cors = require("koa2-cors");

app.use(cors());
app.use(views(path.join(__dirname, "./views")), {
  extension: "ejs",
});

app.use(bodyparser());
router.use("/login", login.routes());
router.use("/check_token", checkToken.routes());
app.use(router.routes());

app.listen(8000, () => {
  console.log(`app listen at 8000`);
});
