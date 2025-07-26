import { IsUUID } from "class-validator";

export class SubmitBattleBodyDto {
	@IsUUID("all")
	opponentId: string;
}
