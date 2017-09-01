import Options from './Options';

const OPTION_IGNORE_BREAK_STATEMENTS = 'IGNORE_BREAK_STATEMENTS';
const OPTION_IGNORE_RETURN_AWAIT_YIELD = 'IGNORE_RETURN_AWAIT_YIELD';

export default class HasEffectsOptions extends Options {
	ignoreBreakStatements() {
		return this.get(OPTION_IGNORE_BREAK_STATEMENTS);
	}

	setIgnoreBreakStatements() {
		return this.set(OPTION_IGNORE_BREAK_STATEMENTS, true);
	}

	ignoreReturnAwaitYield() {
		return this.get(OPTION_IGNORE_RETURN_AWAIT_YIELD);
	}

	setIgnoreReturnAwaitYield() {
		return this.set(OPTION_IGNORE_RETURN_AWAIT_YIELD, true);
	}
}
