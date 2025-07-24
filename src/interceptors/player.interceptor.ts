import {
	CallHandler,
	ExecutionContext,
	Injectable,
	Logger,
	NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

import { InterceptorRequest } from "./interceptor.interface.js";

@Injectable()
export class PlayerInterceptor implements NestInterceptor {
	private readonly logger = new Logger(this.constructor.name);

	constructor() { }

	public intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const req = context.switchToHttp().getRequest<InterceptorRequest>();

		this.logger.debug("FETCHING_USER_DATA_FROM_HEADERS", {
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
		});

		const now = Date.now();

		return next
			.handle()
			.pipe(tap(() => {
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
					afterInMilliseconds: Date.now() - now,
				});
			}));
	}
}
