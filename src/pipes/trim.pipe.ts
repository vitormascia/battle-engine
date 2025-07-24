import {
	ArgumentMetadata,
	Injectable,
	PipeTransform,
} from "@nestjs/common";

@Injectable()
export class TrimPipe implements PipeTransform {
	private isObject(value: any): boolean {
		return typeof value === "object" && value !== null;
	}

	private trim(value: any): any {
		Object.keys(value).forEach((key) => {
			if (this.isObject(value[key])) {
				value[key] = this.trim(value[key]);
			} else if (typeof value[key] === "string") {
				value[key] = value[key].trim();
			}
		});

		return value;
	}

	transform(value: any, metadata: ArgumentMetadata): any {
		if (this.isObject(value) && ["body", "query"].includes(metadata.type)) {
			return this.trim(value);
		}

		return value;
	}
}
