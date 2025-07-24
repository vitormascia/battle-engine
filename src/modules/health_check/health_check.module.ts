
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { TerminusModule } from "@nestjs/terminus";

import { ONE_SECOND_IN_MILLISECONDS } from "../../constants/time.constants.js";
import { HealthController } from "./health_check.controller.js";

@Module({
	imports: [
		TerminusModule.forRoot({
			logger: true,
			errorLogStyle: "pretty",
			gracefulShutdownTimeoutMs: ONE_SECOND_IN_MILLISECONDS,
		}),
		HttpModule,
	],
	controllers: [HealthController],
	providers: [],
	exports: [],
})
export class HealthModule { }
