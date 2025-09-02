import type MagicString from 'magic-string';
import { type RenderOptions, renderStatementList } from '../../utils/renderHelpers';
import { type HasEffectsContext, type InclusionContext } from '../ExecutionContext';
import BlockScope from '../scopes/BlockScope';
import type ChildScope from '../scopes/ChildScope';
import ExpressionStatement from './ExpressionStatement';
import type * as NodeType from './NodeType';
import { Flag, isFlagSet, setFlag } from './shared/BitFlags';
import { type ExpressionEntity, LiteralExpression } from './shared/Expression';
import {
	doNotDeoptimize,
	type IncludeChildren,
	type Node,
	onlyIncludeSelfNoDeoptimize,
	StatementBase,
	type StatementNode
} from './shared/Node';

export default class BlockStatement extends StatementBase {
	declare body: readonly StatementNode[];
	declare type: NodeType.tBlockStatement;

	private implicitReturnExpression: ExpressionEntity | null = null;

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

	private blockEndReached = false;
	private lastReachableBlock = Infinity;

	addImplicitReturnExpressionToScope(): void {
		if (!this.blockEndReached) {
			this.implicitReturnExpression = new LiteralExpression(undefined, this);
			this.scope.addReturnExpression(this.implicitReturnExpression);
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
		this.scope.context.magicString.addSourcemapLocation(this.end - 1);
		const firstBodyStatement = this.body[0];
		this.deoptimizeBody =
			firstBodyStatement instanceof ExpressionStatement &&
			firstBodyStatement.directive === 'use asm';
	}

	bind(): void {
		for (let index = 0; index < this.body.length; index++) {
			const node = this.body[index];
			node.bind();
			if (!this.blockEndReached && node.haltsCodeFlow()) {
				this.blockEndReached = true;
				this.lastReachableBlock = index;
			}
		}
	}

	render(code: MagicString, options: RenderOptions): void {
		if (this.body.length > 0) {
			renderStatementList(this.body, code, this.start + 1, this.end - 1, options);
		} else {
			super.render(code, options);
		}
	}

	haltsCodeFlow(allowOptimizations?: boolean): boolean {
		for (const node of this.body) {
			if (node.haltsCodeFlow(allowOptimizations)) return true;
		}
		return false;
	}

	isChildLocallyReachable(node: ExpressionEntity): boolean {
		if (!this.isLocallyReachable()) return false;

		const blockIndex =
			node === this.implicitReturnExpression ? this.body.length : this.body.indexOf(node as any);
		if (blockIndex < 0 || blockIndex > this.lastReachableBlock) return false;

		for (let index = 0; index < blockIndex; index++) {
			if (this.body[index].haltsCodeFlow(true)) {
				return false;
			}
		}

		return true;
	}
}

BlockStatement.prototype.includeNode = onlyIncludeSelfNoDeoptimize;
BlockStatement.prototype.applyDeoptimizations = doNotDeoptimize;
