import MagicString from 'magic-string';
import { NO_SEMICOLON, RenderOptions } from '../../utils/renderHelpers';
import { ExecutionContext } from '../ExecutionContext';
import BlockScope from '../scopes/BlockScope';
import Scope from '../scopes/Scope';
import { EMPTY_PATH } from '../values';
import * as NodeType from './NodeType';
import { ExpressionNode, IncludeChildren, StatementBase, StatementNode } from './shared/Node';
import { PatternNode } from './shared/Pattern';
import VariableDeclaration from './VariableDeclaration';

export default class ForInStatement extends StatementBase {
	body!: StatementNode;
	left!: VariableDeclaration | PatternNode;
	right!: ExpressionNode;
	type!: NodeType.tForInStatement;

	bind() {
		this.left.bind();
		this.left.deoptimizePath(EMPTY_PATH);
		this.right.bind();
		this.body.bind();
	}

	createScope(parentScope: Scope) {
		this.scope = new BlockScope(parentScope);
	}

	hasEffects(context: ExecutionContext): boolean {
		if (
			(this.left &&
				(this.left.hasEffects(context) ||
					this.left.hasEffectsWhenAssignedAtPath(EMPTY_PATH, context))) ||
			(this.right && this.right.hasEffects(context))
		)
			return true;
		const {
			ignore: { breakStatements }
		} = context;
		context.ignore.breakStatements = true;
		if (this.body.hasEffects(context)) return true;
		context.ignore.breakStatements = breakStatements;
		return false;
	}

	include(includeChildrenRecursively: IncludeChildren) {
		this.included = true;
		this.left.includeWithAllDeclaredVariables(includeChildrenRecursively);
		this.left.deoptimizePath(EMPTY_PATH);
		this.right.include(includeChildrenRecursively);
		this.body.include(includeChildrenRecursively);
	}

	render(code: MagicString, options: RenderOptions) {
		this.left.render(code, options, NO_SEMICOLON);
		this.right.render(code, options, NO_SEMICOLON);
		this.body.render(code, options);
	}
}
