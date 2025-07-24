
import { InjectQueue } from "@nestjs/bullmq";
import {
	Injectable,
	Logger,
	NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Queue } from "bullmq";
import { Repository } from "typeorm";
import { v4 as uuidv4 } from "uuid";

import { PlayerEntity } from "../players/players.entity.js";
import { SubmitBattleBodyDto } from "./battles.dtos.js";

interface BattleJobData {
	traceId: string;
	challengerId: string;
	opponentId: string;
}

// interface BattleJob {
// 	data: BattleJobData
// }

@Injectable()
export class BattlesService {
	private readonly logger = new Logger(this.constructor.name);

	constructor(
		@InjectRepository(PlayerEntity)
		private readonly playersRepository: Repository<PlayerEntity>,
		@InjectQueue("Battles")
		private readonly battlesQueue: Queue<BattleJobData>,
	) { }

	public async submit(submitBattleDto: SubmitBattleBodyDto): Promise<void> {
		const challengerPlayer = await this.playersRepository.findOne({
			select: {
				id: true,
				name: true,
			},
			where: { id: submitBattleDto.challengerId },
		});

		if (!challengerPlayer) {
			throw new NotFoundException("Challenger Player not found");
		}

		const opponentPlayer = await this.playersRepository.findOne({
			select: {
				id: true,
				name: true,
			},
			where: { id: submitBattleDto.opponentId },
		});

		if (!opponentPlayer) {
			throw new NotFoundException("Opponent Player not found");
		}

		const traceId = uuidv4();
		const battleJob = {
			traceId,
			challengerId: challengerPlayer.id,
			opponentId: opponentPlayer.id,
		};

		await this.battlesQueue.add(
			`${challengerPlayer.name}[VS]${opponentPlayer.name}`,
			battleJob,
		);

		this.logger.debug("ENQUEUED_BATTLE_SUBMISSION", { job: battleJob });
	}
}
