import BlockScope from '../scopes/BlockScope';
import ExecutionPathOptions from '../ExecutionPathOptions';
import VariableDeclaration from './VariableDeclaration';
import Scope from '../scopes/Scope';
import BlockStatement from './BlockStatement';
import { PatternNode } from './shared/Pattern';
import { NodeType } from './NodeType';
import { ExpressionNode, Node, StatementBase, StatementNode } from './shared/Node';
import MagicString from 'magic-string';
import { NO_SEMICOLON, RenderOptions } from '../../utils/renderHelpers';
import Import from './Import';

export function isForOfStatement(node: Node): node is ForOfStatement {
	return node.type === NodeType.ForOfStatement;
}

export default class ForOfStatement extends StatementBase {
	type: NodeType.ForOfStatement;
	left: VariableDeclaration | PatternNode;
	right: ExpressionNode;
	body: StatementNode;

	bindNode() {
		this.left.reassignPath([], ExecutionPathOptions.create());
	}

	hasEffects(options: ExecutionPathOptions): boolean {
		return (
			(this.left &&
				(this.left.hasEffects(options) || this.left.hasEffectsWhenAssignedAtPath([], options))) ||
			(this.right && this.right.hasEffects(options)) ||
			this.body.hasEffects(options.setIgnoreBreakStatements())
		);
	}

	includeInBundle() {
		let addedNewNodes = super.includeInBundle();
		if (this.left.includeWithAllDeclaredVariables()) {
			addedNewNodes = true;
		}
		return addedNewNodes;
	}

	initialiseChildren(_parentScope: Scope, dynamicImportReturnList: Import[]) {
		this.left.initialise(this.scope, dynamicImportReturnList);
		this.right.initialise(<Scope>this.scope.parent, dynamicImportReturnList);
		(<BlockStatement>this.body).initialiseAndReplaceScope
			? (<BlockStatement>this.body).initialiseAndReplaceScope(this.scope, dynamicImportReturnList)
			: this.body.initialise(this.scope, dynamicImportReturnList);
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
