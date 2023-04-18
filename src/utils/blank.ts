export const BLANK: Record<string, unknown> = Object.freeze(Object.create(null));
export const EMPTY_OBJECT = Object.freeze({});
export const EMPTY_ARRAY = Object.freeze([]);
export const EMPTY_SET = Object.freeze(
	new (class extends Set {
		add(): never {
			throw new Error('Cannot add to empty set');
		}
	})()
);
