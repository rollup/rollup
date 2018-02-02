import BlockScope from '../scopes/BlockScope';
import ExecutionPathOptions from '../ExecutionPathOptions';
import VariableDeclaration from './VariableDeclaration';
import Scope from '../scopes/Scope';
import BlockStatement from './BlockStatement';
import { PatternNode } from './shared/Pattern';
import { NodeType } from './NodeType';
import { ExpressionNode, NodeBase, Node } from './shared/Node';

export default class ForOfStatement extends NodeBase {
	type: NodeType.ForOfStatement;
	left: VariableDeclaration | PatternNode;
	right: ExpressionNode;
	body: Node;

	bindNode () {
		this.left.reassignPath([], ExecutionPathOptions.create());
	}

	hasEffects (options: ExecutionPathOptions): boolean {
		return (
			(this.left &&
				(this.left.hasEffects(options) ||
					this.left.hasEffectsWhenAssignedAtPath([], options))) ||
			(this.right && this.right.hasEffects(options)) ||
			this.body.hasEffects(options.setIgnoreBreakStatements())
		);
	}

	includeInBundle () {
		let addedNewNodes = super.includeInBundle();
		if (this.left.includeWithAllDeclarations()) {
			addedNewNodes = true;
		}
		return addedNewNodes;
	}

	initialiseChildren () {
		this.left.initialise(this.scope);
		this.right.initialise(<Scope>this.scope.parent);
		(<BlockStatement>this.body).initialiseAndReplaceScope
			? (<BlockStatement>this.body).initialiseAndReplaceScope(this.scope)
			: this.body.initialise(this.scope);
	}

	initialiseScope (parentScope: Scope) {
		this.scope = new BlockScope({ parent: parentScope });
	}
}
