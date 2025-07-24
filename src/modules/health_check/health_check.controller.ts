import {
	Controller,
	Get,
} from "@nestjs/common";
import {
	HealthCheck,
	HealthCheckResult,
	HealthCheckService,
	HealthIndicatorResult,
	HttpHealthIndicator,
	TypeOrmHealthIndicator,
} from "@nestjs/terminus";

@Controller("/health")
export class HealthController {
	constructor(
		private health: HealthCheckService,
		private http: HttpHealthIndicator,
		private db: TypeOrmHealthIndicator,
	) { }

	@Get()
	@HealthCheck()
	public check(): Promise<HealthCheckResult> {
		return this.health.check([
			(): Promise<HealthIndicatorResult<string>> => this.db.pingCheck("database"),
			(): Promise<HealthIndicatorResult<string>> => this.http.pingCheck("nestjs-docs", "https://docs.nestjs.com"),
		]);
	}
}
