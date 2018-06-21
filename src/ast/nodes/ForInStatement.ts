import MagicString from 'magic-string';
import { NO_SEMICOLON, RenderOptions } from '../../utils/renderHelpers';
import { ExecutionPathOptions } from '../ExecutionPathOptions';
import BlockScope from '../scopes/BlockScope';
import Scope from '../scopes/Scope';
import { EMPTY_PATH } from '../values';
import * as NodeType from './NodeType';
import { ExpressionNode, Node, StatementBase, StatementNode } from './shared/Node';
import { PatternNode } from './shared/Pattern';
import VariableDeclaration from './VariableDeclaration';

export function isForInStatement(node: Node): node is ForInStatement {
	return node.type === NodeType.ForInStatement;
}

export default class ForInStatement extends StatementBase {
	type: NodeType.tForInStatement;
	left: VariableDeclaration | PatternNode;
	right: ExpressionNode;
	body: StatementNode;

	bind() {
		super.bind();
		if (this.left.type !== NodeType.VariableDeclaration) {
			this.left.reassignPath(EMPTY_PATH);
		}
	}

	createScope(parentScope: Scope) {
		this.scope = new BlockScope(parentScope);
	}

	hasEffects(options: ExecutionPathOptions): boolean {
		return (
			(this.left &&
				(this.left.hasEffects(options) ||
					this.left.hasEffectsWhenAssignedAtPath(EMPTY_PATH, options))) ||
			(this.right && this.right.hasEffects(options)) ||
			this.body.hasEffects(options.setIgnoreBreakStatements())
		);
	}

	include() {
		this.included = true;
		this.left.includeWithAllDeclaredVariables();
		this.left.reassignPath(EMPTY_PATH);
		this.right.include();
		this.body.include();
	}

	render(code: MagicString, options: RenderOptions) {
		this.left.render(code, options, NO_SEMICOLON);
		this.right.render(code, options, NO_SEMICOLON);
		this.body.render(code, options);
	}
}
