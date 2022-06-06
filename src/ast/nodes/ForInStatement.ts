import type MagicString from 'magic-string';
import { NO_SEMICOLON, type RenderOptions } from '../../utils/renderHelpers';
import type { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import { NODE_INTERACTION_UNKNOWN_ASSIGNMENT } from '../NodeInteractions';
import BlockScope from '../scopes/BlockScope';
import type Scope from '../scopes/Scope';
import { EMPTY_PATH } from '../utils/PathTracker';
import MemberExpression from './MemberExpression';
import type * as NodeType from './NodeType';
import type VariableDeclaration from './VariableDeclaration';
import { UNKNOWN_EXPRESSION } from './shared/Expression';
import {
	type ExpressionNode,
	type IncludeChildren,
	StatementBase,
	type StatementNode
} from './shared/Node';
import type { PatternNode } from './shared/Pattern';

export default class ForInStatement extends StatementBase {
	declare body: StatementNode;
	declare left: VariableDeclaration | PatternNode | MemberExpression;
	declare right: ExpressionNode;
	declare type: NodeType.tForInStatement;

	createScope(parentScope: Scope): void {
		this.scope = new BlockScope(parentScope);
	}

	hasEffects(context: HasEffectsContext): boolean {
		const { deoptimized, left, right } = this;
		if (!deoptimized) this.applyDeoptimizations();
		if (
			(left &&
				(left instanceof MemberExpression
					? left.hasEffectsAsAssignmentTarget(context, false)
					: left.hasEffects(context) ||
					  left.hasEffectsOnInteractionAtPath(
							EMPTY_PATH,
							NODE_INTERACTION_UNKNOWN_ASSIGNMENT,
							context
					  ))) ||
			(right && right.hasEffects(context))
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
		const { body, deoptimized, left, right } = this;
		if (!deoptimized) this.applyDeoptimizations();
		this.included = true;
		const includeLeftChildren = includeChildrenRecursively || true;
		if (left instanceof MemberExpression) {
			left.includeAsAssignmentTarget(context, includeLeftChildren, false);
		} else {
			left.include(context, includeLeftChildren);
		}
		right.include(context, includeChildrenRecursively);
		const { brokenFlow } = context;
		body.include(context, includeChildrenRecursively, { asSingleStatement: true });
		context.brokenFlow = brokenFlow;
	}

	initialise() {
		const { left } = this;
		if (left instanceof MemberExpression) {
			left.setAssignedValue(UNKNOWN_EXPRESSION);
		}
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
