import type MagicString from 'magic-string';
import { type RenderOptions, renderStatementList } from '../../utils/renderHelpers';
import type { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import BlockScope from '../scopes/BlockScope';
import type ChildScope from '../scopes/ChildScope';
import ExpressionStatement from './ExpressionStatement';
import * as NodeType from './NodeType';
import { Flag, isFlagSet, setFlag } from './shared/BitFlags';
import { UNKNOWN_EXPRESSION } from './shared/Expression';
import { type IncludeChildren, type Node, StatementBase, type StatementNode } from './shared/Node';

export default class BlockStatement extends StatementBase {
	declare body: readonly StatementNode[];
	declare type: NodeType.tBlockStatement;

	private get deoptimizeBody(): boolean {
		return isFlagSet(this.flags, Flag.deoptimizeBody);
	}
	private set deoptimizeBody(value: boolean) {
		this.flags = setFlag(this.flags, Flag.deoptimizeBody, value);
	}

	private get directlyIncluded(): boolean {
		return isFlagSet(this.flags, Flag.directlyIncluded);
	}
	private set directlyIncluded(value: boolean) {
		this.flags = setFlag(this.flags, Flag.directlyIncluded, value);
	}

	addImplicitReturnExpressionToScope(): void {
		const lastStatement = this.body[this.body.length - 1];
		if (!lastStatement || lastStatement.type !== NodeType.ReturnStatement) {
			this.scope.addReturnExpression(UNKNOWN_EXPRESSION);
		}
	}

	createScope(parentScope: ChildScope): void {
		this.scope = (this.parent as Node).preventChildBlockScope
			? (parentScope as ChildScope)
			: new BlockScope(parentScope);
	}

	hasEffects(context: HasEffectsContext): boolean {
		if (this.deoptimizeBody) return true;
		for (const node of this.body) {
			if (context.brokenFlow) break;
			if (node.hasEffects(context)) return true;
		}
		return false;
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren): void {
		if (!(this.deoptimizeBody && this.directlyIncluded)) {
			this.included = true;
			this.directlyIncluded = true;
			if (this.deoptimizeBody) includeChildrenRecursively = true;
			for (const node of this.body) {
				if (includeChildrenRecursively || node.shouldBeIncluded(context))
					node.include(context, includeChildrenRecursively);
			}
		}
	}

	initialise(): void {
		super.initialise();
		const firstBodyStatement = this.body[0];
		this.deoptimizeBody =
			firstBodyStatement instanceof ExpressionStatement &&
			firstBodyStatement.directive === 'use asm';
	}

	render(code: MagicString, options: RenderOptions): void {
		if (this.body.length > 0) {
			renderStatementList(this.body, code, this.start + 1, this.end - 1, options);
		} else {
			super.render(code, options);
		}
	}
}
