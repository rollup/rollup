import type MagicString from 'magic-string';
import type { ast } from '../../rollup/types';
import { NO_SEMICOLON, type RenderOptions } from '../../utils/renderHelpers';
import type { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import BlockScope from '../scopes/BlockScope';
import type ChildScope from '../scopes/ChildScope';
import type * as nodes from './node-unions';
import type * as NodeType from './NodeType';
import { hasLoopBodyEffects, includeLoopBody } from './shared/loops';
import {
	doNotDeoptimize,
	type IncludeChildren,
	NodeBase,
	onlyIncludeSelfNoDeoptimize
} from './shared/Node';
import type VariableDeclaration from './VariableDeclaration';

export default class ForStatement extends NodeBase<ast.ForStatement> {
	body!: nodes.Statement;
	init!: VariableDeclaration | nodes.Expression | null;
	test!: nodes.Expression | null;
	type!: NodeType.tForStatement;
	update!: nodes.Expression | null;

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
