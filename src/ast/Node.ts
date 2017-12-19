/* eslint-disable no-unused-vars */

/// <reference path="./Node.d.ts" />

import { locate } from 'locate-character';
import { UNKNOWN_ASSIGNMENT, UNKNOWN_VALUE } from './values';
import ExecutionPathOptions from './ExecutionPathOptions';
import Scope from './scopes/Scope';
import Module from '../Module';
import MagicString from 'magic-string';
import CallOptions from './CallOptions';

export default class Node {

	name: string;
	type: string;
	keys: string[];
	included: boolean;
	scope: Scope;
	start: number;
	end: number;
	next: number;
	module: Module;

	constructor () {
		this.keys = [];
	}

	/**
	 * Called once all nodes have been initialised and the scopes have been populated.
	 * Usually one should not override this function but override bindNode and/or
	 * bindChildren instead.
	 */
	bind () {
		this.bindChildren();
		this.bindNode();
	}

	/**
	 * Reassign a given path of an object.
	 * E.g., node.reassignPath(['x', 'y']) is called when something
	 * is assigned to node.x.y.
	 * The default noop implementation is ok as long as hasEffectsWhenAssignedAtPath
	 * always returns true for this node. Otherwise it should be overridden.
	 * @param {String[]} path
	 * @param {ExecutionPathOptions} options
	 */
	reassignPath (path: string[], options: ExecutionPathOptions) { }

	/**
	 * Override to control on which children "bind" is called.
	 */
	bindChildren () {
		this.eachChild((child: Node) => child.bind());
	}

	/**
	 * Override this to bind assignments to variables and do any initialisations that
	 * require the scopes to be populated with variables.
	 */
	bindNode () { }

	eachChild (callback: (node: Node) => void) {
		this.keys.forEach(key => {
			const value = (<any>this)[key];
			if (!value) return;

			if (Array.isArray(value)) {
				value.forEach(child => child && callback(child));
			} else {
				callback(value);
			}
		});
	}

	/**
	 * Executes the callback on each possible return expression when calling this node.
	 * @param {String[]} path
	 * @param {CallOptions} callOptions
	 * @param {Function} callback
	 * @param {ExecutionPathOptions} options
	 */
	forEachReturnExpressionWhenCalledAtPath (path: string[], callOptions: CallOptions, callback, options: ExecutionPathOptions) { }

	getValue () {
		return UNKNOWN_VALUE;
	}

	/**
	 * Determine if this Node would have an effect on the bundle.
	 * This is usually true for already included nodes. Exceptions are e.g. break statements
	 * which only have an effect if their surrounding loop or switch statement is included.
	 * The options pass on information like this about the current execution path.
	 * @param {ExecutionPathOptions} options
	 * @return {boolean}
	 */
	hasEffects (options: ExecutionPathOptions): boolean {
		return this.someChild((child: Node) => child.hasEffects(options));
	}

	/**
	 * @param {String[]} path
	 * @param {ExecutionPathOptions} options
	 * @return {boolean}
	 */
	hasEffectsWhenAccessedAtPath (path: string[], options: ExecutionPathOptions) {
		return path.length > 0;
	}

	/**
	 * @param {String[]} path
	 * @param {ExecutionPathOptions} options
	 * @return {boolean}
	 */
	hasEffectsWhenAssignedAtPath (path: string[], options: ExecutionPathOptions) {
		return true;
	}

	/**
	 * @param {String[]} path
	 * @param {CallOptions} callOptions
	 * @param {ExecutionPathOptions} options
	 * @return {boolean}
	 */
	hasEffectsWhenCalledAtPath (path: string[], callOptions: CallOptions, options: ExecutionPathOptions) {
		return true;
	}

	/**
	 * Returns true if this node or any of its children is included.
	 * @return {boolean}
	 */
	hasIncludedChild (): boolean {
		return (
			this.included || this.someChild((child: Node) => child.hasIncludedChild())
		);
	}

