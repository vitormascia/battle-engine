import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { GameMastersModule } from "../game_masters/game_masters.module.js";
import { PlayersController } from "./players.controller.js";
import { PlayerEntity } from "./players.entity.js";
import { PlayersService } from "./players.service.js";

@Module({
	imports: [
		TypeOrmModule.forFeature([PlayerEntity]),
		GameMastersModule,
	],
	controllers: [PlayersController],
	providers: [PlayersService],
	exports: [
		TypeOrmModule,
		PlayersService,
	],
})
export class PlayersModule { }
