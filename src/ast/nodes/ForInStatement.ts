import BlockScope from '../scopes/BlockScope';
import VariableDeclaration from './VariableDeclaration';
import Scope from '../scopes/Scope';
import ExecutionPathOptions from '../ExecutionPathOptions';
import BlockStatement from './BlockStatement';
import { PatternNode } from './shared/Pattern';
import { NodeType } from './NodeType';
import { ExpressionNode, Node, StatementBase, StatementNode } from './shared/Node';
import MagicString from 'magic-string';
import { NO_SEMICOLON, RenderOptions } from '../../utils/renderHelpers';
import Import from './Import';

export function isForInStatement(node: Node): node is ForInStatement {
	return node.type === NodeType.ForInStatement;
}

export default class ForInStatement extends StatementBase {
	type: NodeType.ForInStatement;
	left: VariableDeclaration | PatternNode;
	right: ExpressionNode;
	body: StatementNode;

	hasEffects(options: ExecutionPathOptions): boolean {
		return (
			(this.left &&
				(this.left.hasEffects(options) || this.left.hasEffectsWhenAssignedAtPath([], options))) ||
			(this.right && this.right.hasEffects(options)) ||
			this.body.hasEffects(options.setIgnoreBreakStatements())
		);
	}

	initialiseChildren(_parentScope: Scope, dynamicImportReturnList: Import[]) {
		this.left.initialise(this.scope, dynamicImportReturnList);
		this.right.initialise(<Scope>this.scope.parent, dynamicImportReturnList);
		(<BlockStatement>this.body).initialiseAndReplaceScope
			? (<BlockStatement>this.body).initialiseAndReplaceScope(this.scope, dynamicImportReturnList)
			: this.body.initialise(this.scope, dynamicImportReturnList);
	}

	includeInBundle() {
		let addedNewNodes = super.includeInBundle();
		if (this.left.includeWithAllDeclaredVariables()) {
			addedNewNodes = true;
		}
		return addedNewNodes;
	}

	initialiseScope(parentScope: Scope) {
		this.scope = new BlockScope({ parent: parentScope });
	}

	render(code: MagicString, options: RenderOptions) {
		this.left.render(code, options, NO_SEMICOLON);
		this.right.render(code, options, NO_SEMICOLON);
		this.body.render(code, options);
	}
}
