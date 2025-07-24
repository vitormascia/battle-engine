import { IsUUID } from "class-validator";

export class SubmitBattleBodyDto {
	@IsUUID("all")
	challengerId: string;

	@IsUUID("all")
	opponentId: string;
}
