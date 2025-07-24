import { IsUUID } from "class-validator";

export class SubmitBattleBodyDto {
	@IsUUID("all")
	attackerId: string;

	@IsUUID("all")
	defenderId: string;
}
