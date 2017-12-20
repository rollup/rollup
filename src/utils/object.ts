export const { keys } = Object;

export function blank () {
	return Object.create(null);
}

export function forOwn (object: any, func: (value: any, key: string) => void) {
	Object.keys(object).forEach(key => func(object[key], key));
}

export function assign<T,U> (target: T, source: U): T & U
export function assign (target: any, ...sources: any[]): any {
	sources.forEach(source => {
		for (const key in source) {
			if (source.hasOwnProperty(key)) target[key] = source[key];
		}
	});

	return target;
}
