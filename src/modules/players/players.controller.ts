import {
	Body,
	Controller,
	Post,
	UseGuards,
} from "@nestjs/common";

import { Roles } from "../../decorators/roles.decorator.js";
import { GameMasterRolesGuard } from "../../guards/game_master_roles.guard.js";
import { GameMasterRole } from "../../guards/roles.enum.js";
import { CreatePlayerBodyDto } from "./players.dtos.js";
import { PlayersService } from "./players.service.js";
import { Player } from "./players.type.js";

@Controller("players")
@UseGuards(GameMasterRolesGuard)
export class PlayersController {
	constructor(private readonly playersService: PlayersService) { }

	@Post()
	@Roles(GameMasterRole.Moderator)
	public async create(@Body() body: CreatePlayerBodyDto): Promise<Player> {
		return this.playersService.create(body);
	}
}
