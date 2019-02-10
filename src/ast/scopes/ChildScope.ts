import { getSafeName } from '../../utils/safeName';
import { ExpressionEntity } from '../nodes/shared/Expression';
import Variable from '../variables/Variable';
import Scope from './Scope';

export default class ChildScope extends Scope {
	accessedOutsideVariables: { [name: string]: Variable } = Object.create(null);
	parent: Scope;

	constructor(parent: Scope) {
		super();
		this.parent = parent;
		parent.children.push(this);
	}

	addNamespaceMemberAccess(name: string, variable: Variable) {
		this.accessedOutsideVariables[name] = variable;
		if (this.parent instanceof ChildScope) {
			this.parent.addNamespaceMemberAccess(name, variable);
		}
	}

	addReturnExpression(expression: ExpressionEntity) {
		this.parent instanceof ChildScope && this.parent.addReturnExpression(expression);
	}

	contains(name: string): boolean {
		return name in this.variables || this.parent.contains(name);
	}

	deshadow(esmOrSystem: boolean) {
		const usedNames = new Set();
		for (const name of Object.keys(this.accessedOutsideVariables)) {
			usedNames.add(this.accessedOutsideVariables[name].getBaseVariableName());
		}
		for (const name of Object.keys(this.variables)) {
			this.variables[name].setSafeName(getSafeName(name, usedNames));
		}
		for (const scope of this.children) {
			scope.deshadow(esmOrSystem);
		}
	}

	findLexicalBoundary(): ChildScope {
		return this.parent instanceof ChildScope ? this.parent.findLexicalBoundary() : this;
	}

	findVariable(name: string): Variable {
		const knownVariable = this.variables[name] || this.accessedOutsideVariables[name];
		if (knownVariable) {
			return knownVariable;
		}
		return (this.accessedOutsideVariables[name] = this.parent.findVariable(name));
	}
}
