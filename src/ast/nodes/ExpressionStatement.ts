import MagicString from 'magic-string';
import { GenericStatementNode } from './shared/Statement';

export default class ExpressionStatement extends GenericStatementNode {
	render (code: MagicString, es: boolean) {
		super.render(code, es);
		if (this.included) this.insertSemicolon(code);
	}
}
