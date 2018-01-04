import MagicString from 'magic-string';
import { BasicStatementNode } from './shared/Statement';

export default class EmptyStatement extends BasicStatementNode {
	type: 'EmptyStatement';

	render (code: MagicString, _es: boolean) {
		if (
			this.parent.type === 'BlockStatement' ||
			this.parent.type === 'Program'
		) {
			code.remove(this.start, this.end);
		}
	}
}
