export function createRequest({
  method = "GET",
  headers = {},
  query = {},
  body = {},
  remoteAddress = "203.0.113.10",
} = {}) {
  return {
    method,
    headers,
    query,
    body,
    socket: { remoteAddress },
  };
}

export function createResponse() {
  const headers = new Map();

  return {
    statusCode: 200,
    body: undefined,
    headers,
    setHeader(name, value) {
      headers.set(String(name).toLowerCase(), value);
      return this;
    },
    getHeader(name) {
      return headers.get(String(name).toLowerCase());
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(value) {
      this.body = value;
      return this;
    },
    send(value) {
      this.body = value;
      return this;
    },
    end(value) {
      this.body = value;
      return this;
    },
  };
}

export async function invoke(handler, requestOptions) {
  const req = createRequest(requestOptions);
  const res = createResponse();
  await handler(req, res);
  return { req, res };
}
