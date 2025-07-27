import {
	Body,
	Controller,
	Get,
	Post,
	UseGuards,
} from "@nestjs/common";

import { Roles } from "../../decorators/roles.decorator.js";
import { GameMasterRolesGuard } from "../../guards/game_master_roles.guard.js";
import { PlayerRolesGuard } from "../../guards/player_roles.guard.js";
import { GameMasterRole, PlayerRole } from "../../guards/roles.enum.js";
import { CreatePlayerBodyDto } from "./players.dtos.js";
import { Leaderboard } from "./players.interface.js";
import { PlayersService } from "./players.service.js";
import { Player } from "./players.type.js";

@Controller("/players")
export class PlayersController {
	constructor(private readonly playersService: PlayersService) { }

	@Post()
	@UseGuards(GameMasterRolesGuard)
	@Roles(GameMasterRole.Moderator)
	public async create(@Body() body: CreatePlayerBodyDto): Promise<Player> {
		return this.playersService.create(body);
	}

	@Get("/leaderboard")
	@UseGuards(PlayerRolesGuard)
	@Roles(PlayerRole.Player)
	public async getLeaderboard(): Promise<Leaderboard> {
		return this.playersService.getLeaderboard();
	}
}
