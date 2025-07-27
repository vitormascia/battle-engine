import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import {
	ONE_DAY_IN_SECONDS,
	ONE_SECOND_IN_MILLISECONDS,
} from "../../constants/time.constants.js";
import { QueueName } from "../app/queues.enum.js";
import { PlayersModule } from "../players/players.module.js";
import { RedisModule } from "../redis/redis.module.js";
import { BattlesConsumer } from "./battles.consumer.js";
import { BattlesController } from "./battles.controller.js";
import { BattleEntity } from "./battles.entity.js";
import { BattlesService } from "./battles.service.js";
import { BattleLocksService } from "./locks.service.js";
import { TurnEntity } from "./turns.entity.js";

const BattlesQueueDynamicModule = BullModule.registerQueue({
	name: QueueName.Battles,
	defaultJobOptions: {
		attempts: 3,
		backoff: {
			type: "exponential",
			delay: ONE_SECOND_IN_MILLISECONDS / 2,
			/* 30% jitter to avoid retry spikes */
			jitter: 0.3,
		},
		removeOnComplete: {
			age: ONE_DAY_IN_SECONDS * 2,
		},
		removeOnFail: {
			age: ONE_DAY_IN_SECONDS * 15,
		},
	},
});

@Module({
	imports: [
		TypeOrmModule.forFeature([
			BattleEntity,
			TurnEntity,
		]),
		BattlesQueueDynamicModule,
		RedisModule,
		PlayersModule,
	],
	controllers: [BattlesController],
	providers: [
		BattlesService,
		BattleLocksService,
		BattlesConsumer,
	],
	exports: [
		TypeOrmModule,
		BattlesQueueDynamicModule,
		BattlesService,
		BattleLocksService,
	],
})
export class BattlesModule { }
