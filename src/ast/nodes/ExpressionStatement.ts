import Statement from './shared/Statement';
import MagicString from 'magic-string';

export default class ExpressionStatement extends Statement {
	directive?: string;

	shouldBeIncluded() {
		if (this.directive && this.directive !== 'use strict')
			return true;
		return super.shouldBeIncluded()
	}

	render (code: MagicString, es: boolean) {
		super.render(code, es);
		if (this.included) this.insertSemicolon(code);
	}
}
