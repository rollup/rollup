import MagicString from 'magic-string';
import { StatementBase } from './shared/Statement';

export default class EmptyStatement extends StatementBase {
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
