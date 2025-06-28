import type MagicString from 'magic-string';
import { NO_SEMICOLON, type RenderOptions } from '../../utils/renderHelpers';
import type { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import BlockScope from '../scopes/BlockScope';
import type ChildScope from '../scopes/ChildScope';
import type * as NodeType from './NodeType';
import { hasLoopBodyEffects, includeLoopBody } from './shared/loops';
import {
	doNotDeoptimize,
	type ExpressionNode,
	type IncludeChildren,
	NodeBase,
	onlyIncludeSelfNoDeoptimize,
	type StatementNode
} from './shared/Node';
import type VariableDeclaration from './VariableDeclaration';

export default class ForStatement extends NodeBase {
	body!: StatementNode;
	init!: VariableDeclaration | ExpressionNode | null;
	test!: ExpressionNode | null;
	type!: NodeType.tForStatement;
	update!: ExpressionNode | null;

	createScope(parentScope: ChildScope): void {
		this.scope = new BlockScope(parentScope);
	}

	hasEffects(context: HasEffectsContext): boolean {
		if (
			this.init?.hasEffects(context) ||
			this.test?.hasEffects(context) ||
			this.update?.hasEffects(context)
		) {
			return true;
		}
		return hasLoopBodyEffects(context, this.body);
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren): void {
		this.included = true;
		this.init?.include(context, includeChildrenRecursively, {
			asSingleStatement: true
		});
		this.test?.include(context, includeChildrenRecursively);
		this.update?.include(context, includeChildrenRecursively);
		includeLoopBody(context, this.body, includeChildrenRecursively);
	}

	render(code: MagicString, options: RenderOptions): void {
		this.init?.render(code, options, NO_SEMICOLON);
		this.test?.render(code, options, NO_SEMICOLON);
		this.update?.render(code, options, NO_SEMICOLON);
		this.body.render(code, options);
	}
}

ForStatement.prototype.includeNode = onlyIncludeSelfNoDeoptimize;
ForStatement.prototype.applyDeoptimizations = doNotDeoptimize;
