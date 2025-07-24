import {
	Body,
	Controller,
	Post,
	UseGuards,
} from "@nestjs/common";

import { Roles } from "../../decorators/roles.decorator.js";
import { PlayerRolesGuard } from "../../guards/player_roles.guard.js";
import { PlayerRole } from "../../guards/roles.enum.js";
import { SubmitBattleBodyDto } from "./battles.dtos.js";
import { BattlesService } from "./battles.service.js";

@Controller("battles")
@UseGuards(PlayerRolesGuard)
export class BattlesController {

	constructor(private readonly battlesService: BattlesService) { }

	@Post()
	@Roles(PlayerRole.Player)
	public submit(@Body() body: SubmitBattleBodyDto): void {
		this.battlesService.submit(body);
	}
}
