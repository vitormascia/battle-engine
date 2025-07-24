import { config } from "dotenv";
import path from "path";
import { DataSource } from "typeorm";

import { ONE_SECOND_IN_MILLISECONDS } from "../constants/time.constants.js";

config({
	path: path.join(process.cwd(), ".env"),
});

export default new DataSource({
	type: "postgres",
	host: process.env.POSTGRES_HOST,
	port: +process.env.POSTGRES_PORT!,
	username: process.env.POSTGRES_USERNAME,
	password: process.env.POSTGRES_PASSWORD,
	database: process.env.POSTGRES_DATABASE,
	entities: [
		path.join(process.cwd(), "build/modules/**/*.entity.js"),
		path.join(process.cwd(), "build/modules/**/entities/*.entity.js"),
	],
	connectTimeoutMS: ONE_SECOND_IN_MILLISECONDS * 10,
	logNotifications: true,
	migrations: [
		path.join(process.cwd(), "build/migrations/**/*.js"),
	],
	migrationsRun: true,
	migrationsTransactionMode: "all",
	synchronize: false,
	logging: true,
	logger: "advanced-console",
});
