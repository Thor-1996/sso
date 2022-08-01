const Koa = require("koa");
const Router = require("koa-router");
const views = require("koa-views");
const path = require("path");
const app = new Koa();
const router = new Router();
const session = require("koa-session");
const koa2Req = require("koa2-request");
const cors = require("koa2-cors");

const ssoHost = "http://localhost:8000";
app.use(cors());

app.use(views(path.join(__dirname, "./views")), {
  extension: "ejs",
});

app.keys = ["key"];

const keyMap = {
  8001: "koa:sess8001",
  8002: "koa:sess8002",
};
const CONFIG = {
  key: keyMap[process.env.PORT],
  maxAge: 1000 * 60 * 60 * 24,
  httpOnly: true,
  // sameSite: "None",
  // Secure: true,
};
app.use(session(CONFIG, app));

const system = process.env.SERVER_NAME;

router.get("/", async (ctx) => {
  let user = ctx.session.user;
  console.log(ctx.session, "session信息");
  if (user) {
    await ctx.render("index.ejs", {
      user,
      system,
    });
  } else {
    let token = ctx.query.token;
    console.log(token, "token信息");

    if (!token) {
      //第一次不带token进来需要去登录页面
      ctx.redirect(
        `${ssoHost}/login/getToken?redirectUrl=${ctx.host + ctx.originalUrl}`
      );
    } else {
      //第二次进入的时候走这一步 发请求给认证服务器验证token
      const url = `${ssoHost}/check_token?token=${token}&t=${new Date().getTime()}`;

      let data = await koa2Req(url);
      console.log(data.body, "认证中心校验token后的返回值");

      try {
        const body = JSON.parse(data.body);
        const { error, userId } = body;

        if (error == 0) {
          // token校验通过
          ctx.session.user = userId;
          await ctx.render("index.ejs", {
            user: userId,
            system,
          });
        } else {
          // 非法token
          ctx.session.user = null;
          await ctx.render("index.ejs", {
            user: null,
            system,
          });
        }
      } catch (error) {}
    }
  }
});

router.get("/logout", async (ctx) => {
  console.log(ctx.cookies.get("token"), "业务系统退出登录请求的cookie");
  ctx.session = null;
  ctx.set("Access-Control-Allow-Credentials", true);
  console.log(ctx.session, "注销后的session");
  ctx.body = "<div>退出登录成功</div>";
});

app.use(router.routes());

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`app ${system} running at ${port}`);
});
