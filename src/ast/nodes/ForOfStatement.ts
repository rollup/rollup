import MagicString from 'magic-string';
import { NO_SEMICOLON, RenderOptions } from '../../utils/renderHelpers';
import { InclusionContext } from '../ExecutionContext';
import BlockScope from '../scopes/BlockScope';
import Scope from '../scopes/Scope';
import { EMPTY_PATH } from '../utils/PathTracker';
import * as NodeType from './NodeType';
import VariableDeclaration from './VariableDeclaration';
import { ExpressionNode, IncludeChildren, StatementBase, StatementNode } from './shared/Node';
import { PatternNode } from './shared/Pattern';

export default class ForOfStatement extends StatementBase {
	await!: boolean;
	body!: StatementNode;
	left!: VariableDeclaration | PatternNode;
	right!: ExpressionNode;
	type!: NodeType.tForOfStatement;
	protected deoptimized = false;

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
		this.body.includeAsSingleStatement(context, includeChildrenRecursively);
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
