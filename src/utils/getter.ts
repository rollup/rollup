export function cacheObjectGetters<T, K extends PropertyKey = keyof T>(
	object: T,
	getterProperties: K[]
) {
	for (const property of getterProperties) {
		const propertyGetter = Object.getOwnPropertyDescriptor(object, property)!.get!;
		Object.defineProperty(object, property, {
			get() {
				const value = propertyGetter.call(object);
				// This replaces the getter with a fixed value for subsequent calls
				Object.defineProperty(object, property, { value });
				return value;
			}
		});
	}
}
