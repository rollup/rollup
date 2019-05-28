import { AstContext } from '../../Module';
import Identifier from '../nodes/Identifier';
import { UNKNOWN_EXPRESSION } from '../values';
import LocalVariable from '../variables/LocalVariable';
import ChildScope from './ChildScope';
import Scope from './Scope';

export default class ParameterScope extends ChildScope {
	hoistedBodyVarScope: ChildScope;

	private context: AstContext;
	private parameters: LocalVariable[] = [];

	constructor(parent: Scope, context: AstContext) {
		super(parent);
		this.context = context;
		this.hoistedBodyVarScope = new ChildScope(this);
	}

	/**
	 * Adds a parameter to this scope. Parameters must be added in the correct
	 * order, e.g. from left to right.
	 */
	addParameterDeclaration(identifier: Identifier) {
		const name = identifier.name;
		let variable = this.hoistedBodyVarScope.variables.get(name) as LocalVariable;
		if (variable) {
			variable.addDeclaration(identifier, null);
		} else {
			variable = new LocalVariable(name, identifier, UNKNOWN_EXPRESSION, this.context);
		}
		this.variables.set(name, variable);
		this.parameters.push(variable);
		return variable;
	}

	getParameterVariables() {
		return this.parameters;
	}
}
