
import { InjectQueue } from "@nestjs/bullmq";
import {
	ConflictException,
	Injectable,
	Logger,
	NotFoundException,
	UnprocessableEntityException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectEntityManager } from "@nestjs/typeorm";
import BigNumber from "bignumber.js";
import { Queue } from "bullmq";
import _ from "lodash";
import {
	EntityManager,
	FindOneOptions,
	FindOptionsSelect,
} from "typeorm";
import { v4 as uuidv4 } from "uuid";

import { AppConfig } from "../app/@types/app.interfaces.js";
import { QueueName } from "../app/@types/queues.enum.js";
import { Player } from "../players/@types/players.type.js";
import { PlayerEntity } from "../players/players.entity.js";
import { PlayersService } from "../players/players.service.js";
import {
	BattleJobData,
	BattleOutcome,
	BattleResult,
	BattleSnapshot,
	LootResourcesResult,
	TurnSnapshot,
} from "./@types/battles.interface.js";
import {
	Battle,
	CreateBattle,
	CreateTurn,
	InGameDifficulty,
	PlayerInBattle,
	Turn,
	UpdateBattle,
} from "./@types/battles.type.js";
import { BattleEntity } from "./battles.entity.js";
import { BattleLocksService } from "./locks.service.js";
import { TurnEntity } from "./turns.entity.js";

@Injectable()
export class BattlesService {
	private readonly logger = new Logger(this.constructor.name);
	private readonly inGameDifficulty: InGameDifficulty;

	constructor(
		@InjectEntityManager()
		private readonly entityManager: EntityManager,
		@InjectQueue(QueueName.Battles)
		private readonly battlesQueue: Queue<BattleJobData>,
		private readonly configService: ConfigService<AppConfig, true>,
		private readonly battleLocksService: BattleLocksService,
		private readonly playersService: PlayersService,
	) {
		this.inGameDifficulty = this.configService.get("inGame.difficulty", { infer: true });
	}

	public async create(createBattle: CreateBattle, entityManager: EntityManager): Promise<Battle> {
		const battlesRepository = entityManager.getRepository(BattleEntity);

		const insertBattleResult = await battlesRepository.insert(createBattle);

		const battleId: string = insertBattleResult.identifiers[0].id;

		const battle = await battlesRepository.findOneBy({
			id: battleId,
		});

		if (!battle) {
			throw new NotFoundException("Battle not found");
		}

		this.logger.debug("CREATED_BATTLE", {
			createBattle,
			battle,
		});

		return battle;
	}

	public async update(battleId: string, updateBattle: UpdateBattle, entityManager: EntityManager): Promise<Battle> {
		const battlesRepository = entityManager.getRepository(BattleEntity);

		await battlesRepository.update(battleId, updateBattle);

		const battle = await battlesRepository.findOneBy({
			id: battleId,
		});

		if (!battle) {
			throw new NotFoundException("Battle not found");
		}

		this.logger.debug("UPDATED_BATTLE", {
			updateBattle,
			battle,
		});

		return battle;
	}

	private async createTurn(createTurn: CreateTurn, entityManager: EntityManager): Promise<Turn> {
		const turnsRepository = entityManager.getRepository(TurnEntity);

		const insertTurnResult = await turnsRepository.insert(createTurn);

		const turnId: string = insertTurnResult.identifiers[0].id;

		const turn = await turnsRepository.findOneBy({
			id: turnId,
		});

		if (!turn) {
			throw new NotFoundException("Turn not found");
		}

		this.logger.debug("CREATED_BATTLE", {
			createTurn,
			turn,
		});

		return turn;
	}

