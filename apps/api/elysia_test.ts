import { Elysia, t } from "elysia";

const app = new Elysia()
  .get("/test/:id", ({ params: { id } }) => {
    return { id, type: typeof id };
  }, {
    params: t.Object({
      id: t.Numeric()
    })
  })
  .listen(3000);

console.log("Listening on 3000");
