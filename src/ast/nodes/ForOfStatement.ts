import type MagicString from 'magic-string';
import { NO_SEMICOLON, type RenderOptions } from '../../utils/renderHelpers';
import type { InclusionContext } from '../ExecutionContext';
import BlockScope from '../scopes/BlockScope';
import type ChildScope from '../scopes/ChildScope';
import type { ObjectPath } from '../utils/PathTracker';
import { EMPTY_PATH, UNKNOWN_PATH } from '../utils/PathTracker';
import type MemberExpression from './MemberExpression';
import type * as NodeType from './NodeType';
import type VariableDeclaration from './VariableDeclaration';
import { Flag, isFlagSet, setFlag } from './shared/BitFlags';
import { UNKNOWN_EXPRESSION } from './shared/Expression';
import {
	type ExpressionNode,
	type IncludeChildren,
	StatementBase,
	type StatementNode
} from './shared/Node';
import type { PatternNode } from './shared/Pattern';
import { includeLoopBody } from './shared/loops';

export default class ForOfStatement extends StatementBase {
	declare body: StatementNode;
	declare left: VariableDeclaration | PatternNode | MemberExpression;
	declare right: ExpressionNode;
	declare type: NodeType.tForOfStatement;

	get await(): boolean {
		return isFlagSet(this.flags, Flag.await);
	}
	set await(value: boolean) {
		this.flags = setFlag(this.flags, Flag.await, value);
	}

	createScope(parentScope: ChildScope): void {
		this.scope = new BlockScope(parentScope);
	}

	hasEffects(): boolean {
		if (!this.deoptimized) this.applyDeoptimizations();
		// Placeholder until proper Symbol.Iterator support
		return true;
	}

	includePath(
		path: ObjectPath,
		context: InclusionContext,
		includeChildrenRecursively: IncludeChildren
	): void {
		const { body, deoptimized, left, right } = this;
		if (!deoptimized) this.applyDeoptimizations();
		this.included = true;
		left.includeAsAssignmentTarget(context, includeChildrenRecursively || true, false);
		right.includePath(path, context, includeChildrenRecursively);
		includeLoopBody(context, body, includeChildrenRecursively);
	}

	initialise() {
		super.initialise();
		this.left.setAssignedValue(UNKNOWN_EXPRESSION);
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
		this.right.deoptimizePath(UNKNOWN_PATH);
		this.scope.context.requestTreeshakingPass();
	}
}
