const service = require("../service");
const router = require("koa-router")();
const registeredList = [];

router.get("/getToken", async (ctx) => {
  ctx.set("Access-Control-Allow-Credentials", true);
  const cookies = ctx.cookies;
  const token = cookies.get("token");

  console.log(token, "请求ssotoken的cookie");

  if (token && service.isTokenVailid(token)) {
    const redirectUrl = ctx.query.redirectUrl;

    if (redirectUrl) {
      ctx.redirect(`${ctx.protocol}://${redirectUrl}?token=${token}`);
    } else {
      ctx.body = "<h1>登录成功！</h1>";
    }
  } else {
    await ctx.render("login.ejs", {
      extension: "ejs",
    });
  }
});

router.post("/", async (ctx) => {
  const body = ctx.request.body;
  const { name, password, redirectUrl } = body;
  if (name === "admin" && password === "123456") {
    const token = "passport";
    await ctx.cookies.set("token", token, {
      maxAge: 1000 * 60 * 60 * 24 * 30,
      httpOnly: true,
      // sameSite: "None",
      // Secure: true,
    });
    const url = `${ctx.protocol}://${redirectUrl}`;

    if (!registeredList.includes(url)) {
      registeredList.push(url);
    }
    if (redirectUrl) {
      ctx.redirect(`${ctx.protocol}://${redirectUrl}?token=${token}`);
    } else {
      ctx.body = "<h1>登录成功！</h1>";
    }
  } else {
    ctx.response.body = {
      error: 1,
      msg: "用户名或密码错误",
    };
  }
});

router.get("/logout", async (ctx) => {
  console.log(ctx.cookies.get("token"), "sso退出登录时传来的cookie的token值");
  console.log(registeredList, "需要退出的系统");
  await ctx.cookies.set("token", null);

  ctx.set("Access-Control-Allow-Credentials", true);
  ctx.body = registeredList;
});

module.exports = router;
