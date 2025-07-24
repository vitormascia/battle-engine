import { FastifyRequest } from "fastify";

import { User } from "../middlewares/middleware.type.js";

export type InterceptorRequest = FastifyRequest & {
	user?: User;
}
