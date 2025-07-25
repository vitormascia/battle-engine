
import { InjectQueue } from "@nestjs/bullmq";
import {
	Injectable,
	Logger,
	NotFoundException,
	UnprocessableEntityException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import BigNumber from "bignumber.js";
import { Queue } from "bullmq";
import _ from "lodash";
import {
	FindOneOptions,
	FindOptionsSelect,
	Repository,
} from "typeorm";
import { v4 as uuidv4 } from "uuid";

import { QueueName } from "../app/queues.enum.js";
import { PlayerEntity } from "../players/players.entity.js";
import { Player } from "../players/players.type.js";
import { SubmitBattleBodyDto } from "./battles.dtos.js";
import { BattleJobData, BattleResult } from "./battles.interface.js";
import { PlayerInBattle } from "./battles.type.js";

@Injectable()
export class BattlesService {
	private readonly logger = new Logger(this.constructor.name);

	constructor(
		@InjectRepository(PlayerEntity)
		private readonly playersRepository: Repository<PlayerEntity>,
		// @InjectRepository(BattleEntity)
		// private readonly battlesRepository: Repository<BattleEntity>,
		// @InjectRepository(TurnEntity)
		// private readonly turnsRepository: Repository<TurnEntity>,
		@InjectQueue(QueueName.Battles)
		private readonly battlesQueue: Queue<BattleJobData>,
	) { }

	private async getBattlePlayers(
		challengerId: string,
		opponentId: string,
		select?: FindOptionsSelect<PlayerEntity>,
	): Promise<{
		challenger: Player,
		opponent: Player,
	}> {
		this.logger.debug("GET_BATTLE_PLAYERS::PAYLOAD", {
			challengerId,
			opponentId,
			select,
		});

		const findChallengerOptions: FindOneOptions<PlayerEntity> = select ? {
			select,
			where: { id: challengerId },
		} : {
			where: { id: challengerId },
		};

		const challenger: Player | null = await this.playersRepository.findOne(findChallengerOptions);

		if (!challenger) {
			throw new NotFoundException("Challenger Player not found");
		}

		this.logger.debug("GET_BATTLE_PLAYERS::FOUND_CHALLENGER", { challenger });

		const findOpponentOptions: FindOneOptions<PlayerEntity> = select ? {
			select,
			where: { id: opponentId },
		} : {
			where: { id: opponentId },
		};

		const opponent: Player | null = await this.playersRepository.findOne(findOpponentOptions);

		if (!opponent) {
			throw new NotFoundException("Opponent Player not found");
		}

		this.logger.debug("GET_BATTLE_PLAYERS::FOUND_OPPONENT", { opponent });

		const battlePlayers = {
			challenger,
			opponent,
		};

		this.logger.debug("GET_BATTLE_PLAYERS::RESULT", { battlePlayers });

		return battlePlayers;
	}

	private getBattleResult(player1: PlayerInBattle, player2: PlayerInBattle): BattleResult {
		const player1IsDead = player1.hitPoints === 0;
		const player2IsDead = player2.hitPoints === 0;

		if (!player1IsDead && !player2IsDead) {
			throw new UnprocessableEntityException("At least one Player must be dead in order to get a Battle result");
		}

		const battleResult = player1IsDead ? {
			winner: player2,
			loser: player1,
		} : {
			winner: player1,
			loser: player2,
		};

		return battleResult;
	}

	private hasBattleEnded(player1: PlayerInBattle, player2: PlayerInBattle): boolean {
		const player1IsDead = player1.hitPoints === 0;
		const player2IsDead = player2.hitPoints === 0;

		const hasBattleEnded = player1IsDead || player2IsDead;

		return hasBattleEnded;
	}

	private calculateDamage(attacker: PlayerInBattle, defender: PlayerInBattle): void {
		this.logger.debug("CALCULATE_DAMAGE::PAYLOAD", {
			attacker,
			defender,
		});

		const newDefenderHitPoints = new BigNumber(defender.hitPoints).minus(attacker.attack);

		if (newDefenderHitPoints.isZero() || newDefenderHitPoints.isNegative()) {
			defender.hitPoints = 0;

			this.logger.debug("CALCULATE_DAMAGE::PLAYER_EXECUTED", {
				winner: attacker,
				loser: defender,
			});

			return;
		}

		defender.hitPoints = newDefenderHitPoints.toNumber();

		const defenderHitPointsReducedPercentage = new BigNumber(attacker.attack)
			.dividedBy(defender.originalHitPoints)
			.times(100);

		const attackReductionMultiplier = new BigNumber(100).minus(defenderHitPointsReducedPercentage)
			.dividedBy(100)
			.toNumber();

		const newDefenderAttackCandidate = new BigNumber(defender.attack).times(attackReductionMultiplier)
			.integerValue(BigNumber.ROUND_HALF_DOWN)
			.toNumber();

		const attackCap = new BigNumber(defender.originalAttack)
			.dividedBy(2)
			.integerValue(BigNumber.ROUND_HALF_DOWN)
			.toNumber();

		const newDefenderAttack = Math.max(
			newDefenderAttackCandidate,
			attackCap,
		);

		defender.attack = newDefenderAttack;

		this.logger.debug("CALCULATE_DAMAGE::RESULT", {
			attacker,
			defender,
			newDefenderHitPoints,
			defenderHitPointsReducedPercentage,
			attackReductionMultiplier,
			newDefenderAttackCandidate,
			attackCap,
			newDefenderAttack,
		});
	}

	/*
		Scaled Probability Formula

		Use a sigmoid-style curve to calculate hit chance:
			• hitChance = attack / (attack + defense)
		Properties:
			• Attack = Defense => Hit Chance 50%
			• As Defense > Attack => Hit Chance goes closer to 0%
			• As Defense < Attack => Hit Chance goes closer to 100%
	*/
	private isHit(attacker: PlayerInBattle, defender: PlayerInBattle): boolean {
		this.logger.debug("HIT_OR_MISS::PAYLOAD", {
			attacker,
			defender,
		});

		const hitChance = new BigNumber(attacker.attack)
			.dividedBy(new BigNumber(attacker.attack).plus(defender.originalDefense));

		const attackRoll = Math.random();

		const isHit = new BigNumber(attackRoll).lte(hitChance);

		this.logger.debug("HIT_OR_MISS::RESULT", {
			attacker,
			defender,
			hitChance: hitChance.toNumber(),
			hitChancePercentage: hitChance.times(100).toNumber(),
			attackRoll,
			isHit,
		});

		return isHit;
	}

	public async runBattleLoop(challengerId: string, opponentId: string): Promise<BattleResult> {
		this.logger.debug("RUN_BATTLE_LOOP::PAYLOAD", {
			challengerId,
			opponentId,
		});

		const { challenger, opponent } = await this.getBattlePlayers(
			challengerId,
			opponentId,
			{
				id: true,
				name: true,
				gold: true,
				silver: true,
				attack: true,
				defense: true,
				hitPoints: true,
			},
		);

		let attacker: PlayerInBattle = {
			..._.cloneDeep(challenger),
			originalAttack: challenger.attack,
			originalDefense: challenger.defense,
			originalHitPoints: challenger.hitPoints,
		};
		let defender: PlayerInBattle = {
			..._.cloneDeep(opponent),
			originalAttack: opponent.attack,
			originalDefense: opponent.defense,
			originalHitPoints: opponent.hitPoints,
		};

		let bothAreAlive = true;
		let turnIndex = 0;

		let battleResult: BattleResult;

		while (bothAreAlive) {
			this.logger.debug(`RUN_BATTLE_LOOP::TURN_${turnIndex}`, {
				challenger,
				opponent,
				attacker,
				defender,
				turnIndex,
			});

			const isHit = this.isHit(attacker, defender);

			if (isHit) {
				this.calculateDamage(attacker, defender);

				const hasBattleEnded = this.hasBattleEnded(attacker, defender);

				if (hasBattleEnded) {
					battleResult = this.getBattleResult(attacker, defender);

					this.logger.debug(`RUN_BATTLE_LOOP::TURN_${turnIndex}::BATTLE_ENDED`, {
						challenger,
						opponent,
						attacker,
						defender,
						turnIndex,
						battleResult,
					});

					bothAreAlive = false;
				}
			}

			const nextAttacker = _.cloneDeep(defender);
			const nextDefender = _.cloneDeep(attacker);

			attacker = nextAttacker;
			defender = nextDefender;

			++turnIndex;
		}

		this.logger.debug("RUN_BATTLE_LOOP::RESULT", {
			challenger,
			opponent,
			attacker,
			defender,
			turnIndex,
			battleResult: battleResult!,
		});

		return battleResult!;
	}

	private randomizeLootPercentage(): number {
		const MINIMUM_LOOT_PERCENTAGE = 5;
		const MAXIMUM_LOOT_PERCENTAGE = 10;
		const seed = Math.random();
		const lootPercentage = new BigNumber(seed)
			.times(new BigNumber(MAXIMUM_LOOT_PERCENTAGE)
				.minus(MINIMUM_LOOT_PERCENTAGE)
				.plus(1))
			.integerValue(BigNumber.ROUND_FLOOR)
			.plus(MINIMUM_LOOT_PERCENTAGE)
			.dividedBy(100)
			.toNumber();

		return lootPercentage;
	}

	public async lootResources(winner: Player, loser: Player): Promise<void> {
		this.logger.debug("LOOT_RESOURCES::PAYLOAD", {
			winner,
			loser,
		});

		const lootPercentage = this.randomizeLootPercentage();
		const goldLoot = new BigNumber(loser.gold).times(lootPercentage)
			.integerValue(BigNumber.ROUND_CEIL)
			.toNumber();
		const silverLoot = new BigNumber(loser.silver).times(lootPercentage)
			.integerValue(BigNumber.ROUND_CEIL)
			.toNumber();

		await this.playersRepository.decrement({ id: loser.id }, "gold", goldLoot);
		await this.playersRepository.decrement({ id: loser.id }, "silver", silverLoot);

		await this.playersRepository.increment({ id: winner.id }, "gold", goldLoot);
		await this.playersRepository.increment({ id: winner.id }, "silver", silverLoot);

		this.logger.debug("LOOT_RESOURCES::RESULT", {
			winner,
			loser,
			lootPercentage,
			goldLoot,
			silverLoot,
		});
	}

	public async submit(submitBattleDto: SubmitBattleBodyDto): Promise<void> {
		const { challenger, opponent } = await this.getBattlePlayers(
			submitBattleDto.challengerId,
			submitBattleDto.opponentId,
			{
				id: true,
				name: true,
			},
		);

		const traceId = uuidv4();
		const battleJobData: BattleJobData = {
			traceId,
			challengerId: challenger.id,
			opponentId: opponent.id,
		};

		await this.battlesQueue.add(
			`${challenger.name}[VS]${opponent.name}`,
			battleJobData,
		);

		this.logger.debug("ENQUEUED_BATTLE_SUBMISSION", { job: battleJobData });
	}
}
