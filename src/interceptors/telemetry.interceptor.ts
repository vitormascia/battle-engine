import {
	CallHandler,
	ExecutionContext,
	Injectable,
	Logger,
	NestInterceptor,
} from "@nestjs/common";
import { FastifyReply } from "fastify";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

import { InterceptorRequest } from "./@types/interceptor.interface.js";

@Injectable()
export class TelemetryInterceptor implements NestInterceptor {
	private readonly logger = new Logger(this.constructor.name);

	constructor() { }

	public intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const req = context.switchToHttp().getRequest<InterceptorRequest>();
		const res = context.switchToHttp().getResponse<FastifyReply>();

		this.logger.debug("INCOMMING_REQUEST", {
			request: {
				user: req.user,
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
				statusCode: res.statusCode,
				elapsedTime: res.elapsedTime,
				routeOptions: res.routeOptions.config,
				sent: res.sent,
			},
		});

		const now = Date.now();

		return next
			.handle()
			.pipe(tap(() => {
				const xResponseTime = Date.now() - now;

				res.header("X-Response-Time", xResponseTime.toString());

				this.logger.debug("OUTGOING_RESPONSE", {
					request: {
						user: req.user,
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
						statusCode: res.statusCode,
						elapsedTime: res.elapsedTime,
						routeOptions: res.routeOptions.config,
						sent: res.sent,
					},
					xResponseTime,
				});
			}));
	}
}
