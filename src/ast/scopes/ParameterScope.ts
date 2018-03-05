import Scope from './Scope';
import ParameterVariable from '../variables/ParameterVariable';
import Identifier from '../nodes/Identifier';

export default class ParameterScope extends Scope {
	parent: Scope;
	_parameters: ParameterVariable[];

	constructor(options = {}) {
		super(options);
		this._parameters = [];
	}

	/**
	 * Adds a parameter to this scope. Parameters must be added in the correct
	 * order, e.g. from left to right.
	 * @param {Identifier} identifier
	 * @returns {Variable}
	 */
	addParameterDeclaration(identifier: Identifier) {
		const variable = new ParameterVariable(identifier);
		this.variables[identifier.name] = variable;
		this._parameters.push(variable);
		return variable;
	}

	getParameterVariables() {
		return this._parameters;
	}
}
