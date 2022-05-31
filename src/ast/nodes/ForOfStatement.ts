import type MagicString from 'magic-string';
import { NO_SEMICOLON, type RenderOptions } from '../../utils/renderHelpers';
import type { InclusionContext } from '../ExecutionContext';
import BlockScope from '../scopes/BlockScope';
import type Scope from '../scopes/Scope';
import { EMPTY_PATH } from '../utils/PathTracker';
import type * as NodeType from './NodeType';
import type VariableDeclaration from './VariableDeclaration';
import {
	type ExpressionNode,
	type IncludeChildren,
	StatementBase,
	type StatementNode
} from './shared/Node';
import type { PatternNode } from './shared/Pattern';

export default class ForOfStatement extends StatementBase {
	declare await: boolean;
	declare body: StatementNode;
	declare left: VariableDeclaration | PatternNode;
	declare right: ExpressionNode;
	declare type: NodeType.tForOfStatement;

	createScope(parentScope: Scope): void {
		this.scope = new BlockScope(parentScope);
	}

	hasEffects(): boolean {
		if (!this.deoptimized) this.applyDeoptimizations();
		// Placeholder until proper Symbol.Iterator support
		return true;
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren): void {
		if (!this.deoptimized) this.applyDeoptimizations();
		this.included = true;
		this.left.include(context, includeChildrenRecursively || true);
		this.right.include(context, includeChildrenRecursively);
		const { brokenFlow } = context;
		this.body.include(context, includeChildrenRecursively, { asSingleStatement: true });
		context.brokenFlow = brokenFlow;
	}

	render(code: MagicString, options: RenderOptions): void {
		this.left.render(code, options, NO_SEMICOLON);
		this.right.render(code, options, NO_SEMICOLON);
		// handle no space between "of" and the right side
		if (code.original.charCodeAt(this.right.start - 1) === 102 /* f */) {
			code.prependLeft(this.right.start, ' ');
		}
		this.body.render(code, options);
	}

	protected applyDeoptimizations(): void {
		this.deoptimized = true;
		this.left.deoptimizePath(EMPTY_PATH);
		this.context.requestTreeshakingPass();
	}
}
