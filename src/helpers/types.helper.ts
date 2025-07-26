export type PlainProperties<T> = {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
	[K in keyof T]: T[K] extends Function ? never : K
}[keyof T];

/* Strips @null and @undefined from all properties */
export type StrictRequired<T> = {
	[K in keyof Required<T>]: NonNullable<Required<T>[K]>;
};
