import type MagicString from 'magic-string';
import { NO_SEMICOLON, type RenderOptions } from '../../utils/renderHelpers';
import type { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import BlockScope from '../scopes/BlockScope';
import type ChildScope from '../scopes/ChildScope';
import type * as NodeType from './NodeType';
import type VariableDeclaration from './VariableDeclaration';
import {
	type ExpressionNode,
	type IncludeChildren,
	StatementBase,
	type StatementNode
} from './shared/Node';
import { hasLoopBodyEffects, includeLoopBody } from './shared/loops';

export default class ForStatement extends StatementBase {
	declare body: StatementNode;
	declare init: VariableDeclaration | ExpressionNode | null;
	declare test: ExpressionNode | null;
	declare type: NodeType.tForStatement;
	declare update: ExpressionNode | null;

	createScope(parentScope: ChildScope): void {
		this.scope = new BlockScope(parentScope, this.scope.context);
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
		this.init?.include(context, includeChildrenRecursively, { asSingleStatement: true });
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
