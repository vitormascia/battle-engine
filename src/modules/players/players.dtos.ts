import {
	ArrayMinSize,
	IsEnum,
	IsInt,
	IsNumber,
	IsOptional,
	IsPositive,
	IsString,
	Max,
	MaxLength,
	Min,
	MinLength,
} from "class-validator";

import { PlayerRole } from "../../guards/roles.enum.js";

export class CreatePlayerBodyDto {
	@MaxLength(20)
	@MinLength(1)
	@IsString()
	name: string;

	@MaxLength(1_000)
	@IsString()
	description: string;

	@Max(1_000_000_000)
	@Min(0)
	@IsInt()
	@IsNumber({ allowNaN: false })
	gold: number;

	@Max(1_000_000_000)
	@Min(0)
	@IsInt()
	@IsNumber({ allowNaN: false })
	silver: number;

	@IsPositive()
	@IsInt()
	@IsNumber({ allowNaN: false })
	attack: number;

	@IsPositive()
	@IsInt()
	@IsNumber({ allowNaN: false })
	defense: number;

	@IsPositive()
	@IsInt()
	@IsNumber({ allowNaN: false })
	hitPoints: number;

	@IsEnum(PlayerRole, { each: true })
	@ArrayMinSize(1)
	@IsOptional()
	roles?: Array<PlayerRole>;
}
