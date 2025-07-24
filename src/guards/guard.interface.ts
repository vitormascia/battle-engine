import { FastifyRequest } from "fastify";

import { User } from "../middlewares/middleware.type.js";

export type GuardRequest = FastifyRequest & {
	user?: User
}