	private async getBattlePlayers(
		challengerId: string,
		opponentId: string,
		select?: FindOptionsSelect<PlayerEntity>,
		entityManager?: EntityManager,
	): Promise<{
		challenger: Player,
		opponent: Player,
	}> {
		entityManager ??= this.entityManager;

		this.logger.debug("GET_BATTLE_PLAYERS::PAYLOAD", {
			challengerId,
			opponentId,
			select,
		});

		const playersRepository = entityManager.getRepository(PlayerEntity);

		const findChallengerOptions: FindOneOptions<PlayerEntity> = select ? {
			select,
			where: { id: challengerId },
		} : {
			where: { id: challengerId },
		};

		const challenger: Player | null = await playersRepository.findOne(findChallengerOptions);

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

		const opponent: Player | null = await playersRepository.findOne(findOpponentOptions);

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

	private getBattleOutcome(player1: PlayerInBattle, player2: PlayerInBattle): BattleOutcome {
		const player1IsDead = player1.hitPoints === 0;
		const player2IsDead = player2.hitPoints === 0;

		if (!player1IsDead && !player2IsDead) {
			throw new UnprocessableEntityException("At least one Player must be dead in order to get a Battle result");
		}

		const battleOutcome = player1IsDead ? {
			winner: player2,
			loser: player1,
		} : {
			winner: player1,
			loser: player2,
		};

		return battleOutcome;
	}

	private hasBattleEnded(player1: PlayerInBattle, player2: PlayerInBattle): boolean {
		const player1IsDead = player1.hitPoints === 0;
		const player2IsDead = player2.hitPoints === 0;

		const hasBattleEnded = player1IsDead || player2IsDead;

		return hasBattleEnded;
	}

	private calculateDamage(
		attacker: PlayerInBattle,
		defender: PlayerInBattle,
		turnSnapshot: Partial<TurnSnapshot>,
	): void {
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
			.dividedBy(defender.initialHitPoints)
			.times(100);

		const attackReductionMultiplier = new BigNumber(100).minus(defenderHitPointsReducedPercentage)
			.dividedBy(100)
			.toNumber();

		const newDefenderAttackCandidate = new BigNumber(defender.attack).times(attackReductionMultiplier)
			.integerValue(BigNumber.ROUND_HALF_DOWN)
			.toNumber();

		const halvedAttack = new BigNumber(defender.initialAttack).dividedBy(2);
		const attackCap = halvedAttack
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

		turnSnapshot.newDefenderHitPoints = newDefenderHitPoints.toNumber();
		turnSnapshot.defenderHitPointsReducedPercentage = defenderHitPointsReducedPercentage.toNumber();
		turnSnapshot.attackReductionMultiplier = attackReductionMultiplier;
		turnSnapshot.newDefenderAttackCandidate = newDefenderAttackCandidate;
		turnSnapshot.halvedAttack = halvedAttack.toNumber();
		turnSnapshot.attackCap = attackCap;
		turnSnapshot.newDefenderAttack = newDefenderAttack;
	}

	private getHitChanceExponentBasedOnInGameDifficulty(inGameDifficulty: InGameDifficulty): number {
		switch (inGameDifficulty) {
			case "VERY_EASY":
				return 0.5;

			case "EASY":
				return 0.8;

			case "NORMAL":
				return 1;

			case "MEDIUM":
				return 1.1;

			case "HARD":
				return 1.3;

			case "VERY_HARD":
				return 1.5;

			default:
				return 1;
		}
	}

	/*
		Scaled Probability Formula

		Use a sigmoid-style curve to calculate hit chance (with hit chance exponent based on in-game
		difficulty):
			• hitChance =
				attack^hitChanceExponent / (attack^hitChanceExponent + defense^hitChanceExponent)
		Properties (Considering In-Game Difficulty NORMAL):
			• Attack = Defense => Hit Chance 50%
			• As Defense > Attack => Hit Chance goes closer to 0%
			• As Defense < Attack => Hit Chance goes closer to 100%
	*/
	private isHit(attacker: PlayerInBattle, defender: PlayerInBattle, turnSnapshot: Partial<TurnSnapshot>): boolean {
		this.logger.debug("HIT_OR_MISS::PAYLOAD", {
			attacker,
			defender,
		});

		const hitChanceExponent = this.getHitChanceExponentBasedOnInGameDifficulty(this.inGameDifficulty);

		const attackerAttack = new BigNumber(attacker.attack);
		const defenderDefense = new BigNumber(defender.defense);

		const hitChance = attackerAttack.pow(hitChanceExponent)
			.dividedBy(attackerAttack.pow(hitChanceExponent).plus(defenderDefense.pow(hitChanceExponent)));

		const hitChancePercentage = hitChance.times(100).toNumber();

		const attackRoll = Math.random();

		const isHit = new BigNumber(attackRoll).lte(hitChance);

		this.logger.debug("HIT_OR_MISS::RESULT", {
			attacker,
			defender,
			hitChance: hitChance.toNumber(),
			hitChancePercentage,
			attackRoll,
			isHit,
		});

		turnSnapshot.hitChance = hitChance.toNumber();
		turnSnapshot.hitChancePercentage = hitChancePercentage;
		turnSnapshot.attackRoll = attackRoll;
		turnSnapshot.isHit = isHit;

		return isHit;
	}

	public async battle(
		challengerId: string,
		opponentId: string,
		battleId: string,
		entityManager: EntityManager,
	): Promise<BattleResult> {
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
			entityManager,
		);

		let attacker: PlayerInBattle = {
			..._.cloneDeep(challenger),
			initialAttack: challenger.attack,
			initialHitPoints: challenger.hitPoints,
		};
		let defender: PlayerInBattle = {
			..._.cloneDeep(opponent),
			initialAttack: opponent.attack,
			initialHitPoints: opponent.hitPoints,
		};

		let bothAreAlive = true;
		let turnIndex = 0;

		let battleResult: BattleResult;
		const turnsSnapshot: Array<TurnSnapshot> = [];

		while (bothAreAlive) {
			this.logger.debug(`RUN_BATTLE_LOOP::TURN_${turnIndex}`, {
				challenger,
				opponent,
				attacker,
				defender,
				turnIndex,
			});

			const turnSnapshot: Partial<TurnSnapshot> = {
				turnIndex,
				initialAttacker: attacker,
				initialDefender: defender,
			};

			const isHit = this.isHit(attacker, defender, turnSnapshot);

			turnSnapshot.isLastTurn = false;

			if (isHit) {
				this.calculateDamage(attacker, defender, turnSnapshot);

				const hasBattleEnded = this.hasBattleEnded(attacker, defender);

				turnSnapshot.isLastTurn = hasBattleEnded;

				if (hasBattleEnded) {
					const battleOutcome = this.getBattleOutcome(attacker, defender);

					battleResult = {
						...battleOutcome,
						turnsSnapshot: [],
					};

					this.logger.debug(`RUN_BATTLE_LOOP::TURN_${turnIndex}::BATTLE_ENDED`, {
						challenger,
						opponent,
						attacker,
						defender,
						turnIndex,
						battleOutcome,
					});

					bothAreAlive = false;
				}
			}

			turnSnapshot.attacker = attacker;
			turnSnapshot.defender = defender;

			await this.createTurn(
				{
					index: turnIndex,
					battleId,
					/* Guaranteed to be fully set (not Partial<TurnSnapshot>) */
					turnSnapshot: turnSnapshot as TurnSnapshot,
				},
				entityManager,
			);

			/* Guaranteed to be fully set (not Partial<TurnSnapshot>) */
			turnsSnapshot.push(turnSnapshot as TurnSnapshot);

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
			/* Guaranteed to be set */
			battleResult: battleResult!,
		});

