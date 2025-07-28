import { FastifyRequest } from "fastify";

import { User } from "../../middlewares/@types/middleware.type.js";

export type InterceptorRequest = FastifyRequest & {
	user?: User;
}
