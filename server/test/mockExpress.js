// test/mockExpress.js — minimal req/res doubles for calling Express
// controllers directly in tests, without needing a running HTTP server.
export function mockRes() {
  return {
    statusCode: 200,
    body: undefined,
    cookies: {}, // name -> { value, options }
    clearedCookies: [], // names cleared via clearCookie()
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
    cookie(name, value, options) {
      this.cookies[name] = { value, options };
      return this;
    },
    clearCookie(name) {
      this.clearedCookies.push(name);
      return this;
    },
  };
}

export function mockReq({ cookies = {}, headers = {}, method = "GET", body = {}, params = {} } = {}) {
  return { cookies, headers, method, body, params };
}
