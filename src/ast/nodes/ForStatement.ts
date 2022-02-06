import type MagicString from 'magic-string';
import { NO_SEMICOLON, type RenderOptions } from '../../utils/renderHelpers';
import type { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import BlockScope from '../scopes/BlockScope';
import type Scope from '../scopes/Scope';
import type * as NodeType from './NodeType';
import type VariableDeclaration from './VariableDeclaration';
import {
	type ExpressionNode,
	type IncludeChildren,
	StatementBase,
	type StatementNode
} from './shared/Node';

export default class ForStatement extends StatementBase {
	declare body: StatementNode;
	declare init: VariableDeclaration | ExpressionNode | null;
	declare test: ExpressionNode | null;
	declare type: NodeType.tForStatement;
	declare update: ExpressionNode | null;

	createScope(parentScope: Scope): void {
		this.scope = new BlockScope(parentScope);
	}

	hasEffects(context: HasEffectsContext): boolean {
		if (
			(this.init && this.init.hasEffects(context)) ||
			(this.test && this.test.hasEffects(context)) ||
			(this.update && this.update.hasEffects(context))
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
		this.included = true;
		if (this.init) this.init.includeAsSingleStatement(context, includeChildrenRecursively);
		if (this.test) this.test.include(context, includeChildrenRecursively);
		const { brokenFlow } = context;
		if (this.update) this.update.include(context, includeChildrenRecursively);
		this.body.includeAsSingleStatement(context, includeChildrenRecursively);
		context.brokenFlow = brokenFlow;
	}

	render(code: MagicString, options: RenderOptions): void {
		if (this.init) this.init.render(code, options, NO_SEMICOLON);
		if (this.test) this.test.render(code, options, NO_SEMICOLON);
		if (this.update) this.update.render(code, options, NO_SEMICOLON);
		this.body.render(code, options);
	}
}
