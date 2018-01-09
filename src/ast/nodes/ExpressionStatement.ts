import Statement from './shared/Statement';
import MagicString from 'magic-string';

export default class ExpressionStatement extends Statement {
	directive?: string;

	shouldBeIncluded() {
		if (this.directive && this.directive !== 'use strict') {
			if (this.parent.type === "Program") {
				this.module.warn( // This is necessary, because either way (deleting or not) can lead to errors.
					{
						code: 'MODULE_LEVEL_DIRECTIVE',
						message: `Module level directives cause errors when bundled, '${this.directive}' was ignored.`
					},
					this.start
				)
				return false;
			}
			return true
		}
		
		return super.shouldBeIncluded()
	}

	render (code: MagicString, es: boolean) {
		super.render(code, es);
		if (this.included) this.insertSemicolon(code);
	}
}
