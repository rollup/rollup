export const { keys } = Object;

export function blank() {
	return Object.create(null);
}

export const BLANK = blank();

export function forOwn<T>(object: { [key: string]: T }, func: (value: T, key: string) => void) {
	Object.keys(object).forEach(key => func(object[key], key));
}

export function assign<T, U>(target: T, source: U): T & U;
export function assign(target: any, ...sources: any[]): any {
	sources.forEach(source => {
		for (const key in source) {
			if (Object.hasOwnProperty.call(source, key)) target[key] = source[key];
		}
	});

	return target;
}
