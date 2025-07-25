import {
	Injectable,
	Logger,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { CreatePlayerBodyDto } from "./players.dtos.js";
import { PlayerEntity } from "./players.entity.js";
import { Player } from "./players.type.js";

@Injectable()
export class PlayersService {
	private readonly logger = new Logger(this.constructor.name);

	constructor(@InjectRepository(PlayerEntity) private playersRepository: Repository<PlayerEntity>) { }

	public async create(createPlayerDto: CreatePlayerBodyDto): Promise<Player> {
		/* remove possible duplicities */
		createPlayerDto.roles = createPlayerDto.roles ? [...new Set(createPlayerDto.roles)] : createPlayerDto.roles;

		const player: Player = await this.playersRepository.save(createPlayerDto);

		this.logger.debug("CREATED_PLAYER", { player });

		return player;
	}
}
