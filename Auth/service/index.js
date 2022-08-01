module.exports = {
  isTokenVailid: function (token) {
    // 此处用固定值表示，实际应用时应该使用jwt来生成和校验token
    if (token && token === "passport") {
      return true;
    }
    return false;
  },
};
