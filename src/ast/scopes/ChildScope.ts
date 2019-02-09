import { getSafeName } from '../../utils/safeName';
import { ExpressionEntity } from '../nodes/shared/Expression';
import Variable from '../variables/Variable';
import Scope from './Scope';

export default class ChildScope extends Scope {
	accessedOutsideVariables: Set<Variable> = new Set();
	parent: Scope;

	constructor(parent: Scope) {
		super();
		this.parent = parent;
		parent.children.push(this);
	}

	addNamespaceMemberAccess(variable: Variable) {
		this.accessedOutsideVariables.add(variable);
		if (this.parent instanceof ChildScope) {
			this.parent.addNamespaceMemberAccess(variable);
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
		this.accessedOutsideVariables.forEach(variable => {
			usedNames.add(variable.getBaseVariableName());
		});
		for (const name of Object.keys(this.variables)) {
			const variable = this.variables[name];
			if (!variable.baseName) {
				variable.setSafeName(getSafeName(variable.name, usedNames));
			}
		}
		for (const scope of this.children) scope.deshadow(esmOrSystem);
	}

	findLexicalBoundary(): ChildScope {
		return this.parent instanceof ChildScope ? this.parent.findLexicalBoundary() : this;
	}

	findVariable(name: string): Variable {
		if (this.variables[name]) {
			return this.variables[name];
		}
		const variable = this.parent.findVariable(name);
		this.accessedOutsideVariables.add(variable);
		return variable;
	}
}
