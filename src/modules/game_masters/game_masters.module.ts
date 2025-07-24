import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { GameMasterEntity } from "./game_masters.entity.js";

@Module({
	imports: [TypeOrmModule.forFeature([GameMasterEntity])],
	controllers: [],
	providers: [],
	exports: [TypeOrmModule],
})
export class GameMastersModule { }
