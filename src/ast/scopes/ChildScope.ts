import { NameCollection } from '../../utils/reservedNames';
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

	deconflict(forbiddenNames: NameCollection) {
		const usedNames: NameCollection = Object.assign(Object.create(null), forbiddenNames);
		for (const name of Object.keys(this.accessedOutsideVariables)) {
			const variable = this.accessedOutsideVariables[name];
			if (variable.included) {
				usedNames[variable.getBaseVariableName()] = true;
			}
		}
		for (const name of Object.keys(this.variables)) {
			const variable = this.variables[name];
			if (variable.included) {
				variable.setSafeName(getSafeName(name, usedNames));
			}
		}
		for (const scope of this.children) {
			scope.deconflict(forbiddenNames);
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
