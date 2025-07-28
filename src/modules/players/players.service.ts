import {
	Injectable,
	Logger,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { EntityManager, Repository } from "typeorm";

import { Leaderboard } from "./@types/players.interface.js";
import { Player } from "./@types/players.type.js";
import { CreatePlayerBodyDto } from "./players.dtos.js";
import { PlayerEntity } from "./players.entity.js";

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

	public async incrementScore(
		playerId: string,
		score: number,
		entityManager: EntityManager,
	): Promise<void> {
		const playersRepository = entityManager.getRepository(PlayerEntity);

		await playersRepository.increment({ id: playerId }, "score", score);
	}

	public async awardVictoryLoot(
		winner: Player,
		loser: Player,
		goldLoot: number,
		silverLoot: number,
		entityManager: EntityManager,
	): Promise<void> {
		const playersRepository = entityManager.getRepository(PlayerEntity);

		await playersRepository.decrement({ id: loser.id }, "gold", goldLoot);
		await playersRepository.decrement({ id: loser.id }, "silver", silverLoot);

		await playersRepository.increment({ id: winner.id }, "gold", goldLoot);
		await playersRepository.increment({ id: winner.id }, "silver", silverLoot);
	}

	public async getLeaderboard(): Promise<Leaderboard> {
		const [players, playersAmount] = await this.playersRepository.findAndCount({
			select: {
				id: true,
				score: true,
			},
			order: {
				score: "DESC",
			},
		});

		const leaderboard = {
			size: playersAmount,
			players: players.map(({ id, score }, rank) => ({
				rank: ++rank,
				id,
				score,
			})),
		};

		return leaderboard;
	}
}
