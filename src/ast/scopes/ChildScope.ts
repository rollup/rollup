import { getSafeName } from '../../utils/safeName';
import { ExpressionEntity } from '../nodes/shared/Expression';
import Variable from '../variables/Variable';
import Scope from './Scope';

export default class ChildScope extends Scope {
	accessedOutsideVariables = new Map<string, Variable>();
	parent: Scope;

	constructor(parent: Scope) {
		super();
		this.parent = parent;
		parent.children.push(this);
	}

	addNamespaceMemberAccess(name: string, variable: Variable) {
		this.accessedOutsideVariables.set(name, variable);
		if (this.parent instanceof ChildScope) {
			this.parent.addNamespaceMemberAccess(name, variable);
		}
	}

	addReturnExpression(expression: ExpressionEntity) {
		this.parent instanceof ChildScope && this.parent.addReturnExpression(expression);
	}

	contains(name: string): boolean {
		return this.variables.has(name) || this.parent.contains(name);
	}

	deconflict() {
		const usedNames = new Set<string>();
		for (const variable of this.accessedOutsideVariables.values()) {
			if (variable.included) {
				usedNames.add(variable.getBaseVariableName());
			}
		}
		for (const [name, variable] of this.variables) {
			if (variable.included) {
				variable.setSafeName(getSafeName(name, usedNames));
			}
		}
		for (const scope of this.children) {
			scope.deconflict();
		}
	}

	findLexicalBoundary(): ChildScope {
		return this.parent instanceof ChildScope ? this.parent.findLexicalBoundary() : this;
	}

	findVariable(name: string): Variable {
		const knownVariable = this.variables.get(name) || this.accessedOutsideVariables.get(name);
		if (knownVariable) {
			return knownVariable;
		}
		const variable = this.parent.findVariable(name);
		this.accessedOutsideVariables.set(name, variable);
		return variable;
	}
}
