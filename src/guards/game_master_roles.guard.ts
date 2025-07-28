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
import { GameMasterEntity } from "../modules/game_masters/game_masters.entity.js";
import { GuardRequest } from "./@types/guard.interface.js";
import { GameMasterRole } from "./@types/roles.enum.js";

@Injectable()
export class GameMasterRolesGuard implements CanActivate {
	private readonly logger = new Logger(this.constructor.name);

	constructor(
		private reflector: Reflector,
		@InjectRepository(GameMasterEntity)
		private readonly gameMastersRepository: Repository<GameMasterEntity>,
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

		const gameMasterId = req.headers["user-id"];

		if (typeof gameMasterId !== "string") {
			throw new UnauthorizedException("User-Id Header has to be set");
		}

		if (!isUUID(gameMasterId)) {
			throw new UnauthorizedException("User-Id Header has to be a valid UUID");
		}

		const gameMaster = await this.gameMastersRepository.findOne({
			select: {
				id: true,
				roles: true,
			},
			where: {
				id: gameMasterId,
			},
		});

		if (!gameMaster) {
			throw new UnauthorizedException("User-Id Header doesn’t reference a Game Master");
		}

		req.user = gameMaster;

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

		const requiredRoles = this.reflector.getAllAndOverride<Array<GameMasterRole>>(ROLES_KEY, [
			context.getHandler(),
			context.getClass(),
		]);

		const gameMasterHasRequiredRoles = requiredRoles.some((role) => gameMaster.roles.includes(role));

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
			gameMasterHasRequiredRoles,
		});

		return gameMasterHasRequiredRoles;
	}
}
