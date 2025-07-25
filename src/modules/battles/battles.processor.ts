import {
	OnWorkerEvent,
	Processor,
	WorkerHost,
} from "@nestjs/bullmq";
import {
	Injectable,
	Logger,
} from "@nestjs/common";

import { QueueName } from "../app/queues.enum.js";
import { BattlesService } from "./battles.service.js";
import { BattleJob } from "./battles.type.js";

@Processor(QueueName.Battles)
@Injectable()
export class BattlesConsumer extends WorkerHost {
	private readonly logger = new Logger(this.constructor.name);

	constructor(private readonly battlesService: BattlesService) {
		super();
	}

	private logJob(
		message: string,
		job: BattleJob,
		logLevel: "debug" | "warn" | "error",
		metadata?: Record<string, any>,
	): void {
		this.logger[logLevel](message, {
			job: {
				id: job.id,
				name: job.name,
				data: job.data,
				attemptsMade: job.attemptsMade,
				attemptsStarted: job.attemptsStarted,
				deduplicationId: job.deduplicationId,
				deferredFailure: job.deferredFailure,
				delay: job.delay,
				failedReason: job.failedReason,
				finishedOn: job.finishedOn,
				nextRepeatableJobId: job.nextRepeatableJobId,
				opts: job.opts,
				parent: job.parent,
				parentKey: job.parentKey,
				prefix: job.prefix,
				priority: job.priority,
				processedBy: job.processedBy,
				processedOn: job.processedOn,
				progress: job.progress,
				queueName: job.queueName,
				queueQualifiedName: job.queueQualifiedName,
				repeatJobKey: job.repeatJobKey,
				returnvalue: job.returnvalue,
				stacktrace: job.stacktrace,
				stalledCounter: job.stalledCounter,
				timestamp: job.timestamp,
				token: job.token,
			},
			metadata,
		});
	}

	public async process(job: BattleJob): Promise<void> {
		const {
			challengerId,
			opponentId,
		} = job.data;

		const { winner, loser } = await this.battlesService.runBattleLoop(
			challengerId,
			opponentId,
		);

		await this.battlesService.lootResources(
			winner,
			loser,
		);
	}

	@OnWorkerEvent("active")
	public onActive(job: BattleJob, prev: string): void {
		this.logJob("JOB::ON_ACTIVE", job, "debug", { prev });
	}

	@OnWorkerEvent("closed")
	public onClosed(): void {
		this.logger.warn("QUEUE::ON_CLOSED");
	}

	@OnWorkerEvent("closing")
	public onClosing(message: string): void {
		this.logger.warn("QUEUE::ON_CLOSING", { message });
	}

	@OnWorkerEvent("completed")
	public onCompleted(job: BattleJob, result: void, prev: string): void {
		this.logJob("JOB::ON_COMPLETED", job, "debug", {
			result,
			prev,
		});
	}

	@OnWorkerEvent("drained")
	public onDrained(): void {
		this.logger.debug("QUEUE::ON_DRAINED");
	}

	@OnWorkerEvent("error")
	public onError(failedReason: Error): void {
		this.logger.error("QUEUE::ON_ERROR", { failedReason });
	}

	@OnWorkerEvent("failed")
	public onFailed(job: BattleJob, error: Error, prev: string): void {
		this.logJob("JOB::ON_FAILED", job, "error", {
			prev,
			error: {
				message: error.message,
				stack: error.stack,
			},
		});
	}

	@OnWorkerEvent("paused")
	public onPaused(): void {
		this.logger.warn("QUEUE::ON_PAUSED");
	}

	// @OnWorkerEvent("progress")
	// public onProgress(job: BattleJob, progress: number | object): void {
	// 	this.logJob("JOB::ON_PROGRESS", job, "debug", { progress });
	// }

	@OnWorkerEvent("ready")
	public onReady(): void {
		this.logger.debug("QUEUE::ON_READY");
	}

	@OnWorkerEvent("resumed")
	public onResumed(): void {
		this.logger.debug("QUEUE::ON_RESUMED");
	}

	@OnWorkerEvent("stalled")
	public onStalled(jobId: string, prev: string): void {
		this.logger.warn("JOB::ON_STALLED", {
			jobId,
			prev,
		});
	}

	@OnWorkerEvent("ioredis:close")
	public onRedisClose(): void {
		this.logger.warn("REDIS::ON_CLOSE");
	}
}
