import Statement from './shared/Statement';

export default class LabeledStatement extends Statement {
	hasEffects ( options ) {
		return this.body.hasEffects(
			options
				.setIgnoreLabel( this.label.name )
				.setIgnoreBreakStatements()
		);
	}
}
