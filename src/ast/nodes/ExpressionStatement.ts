import Statement from './shared/Statement';
import MagicString from 'magic-string';

export default class ExpressionStatement extends Statement {
	render (code: MagicString, es: boolean) {
		super.render(code, es);
		if (this.included) this.insertSemicolon(code);
	}
}
