import Identifier from '../nodes/Identifier';
import { EntityPathTracker } from '../utils/EntityPathTracker';
import ParameterVariable from '../variables/ParameterVariable';
import Scope from './Scope';

export default class ParameterScope extends Scope {
	parent: Scope;

	private parameters: ParameterVariable[] = [];

	/**
	 * Adds a parameter to this scope. Parameters must be added in the correct
	 * order, e.g. from left to right.
	 * @param {Identifier} identifier
	 * @returns {Variable}
	 */
	addParameterDeclaration(identifier: Identifier, deoptimizationTracker: EntityPathTracker) {
		const variable = new ParameterVariable(identifier, deoptimizationTracker);
		this.variables[identifier.name] = variable;
		this.parameters.push(variable);
		return variable;
	}

	getParameterVariables() {
		return this.parameters;
	}
}
