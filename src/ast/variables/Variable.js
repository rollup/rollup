/* eslint-disable no-unused-vars */

import { UNKNOWN_ASSIGNMENT } from '../values';

export default class Variable {
	constructor ( name ) {
		this.name = name;
	}

	/**
	 * Binds identifiers that reference this variable to this variable.
	 * Necessary to be able to change variable names.
	 * @param {Identifier} identifier
	 */
	addReference ( identifier ) {}

	/**
	 * This enables variables to know which nodes need to be checked for side-effects when
	 * e.g. an object path is called or mutated.
	 * @param {String[]} path
	 * @param {Node} expression
	 */
	assignExpressionAtPath ( path, expression ) {}

	/**
	 * @returns {String}
	 */
	getName () {
		return this.name;
	}

	/**
	 * @param {String[]} path
	 * @param {ExecutionPathOptions} options
	 * @return {boolean}
	 */
	hasEffectsWhenAccessedAtPath ( path, options ) {
		return path.length > 0;
	}

	/**
	 * @param {String[]} path
	 * @param {ExecutionPathOptions} options
	 * @return {boolean}
	 */
	hasEffectsWhenAssignedAtPath ( path, options ) {
		return true;
	}

	/**
	 * @param {String[]} path
	 * @param {ExecutionPathOptions} options
	 * @param {CallOptions} callOptions
	 * @return {boolean}
	 */
	hasEffectsWhenCalledAtPath ( path, callOptions, options ) {
		return true;
	}

	/**
	 * Marks this variable as being part of the bundle, which is usually the case when one of
	 * its identifiers becomes part of the bundle. Returns true if it has not been included
	 * previously.
	 * Once a variable is included, it should take care all its declarations are included.
	 * @returns {boolean}
	 */
	includeVariable () {
		if ( this.included ) {
			return false;
		}
		this.included = true;
		return true;
	}

	/**
	 * @param {String[]} path
	 * @param {CallOptions} callOptions
	 * @param {Function} predicateFunction
	 * @returns {boolean}
	 */
	someReturnExpressionWhenCalledAtPath ( path, callOptions, predicateFunction ) {
		return predicateFunction( UNKNOWN_ASSIGNMENT );
	}
}
