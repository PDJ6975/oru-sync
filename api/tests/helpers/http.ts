import request from "supertest";
import app from "../../src/app.js";

export const authedRequest = (token: string) => {
  const auth = (req: request.Test) =>
    req.set("Authorization", `Bearer ${token}`);

  return {
    get: (url: string) => auth(request(app).get(url)),
    post: (url: string) => auth(request(app).post(url)),
    patch: (url: string) => auth(request(app).patch(url)),
    delete: (url: string) => auth(request(app).delete(url)),
  };
};
