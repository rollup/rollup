/* eslint-disable no-unused-vars */

import { UNKNOWN_ASSIGNMENT, UnknownAssignment, PredicateFunction } from '../values';
import CallOptions from '../CallOptions';
import ExecutionPathOptions from '../ExecutionPathOptions';
import Identifier from '../nodes/Identifier';
import Node from '../Node';

export default class Variable {
	name: string;
	included: boolean;

	constructor (name: string) {
		this.name = name;
	}

	/**
	 * Binds identifiers that reference this variable to this variable.
	 * Necessary to be able to change variable names.
	 * @param {Identifier} identifier
	 */
	addReference (_identifier: Identifier) { }

	/**
	 * @param {String[]} path
	 * @param {ExecutionPathOptions} options
	 */
	reassignPath (_path: string[], _options: ExecutionPathOptions) { }

	/**
	 * @param {String[]} path
	 * @param {CallOptions} callOptions
	 * @param {Function} callback
	 * @param {ExecutionPathOptions} options
	 */
	forEachReturnExpressionWhenCalledAtPath (
		_path: string[],
		_callOptions: CallOptions,
		_callback: (options: ExecutionPathOptions) => (node: Node) => void,
		_options: ExecutionPathOptions
	) { }

	/**
	 * @returns {String}
	 */
	getName (_es: boolean) {
		return this.name;
	}

	/**
	 * @param {String[]} path
	 * @param {ExecutionPathOptions} options
	 * @return {boolean}
	 */
	hasEffectsWhenAccessedAtPath (path: string[], _options: ExecutionPathOptions) {
		return path.length > 0;
	}

	/**
	 * @param {String[]} path
	 * @param {ExecutionPathOptions} options
	 * @return {boolean}
	 */
	hasEffectsWhenAssignedAtPath (_path: string[], _options: ExecutionPathOptions) {
		return true;
	}

	/**
	 * @param {String[]} path
	 * @param {CallOptions} callOptions
	 * @param {ExecutionPathOptions} options
	 * @return {boolean}
	 */
	hasEffectsWhenCalledAtPath (_path: string[], _callOptions: CallOptions, _options: ExecutionPathOptions) {
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
		if (this.included) {
			return false;
		}
		this.included = true;
		return true;
	}

	/**
	 * @param {String[]} path
	 * @param {CallOptions} callOptions
	 * @param {Function} predicateFunction
	 * @param {ExecutionPathOptions} options
	 * @returns {boolean}
	 */
	someReturnExpressionWhenCalledAtPath (
		_path: string[],
		_callOptions: CallOptions,
		predicateFunction: (options: ExecutionPathOptions) => PredicateFunction,
		options: ExecutionPathOptions
	) {
		return predicateFunction(options)(UNKNOWN_ASSIGNMENT);
	}
}
