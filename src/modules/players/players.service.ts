
import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { CreatePlayerBodyDto } from "./players.dtos.js";
import { PlayerEntity } from "./players.entity.js";

@Injectable()
export class PlayersService {
	private readonly logger = new Logger(this.constructor.name);

	constructor(@InjectRepository(PlayerEntity) private playersRepository: Repository<PlayerEntity>) { }

	public async create(playerDto: CreatePlayerBodyDto): Promise<PlayerEntity> {
		/* remove possible duplicities */
		playerDto.roles = playerDto.roles ? [...new Set(playerDto.roles)] : playerDto.roles;

		const player = await this.playersRepository.save(playerDto);

		this.logger.debug("CREATED_PLAYER", { player });

		return player;
	}

	// public findAll(): Promise<Array<PlayerEntity>> {
	// 	return this.playersRepository.find();
	// }

	// public findOne(id: string): Promise<PlayerEntity | null> {
	// 	return this.playersRepository.findOneBy({ id });
	// }

	// public async remove(id: number): Promise<void> {
	// 	await this.playersRepository.delete(id);
	// }
}
