const router = require("koa-router")();
const service = require("../service");

router.get("/", async (ctx) => {
  const token = ctx.query.token;
  const result = {
    error: 1,
  };

  if (service.isTokenVailid(token)) {
    result.error = 0;
    result.userId = "admin";
  }
  ctx.body = result;
});

module.exports = router;
