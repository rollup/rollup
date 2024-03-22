export function cacheObjectGetters<T, K extends PropertyKey = keyof T>(
	object: T,
	getterProperties: K[]
) {
	for (const property of getterProperties) {
		const propertyGetter = Object.getOwnPropertyDescriptor(object, property)?.get;
		if (propertyGetter) {
			let cached: unknown;
			Object.defineProperty(object, property, {
				get: () => {
					if (cached === undefined) {
						cached = propertyGetter.call(object);
					}
					return cached;
				}
			});
		}
	}
}