	/**
	 * Includes the node in the bundle. Children are usually included if they are
	 * necessary for this node (e.g. a function body) or if they have effects.
	 * Necessary variables need to be included as well. Should return true if any
	 * nodes or variables have been added that were missing before.
	 * @return {boolean}
	 */
	includeInBundle () {
		let addedNewNodes = !this.included;
		this.included = true;
		this.eachChild(childNode => {
			if (childNode.includeInBundle()) {
				addedNewNodes = true;
			}
		});
		return addedNewNodes;
	}

	/**
	 * Alternative version of includeInBundle to override the default behaviour of
	 * declarations to only include nodes for declarators that have an effect. Necessary
	 * for for-loops that do not use a declared loop variable.
	 * @return {boolean}
	 */
	includeWithAllDeclarations () {
		return this.includeInBundle();
	}

	/**
	 * Assign a scope to this node and make sure all children have the right scopes.
	 * Perform any additional initialisation that does not depend on the scope being
	 * populated with variables.
	 * Usually one should not override this function but override initialiseScope,
	 * initialiseNode and/or initialiseChildren instead. BlockScopes have a special
	 * alternative initialisation initialiseAndReplaceScope.
	 * @param {Scope} parentScope
	 */
	initialise (parentScope: Scope) {
		this.initialiseScope(parentScope);
		this.initialiseNode(parentScope);
		this.initialiseChildren(parentScope);
	}

	/**
	 * Override to change how and with what scopes children are initialised
	 * @param {Scope} parentScope
	 */
	initialiseChildren (parentScope: Scope) {
		this.eachChild(child => child.initialise(this.scope));
	}

	/**
	 * Override to perform special initialisation steps after the scope is initialised
	 * @param {Scope} parentScope
	 */
	initialiseNode (parentScope?: Scope) { }

	/**
	 * Override if this scope should receive a different scope than the parent scope.
	 * @param {Scope} parentScope
	 */
	initialiseScope (parentScope: Scope) {
		this.scope = parentScope;
	}

	insertSemicolon (code: MagicString) {
		if (code.original[this.end - 1] !== ';') {
			code.appendLeft(this.end, ';');
		}
	}

	locate () {
		// useful for debugging
		const location = locate(this.module.code, this.start, { offsetLine: 1 });
		location.file = this.module.id;
		location.toString = () => JSON.stringify(location);

		return location;
	}

	render (code, es: boolean) {
		this.eachChild(child => child.render(code, es));
	}

	/**
	 * Start a new execution path to determine if this node has an effect on the bundle and
	 * should therefore be included. Included nodes should always be included again in subsequent
	 * visits as the inclusion of additional variables may require the inclusion of more child
	 * nodes in e.g. block statements.
	 * @return {boolean}
	 */
	shouldBeIncluded () {
		return (
			this.included ||
			this.hasEffects(ExecutionPathOptions.create()) ||
			this.hasIncludedChild()
		);
	}

	someChild (callback: (node: Node) => boolean) {
		return this.keys.some(key => {
			const value = (<any>this)[key];
			if (!value) return false;

			if (Array.isArray(value)) {
				return value.some(child => child && callback(child));
			}
			return callback(value);
		});
	}

	/**
	 * Returns true if some possible return expression when called at the given
	 * path returns true. predicateFunction receives a `node` as parameter.
	 * @param {String[]} path
	 * @param {CallOptions} callOptions
	 * @param {Function} predicateFunction
	 * @param {ExecutionPathOptions} options
	 * @returns {boolean}
	 */
	someReturnExpressionWhenCalledAtPath (path: string[], callOptions: CallOptions, predicateFunction, options: ExecutionPathOptions) {
		return predicateFunction(options)(UNKNOWN_ASSIGNMENT);
	}

	toString () {
		return this.module.code.slice(this.start, this.end);
	}
}
