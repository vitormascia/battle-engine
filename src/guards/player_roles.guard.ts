import {
	CanActivate,
	ExecutionContext,
	Injectable,
	Logger,
	UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { validate as isUUID } from "uuid";

import { ROLES_KEY } from "../decorators/roles.decorator.js";
import { PlayerEntity } from "../modules/players/players.entity.js";
import { GuardRequest } from "./@types/guard.interface.js";
import { PlayerRole } from "./@types/roles.enum.js";

@Injectable()
export class PlayerRolesGuard implements CanActivate {
	private readonly logger = new Logger(this.constructor.name);

	constructor(
		private reflector: Reflector,
		@InjectRepository(PlayerEntity)
		private readonly playersRepository: Repository<PlayerEntity>,
	) { }

	public async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest<GuardRequest>();

		this.logger.debug("FETCHING_USER_DATA_FROM_HEADERS", {
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
		});

		const playerId = req.headers["user-id"];

		if (typeof playerId !== "string") {
			throw new UnauthorizedException("User-Id Header has to be set");
		}

		if (!isUUID(playerId)) {
			throw new UnauthorizedException("User-Id Header has to be a valid UUID");
		}

		const player = await this.playersRepository.findOne({
			select: {
				id: true,
				roles: true,
			},
			where: {
				id: playerId,
			},
		});

		if (!player) {
			throw new UnauthorizedException("User-Id Header doesn’t reference a Player");
		}

		req.user = player;

		this.logger.debug("ATTACHED_USER_TO_REQUEST", {
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

		const requiredRoles = this.reflector.getAllAndOverride<Array<PlayerRole>>(ROLES_KEY, [
			context.getHandler(),
			context.getClass(),
		]);

		const playerHasRequiredRoles = requiredRoles.some((role) => player.roles.includes(role));

		this.logger.debug("ROLES_GUARD_RESULT", {
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
			requiredRoles,
			playerHasRequiredRoles,
		});

		return playerHasRequiredRoles;
	}
}
