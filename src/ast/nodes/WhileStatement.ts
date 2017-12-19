import Statement from './shared/Statement';

export default class WhileStatement extends Statement {
	hasEffects (options) {
		return (
			this.test.hasEffects(options) ||
			this.body.hasEffects(options.setIgnoreBreakStatements())
		);
	}
}
