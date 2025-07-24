import {
	Injectable,
	Logger,
	NestMiddleware,
} from "@nestjs/common";
import {
	FastifyReply,
	FastifyRequest,
} from "fastify";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
	private readonly logger = new Logger(this.constructor.name);

	constructor() { }

	public use(
		req: FastifyRequest["raw"],
		res: FastifyReply["raw"],
		next: (error?: any) => void,
	): void {
		this.logger.debug("INCOMMING_REQUEST", {
			request: {
				method: req.method,
				url: req.url,
				headers: req.headers,
				httpVersion: req.httpVersion,
				socket: {
					remoteAddress: req.socket.remoteAddress,
					remotePort: req.socket.remotePort,
				},
			},
			response: {
				status: {
					code: res.statusCode,
					message: res.statusMessage,
				},
				headersSent: res.headersSent,
			},
		});

		res.once("finish", () => {
			this.logger.debug("OUTGOING_RESPONSE", {
				request: {
					method: req.method,
					url: req.url,
					headers: req.headers,
					httpVersion: req.httpVersion,
					socket: {
						remoteAddress: req.socket.remoteAddress,
						remotePort: req.socket.remotePort,
					},
				},
				response: {
					status: {
						code: res.statusCode,
						message: res.statusMessage,
					},
					headersSent: res.headersSent,
				},
			});
		});

		next();
	}
}
