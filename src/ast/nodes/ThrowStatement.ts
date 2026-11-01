import type MagicString from 'magic-string';
import type { RenderOptions } from '../../utils/renderHelpers';
import { type InclusionContext } from '../ExecutionContext';
import { UNKNOWN_PATH } from '../utils/PathTracker';
import type * as nodes from './node-unions';
import type * as NodeType from './NodeType';
import { type IncludeChildren, NodeBase } from './shared/Node';

export default class ThrowStatement extends NodeBase {
	declare parent: nodes.ThrowStatementParent;
	declare argument: nodes.Expression;
	declare type: NodeType.tThrowStatement;

	hasEffects(): boolean {
		return true;
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren): void {
		if (!this.included) this.includeNode(context);
		this.argument.include(context, includeChildrenRecursively);
		context.brokenFlow = true;
	}

	includeNode(context: InclusionContext) {
		if (!this.included) {
			this.included = true;
			this.argument.includePath(UNKNOWN_PATH, context);
		}
	}

	render(code: MagicString, options: RenderOptions): void {
		this.argument.render(code, options, { preventASI: true });
		if (this.argument.start === this.start + 5 /* 'throw'.length */) {
			code.prependLeft(this.start + 5, ' ');
		}
	}
}
