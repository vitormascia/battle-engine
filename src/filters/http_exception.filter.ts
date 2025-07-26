import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
	Logger,
} from "@nestjs/common";
import { FastifyReply } from "fastify";

import { FilterRequest } from "./filter.interface.js";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
	private readonly logger = new Logger(this.constructor.name);

	constructor() { }

	public catch(exception: HttpException, host: ArgumentsHost): void {
		const ctx = host.switchToHttp();
		const req = ctx.getRequest<FilterRequest>();
		const res = ctx.getResponse<FastifyReply>();

		const status = exception.getStatus();

		const now = new Date();

		this.logger.error("FETCHING_USER_DATA_FROM_HEADERS", {
			request: {
				method: req.method,
				url: req.url,
				headers: req.headers,
				host: req.host,
				hostName: req.hostname,
				socket: {
					remoteAddress: req.socket.remoteAddress,
					remotePort: req.socket.remotePort,
				},
			},
			response: {
				status: {
					code: res.statusCode,
				},
			},
		});

		res
			.status(status)
			.type("application/json")
			.send({
				statusCode: status,
				timestamp: now.toISOString(),
				path: req.url,
			});
	}
}
