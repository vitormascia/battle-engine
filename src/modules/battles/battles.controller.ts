import {
	BadRequestException,
	Body,
	Controller,
	Headers,
	Post,
	UseGuards,
} from "@nestjs/common";
import { validate as isUUID } from "uuid";

import { Roles } from "../../decorators/roles.decorator.js";
import { PlayerRole } from "../../guards/@types/roles.enum.js";
import { PlayerRolesGuard } from "../../guards/player_roles.guard.js";
import { SubmitBattleBodyDto } from "./battles.dtos.js";
import { BattlesService } from "./battles.service.js";

@Controller("/battles")
@UseGuards(PlayerRolesGuard)
export class BattlesController {

	constructor(private readonly battlesService: BattlesService) { }

	@Post()
	@Roles(PlayerRole.Player)
	public async submit(
		@Body() body: SubmitBattleBodyDto,
		@Headers("User-Id") challengerId?: string,
	): Promise<void> {
		if (typeof challengerId !== "string") {
			throw new BadRequestException("User-Id Header has to be set");
		}

		if (!isUUID(challengerId)) {
			throw new BadRequestException("User-Id Header has to be a valid UUID");
		}

		const { opponentId } = body;

		await this.battlesService.submit(challengerId, opponentId);
	}
}
