
import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { PlayerEntity } from "../players/players.entity.js";

@Injectable()
export class BattlesService {
	private readonly logger = new Logger(this.constructor.name);

	constructor(@InjectRepository(PlayerEntity) private playersRepository: Repository<PlayerEntity>) { }

	public submit(playerDto: any): void {
		const p = this.playersRepository;

		this.logger.debug("SUBMITTED_BATTLE", { playerDto, p: p.find.name });
	}
}
