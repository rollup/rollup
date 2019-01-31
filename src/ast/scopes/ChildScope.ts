import { ExpressionEntity } from '../nodes/shared/Expression';
import Variable from '../variables/Variable';
import Scope from './Scope';

export default class ChildScope extends Scope {
	// accessedOutsideVariables: Set<Variable> = new Set();
	parent: Scope;

	constructor(parent: Scope) {
		super();
		this.parent = parent;
		parent.children.push(this);
	}

	addReturnExpression(expression: ExpressionEntity) {
		this.parent instanceof ChildScope && this.parent.addReturnExpression(expression);
	}

	contains(name: string): boolean {
		return name in this.variables || this.parent.contains(name);
	}

	findLexicalBoundary(): ChildScope {
		return this.parent instanceof ChildScope ? this.parent.findLexicalBoundary() : this;
	}

	// TODO Lukas add to accessedOutsideVariables
	findVariable(name: string): Variable {
		return this.variables[name] || this.parent.findVariable(name);
	}
}
