import Statement from './shared/Statement';
import MagicString from 'magic-string';

export default class EmptyStatement extends Statement {
	type: 'EmptyStatement';

	render (code: MagicString) {
		if (
			this.parent.type === 'BlockStatement' ||
			this.parent.type === 'Program'
		) {
			code.remove(this.start, this.end);
		}
	}
}
