import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
	Logger,
} from "@nestjs/common";
import { FastifyReply } from "fastify";

import { FilterRequest } from "./@types/filter.interface.js";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
	private readonly logger = new Logger(this.constructor.name);

	constructor() { }

	public catch(exception: HttpException, host: ArgumentsHost): void {
		const ctx = host.switchToHttp();

		const req = ctx.getRequest<FilterRequest>();
		const res = ctx.getResponse<FastifyReply>();

		const error = {
			name: exception.name,
			message: exception.message,
			cause: exception.cause,
			stack: exception.stack,
			status: exception.getStatus(),
			response: exception.getResponse(),
			initName: exception.initName(),
			initCause: exception.initCause(),
			initMessage: exception.initMessage(),
		};

		this.logger.error("HTTP_EXCEPTION_FILTER", {
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
			error,
		});

		res
			.status(error.status)
			.type("application/json")
			.send({ error });
	}
}
