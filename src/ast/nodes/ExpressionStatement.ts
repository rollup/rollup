import MagicString from 'magic-string';
import { BasicStatementNode } from './shared/Statement';

export default class ExpressionStatement extends BasicStatementNode {
	render (code: MagicString, es: boolean) {
		super.render(code, es);
		if (this.included) this.insertSemicolon(code);
	}
}
