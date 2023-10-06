import type MagicString from 'magic-string';
import type * as NodeType from './NodeType';
import { StatementBase } from './shared/Node';

export default class EmptyStatement extends StatementBase {
	declare type: NodeType.tEmptyStatement;

	hasEffects(): boolean {
		return false;
	}
	render(code: MagicString) {
		code.remove(this.start, this.end);
	}
}
