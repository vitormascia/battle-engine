import { FastifyRequest } from "fastify";

import { User } from "../../middlewares/@types/middleware.type.js";

export type GuardRequest = FastifyRequest & {
	user?: User
}
