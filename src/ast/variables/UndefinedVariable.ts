import type { LiteralValueOrUnknown } from '../nodes/shared/Expression';
import Variable from './Variable';

export default class UndefinedVariable extends Variable {
	constructor() {
		super('undefined');
	}

	getLiteralValueAtPath(): LiteralValueOrUnknown {
		return undefined;
	}
}
