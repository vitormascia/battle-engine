import {
	Inject,
	Injectable,
	Logger,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Redis } from "ioredis";

import { LockPlayersForBattleResult } from "./battles.interface.js";

@Injectable()
export class BattleLocksService {
	private readonly logger = new Logger(this.constructor.name);
	private readonly battleLockTtl: number;

	constructor(
		@Inject("REDIS_CLIENT")
		private readonly redisClient: Redis,
		private readonly configService: ConfigService,
	) {
		this.battleLockTtl = this.configService.get<number>("databases.redis.ttls.battleLock")!;
	}

	private async lockPlayersForBattle(
		player1LockKey: string,
		player2LockKey: string,
	): Promise<LockPlayersForBattleResult> {
		/*
			Try to set each lock only if it doesn't already exist (NX), and set it to expire
			after 300 seconds (EX). This ensures that the lock is temporary and auto-clears if
			something goes wrong (like a crash)
		*/
		const isPlayer1Locked = await this.redisClient.set(
			player1LockKey,
			"LOCKED",
			/* EXpiry token */
			"EX",
			/* Expire the key to avoid stale locks */
			this.battleLockTtl,
			/* Only set if key does Not eXist */
			"NX",
		);
		const isPlayer2Locked = await this.redisClient.set(
			player2LockKey,
			"LOCKED",
			/* EXpiry token */
			"EX",
			/* Expire the key to avoid stale locks */
			this.battleLockTtl,
			/* Only set if key does Not eXist */
			"NX",
		);

		const lockPlayersForBattleResult = {
			isPlayer1Locked,
			isPlayer2Locked,
		};

		this.logger.debug("LOCKED_PLAYERS_FOR_BATTLE", {
			player1LockKey,
			player2LockKey,
		});

		return lockPlayersForBattleResult;
	}

	public async unlockPlayersForBattle(
		player1LockKey: string,
		player2LockKey: string,
	): Promise<void> {
		await this.redisClient.del(player1LockKey);
		await this.redisClient.del(player2LockKey);

		this.logger.debug("UNLOCKED_PLAYERS_FOR_BATTLE", {
			player1LockKey,
			player2LockKey,
		});
	}

	public async acquireLocks(player1Id: string, player2Id: string): Promise<void> {
		const player1LockKey = `lock:player:${player1Id}`;
		const player2LockKey = `lock:player:${player2Id}`;

		const { isPlayer1Locked, isPlayer2Locked } = await this.lockPlayersForBattle(player1Id, player2Id);

		/* If either Player is already locked (i.e., already in a battle), abort the operation */
		if (!isPlayer1Locked || !isPlayer2Locked) {
			/* Clean up: if one Player got locked but the other didn’t, release the first lock */
			if (isPlayer1Locked) await this.redisClient.del(player1LockKey);

			if (isPlayer2Locked) await this.redisClient.del(player2LockKey);

			/* Throw or handle error: someone is already in a battle */
			throw new Error("One or both players are already in a battle");
		}

		this.logger.debug("");
	}
}
