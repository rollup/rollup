import MagicString from 'magic-string';
import { StatementBase } from './shared/Statement';

export default class ExpressionStatement extends StatementBase {
	render (code: MagicString, es: boolean) {
		super.render(code, es);
		if (this.included) this.insertSemicolon(code);
	}
}
