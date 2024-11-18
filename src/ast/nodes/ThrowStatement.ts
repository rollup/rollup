import type MagicString from 'magic-string';
import type { ast } from '../../rollup/types';
import type { RenderOptions } from '../../utils/renderHelpers';
import { type InclusionContext } from '../ExecutionContext';
import { type ObjectPath, UNKNOWN_PATH } from '../utils/PathTracker';
import type * as nodes from './node-unions';
import type { ThrowStatementParent } from './node-unions';
import type * as NodeType from './NodeType';
import { type IncludeChildren, NodeBase } from './shared/Node';

export default class ThrowStatement extends NodeBase<ast.ThrowStatement> {
	parent!: ThrowStatementParent;
	argument!: nodes.Expression;
	type!: NodeType.tThrowStatement;

	hasEffects(): boolean {
		return true;
	}

	includePath(
		_path: ObjectPath,
		context: InclusionContext,
		includeChildrenRecursively: IncludeChildren
	): void {
		this.included = true;
		this.argument.includePath(UNKNOWN_PATH, context, includeChildrenRecursively);
		context.brokenFlow = true;
	}

	render(code: MagicString, options: RenderOptions): void {
		this.argument.render(code, options, { preventASI: true });
		if (this.argument.start === this.start + 5 /* 'throw'.length */) {
			code.prependLeft(this.start + 5, ' ');
		}
	}
}
