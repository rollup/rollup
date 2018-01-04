import ExecutionPathOptions from '../ExecutionPathOptions';
import MagicString from 'magic-string';
import { ObjectPath } from '../variables/VariableReassignmentTracker';
import { BasicExpressionNode } from './shared/Expression';
import { Node } from './shared/Node';

export function isLiteral (node: Node): node is Literal {
	return node.type === 'Literal';
}

export default class Literal<T = string | boolean | null | number | RegExp> extends BasicExpressionNode {
	type: 'Literal';
	value: T;

	getValue () {
		return this.value;
	}

	hasEffectsWhenAccessedAtPath (path: ObjectPath, _options: ExecutionPathOptions) {
		if (this.value === null) {
			return path.length > 0;
		}
		return path.length > 1;
	}

	hasEffectsWhenAssignedAtPath (path: ObjectPath, _options: ExecutionPathOptions) {
		if (this.value === null) {
			return path.length > 0;
		}
		return path.length > 1;
	}

	render (code: MagicString, _es: boolean) {
		if (typeof this.value === 'string') {
			(<any> code).indentExclusionRanges.push([this.start + 1, this.end - 1]); // TODO TypeScript: Awaiting MagicString PR
		}
	}
}
