import { Elysia } from "elysia";
import { agendaRoutes } from "./src/modules/agenda/agenda.controller";

const app = new Elysia().use(agendaRoutes).listen(3001);
console.log("Mock API running on 3001");
