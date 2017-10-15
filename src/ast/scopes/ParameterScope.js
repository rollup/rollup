import Scope from './Scope';
import ParameterVariable from '../variables/ParameterVariable';
import { UNKNOWN_ASSIGNMENT } from '../values';

export default class ParameterScope extends Scope {
	constructor ( options = {} ) {
		super( options );
		this._parameters = [];
	}

	/**
	 * Adds a parameter to this scope. Parameters must be added in the correct
	 * order, e.g. from left to right.
	 * @param {Identifier} identifier
	 * @returns {Variable}
	 */
	addParameterDeclaration ( identifier ) {
		const variable = new ParameterVariable( identifier );
		this.variables[ identifier.name ] = variable;
		this._parameters.push( variable );
		return variable;
	}

	getOptionsWithReplacedParameters ( parameterReplacements, options ) {
		let newOptions = options;
		this._parameters.forEach( ( parameter, index ) =>
			newOptions = newOptions.replaceVariableInit( parameter, parameterReplacements[ index ] || UNKNOWN_ASSIGNMENT )
		);
		return newOptions;
	}
}
