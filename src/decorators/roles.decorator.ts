import {
	CustomDecorator,
	SetMetadata,
} from "@nestjs/common";

import {
	GameMasterRole,
	PlayerRole,
} from "../guards/@types/roles.enum.js";

export const ROLES_KEY = "roles";

export const Roles =
	(...roles: Array<PlayerRole | GameMasterRole>): CustomDecorator<string> => SetMetadata(ROLES_KEY, roles);