		/* Guaranteed to be set */
		battleResult!.turnsSnapshot = turnsSnapshot;

		/* Guaranteed to be set */
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

	public async lootResources(
		winner: Player,
		loser: Player,
		entityManager: EntityManager,
	): Promise<LootResourcesResult> {
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

		await this.playersService.awardVictoryLoot(
			winner,
			loser,
			goldLoot,
			silverLoot,
			entityManager,
		);

		this.logger.debug("LOOT_RESOURCES::RESULT", {
			winner,
			loser,
			lootPercentage,
			goldLoot,
			silverLoot,
		});

		const loot = new BigNumber(goldLoot).plus(silverLoot)
			.toNumber();

		const winnerGold = new BigNumber(winner.gold);
		const winnerSilver = new BigNumber(winner.silver);
		const loserGold = new BigNumber(loser.gold);
		const loserSilver = new BigNumber(loser.silver);

		const battleSnapshot: BattleSnapshot = {
			loot,
			goldLoot,
			silverLoot,
			lootPercentage,
			winner: {
				gold: {
					before: winnerGold.minus(goldLoot).toNumber(),
					after: winnerGold.plus(goldLoot).toNumber(),
				},
				silver: {
					before: winnerSilver.minus(silverLoot).toNumber(),
					after: winnerSilver.plus(silverLoot).toNumber(),
				},
			},
			loser: {
				gold: {
					before: loserGold.minus(goldLoot).toNumber(),
					after: loserGold.plus(goldLoot).toNumber(),
				},
				silver: {
					before: loserSilver.minus(silverLoot).toNumber(),
					after: loserSilver.plus(silverLoot).toNumber(),
				},
			},
		};

		return { battleSnapshot };
	}

	private ensurePlayersHaveEnoughResources(player1: Player, player2: Player): void {
		if (
			(!player1.gold && !player1.silver)
			|| (!player2.gold && !player2.silver)
		) {
			throw new ConflictException("At least one of the Players is out of resources! Minimum of 1 Gold or 1 Silver is required. Buy more or watch ads to collect ’em!");
		}
	}

	public async submit(challengerId: string, opponentId: string): Promise<void> {
		const { challenger, opponent } = await this.getBattlePlayers(
			challengerId,
			opponentId,
			{
				id: true,
				name: true,
				gold: true,
				silver: true,
			},
		);

		this.ensurePlayersHaveEnoughResources(challenger, opponent);

		await this.battleLocksService.acquireLocks(challenger.id, opponent.id);

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
