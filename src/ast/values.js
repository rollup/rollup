// properties are for debugging purposes only
export const ARRAY    = { ARRAY:    true, toString: () => '[[ARRAY]]' };
export const BOOLEAN  = { BOOLEAN:  true, toString: () => '[[BOOLEAN]]' };
export const FUNCTION = { FUNCTION: true, toString: () => '[[FUNCTION]]' };
export const NUMBER   = { NUMBER:   true, toString: () => '[[NUMBER]]' };
export const OBJECT   = { OBJECT:   true, toString: () => '[[OBJECT]]' };
export const STRING   = { STRING:   true, toString: () => '[[STRING]]' };
export const TDZ_VIOLATION  = { TDZ_VIOLATION:  true, toString: () => '[[TDZ_VIOLATION]]' };

export class TdzViolation {

}

export class Undefined {
	getProperty () {
		return unknown; // TODO warn here?
	}
}

export class UnknownValue {
	call ( context, args ) {
		args.forEach( arg => {
			// TODO call functions (and children of objects...) with unknown arguments
			arg.markChildrenIndiscriminately();
		});

		return unknown;
	}

	getValue () {
		return unknown;
	}

	getProperty () {
		return unknown;
	}

	markReturnStatements () {
		// noop?
	}

	setProperty () {
		// noop?
	}
}

export const unknown = new UnknownValue();
