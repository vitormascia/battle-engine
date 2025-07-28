import { PlainProperties } from "../../../helpers/types.helper.js";
import { PlayerEntity } from "../players.entity.js";

export type Player = Pick<PlayerEntity, PlainProperties<PlayerEntity>>;
