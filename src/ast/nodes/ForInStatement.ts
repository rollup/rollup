import MagicString from 'magic-string';
import { NO_SEMICOLON, RenderOptions } from '../../utils/renderHelpers';
import { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import BlockScope from '../scopes/BlockScope';
import Scope from '../scopes/Scope';
import { EMPTY_PATH } from '../utils/PathTracker';
import * as NodeType from './NodeType';
import VariableDeclaration from './VariableDeclaration';
import { ExpressionNode, IncludeChildren, StatementBase, StatementNode } from './shared/Node';
import { PatternNode } from './shared/Pattern';

export default class ForInStatement extends StatementBase {
	declare body: StatementNode;
	declare left: VariableDeclaration | PatternNode;
	declare right: ExpressionNode;
	declare type: NodeType.tForInStatement;
	protected deoptimized = false;

	createScope(parentScope: Scope): void {
		this.scope = new BlockScope(parentScope);
	}

	hasEffects(context: HasEffectsContext): boolean {
		if (!this.deoptimized) this.applyDeoptimizations();
		if (
			(this.left &&
				(this.left.hasEffects(context) ||
					this.left.hasEffectsWhenAssignedAtPath(EMPTY_PATH, context))) ||
			(this.right && this.right.hasEffects(context))
		)
			return true;
		const {
			brokenFlow,
			ignore: { breaks, continues }
		} = context;
		context.ignore.breaks = true;
		context.ignore.continues = true;
		if (this.body.hasEffects(context)) return true;
		context.ignore.breaks = breaks;
		context.ignore.continues = continues;
		context.brokenFlow = brokenFlow;
		return false;
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
		// handle no space between "in" and the right side
		if (code.original.charCodeAt(this.right.start - 1) === 110 /* n */) {
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
