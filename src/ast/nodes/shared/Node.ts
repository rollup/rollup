import { locate } from 'locate-character';
import ExecutionPathOptions from '../../ExecutionPathOptions';
import Scope from '../../scopes/Scope';
import Module from '../../../Module';
import MagicString from 'magic-string';
import Variable from '../../variables/Variable';
import { ExpressionEntity, ForEachReturnExpressionCallback, SomeReturnExpressionCallback } from './Expression';
import { ObjectPath } from '../../variables/VariableReassignmentTracker';
import CallOptions from '../../CallOptions';
import { UNKNOWN_EXPRESSION, UNKNOWN_VALUE } from '../../values';
import { Entity } from '../../Entity';

export interface Node extends Entity {
	end: number;
	included: boolean;
	keys: string[];
	leadingCommentStart: number;
	module: Module;
	next: number;
	parent: Node | { type?: string };
	start: number;
	type: string;
	variable?: Variable;
	__enhanced: boolean;

	/**
	 * Called once all nodes have been initialised and the scopes have been populated.
	 * Usually one should not override this function but override bindNode and/or
	 * bindChildren instead.
	 */
	bind (): void;
	eachChild (callback: (node: Node) => void): void;

	/**
	 * Determine if this Node would have an effect on the bundle.
	 * This is usually true for already included nodes. Exceptions are e.g. break statements
	 * which only have an effect if their surrounding loop or switch statement is included.
	 * The options pass on information like this about the current execution path.
	 */
	hasEffects (options: ExecutionPathOptions): boolean;

	/**
	 * Includes the node in the bundle. Children are usually included if they are
	 * necessary for this node (e.g. a function body) or if they have effects.
	 * Necessary variables need to be included as well. Should return true if any
	 * nodes or variables have been added that were missing before.
	 */
	includeInBundle(): boolean;

	/**
	 * Alternative version of includeInBundle to override the default behaviour of
	 * declarations to only include nodes for declarators that have an effect. Necessary
	 * for for-loops that do not use a declared loop variable.
	 */
	includeWithAllDeclarations(): boolean;

	/**
	 * Assign a scope to this node and make sure all children have the right scopes.
	 * Perform any additional initialisation that does not depend on the scope being
	 * populated with variables.
	 * Usually one should not override this function but override initialiseScope,
	 * initialiseNode and/or initialiseChildren instead. BlockScopes have a special
	 * alternative initialisation initialiseAndReplaceScope.
	 */
	initialise (parentScope: Scope): void;
	initialiseAndDeclare (parentScope: Scope, kind: string, init: ExpressionEntity | null): void;
	render(code: MagicString): void;

	/**
	 * Start a new execution path to determine if this node has an effect on the bundle and
	 * should therefore be included. Included nodes should always be included again in subsequent
	 * visits as the inclusion of additional variables may require the inclusion of more child
	 * nodes in e.g. block statements.
	 */
	shouldBeIncluded(): boolean;
	someChild(callback: (node: Node) => boolean): boolean;
}

export interface ExpressionNode extends ExpressionEntity, Node {}

export class NodeBase implements ExpressionNode {
	type: string;
	keys: string[];
	included: boolean;
	scope: Scope;
	start: number;
	end: number;
	leadingCommentStart: number;
	trailingCommentEnd: number;
	next: number;
	module: Module;
	parent: Node | { type?: string };
	__enhanced: boolean;

	constructor () {
		this.keys = [];
	}

	bind () {
		this.bindChildren();
		this.bindNode();
	}

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

	forEachReturnExpressionWhenCalledAtPath (
		_path: ObjectPath,
		_callOptions: CallOptions,
		_callback: ForEachReturnExpressionCallback,
		_options: ExecutionPathOptions
	) { }

	getValue () {
		return UNKNOWN_VALUE;
	}

	hasEffects (options: ExecutionPathOptions): boolean {
		return this.someChild((child: NodeBase) => child.hasEffects(options));
	}

	hasEffectsWhenAccessedAtPath (path: ObjectPath, _options: ExecutionPathOptions) {
		return path.length > 0;
	}

	hasEffectsWhenAssignedAtPath (_path: ObjectPath, _options: ExecutionPathOptions) {
		return true;
	}

	hasEffectsWhenCalledAtPath (_path: ObjectPath, _callOptions: CallOptions, _options: ExecutionPathOptions) {
		return true;
	}

	private hasIncludedChild (): boolean {
		return (
			this.included || this.someChild((child: NodeBase) => child.hasIncludedChild())
		);
	}

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

	includeWithAllDeclarations () {
		return this.includeInBundle();
	}

	initialise (parentScope: Scope) {
		this.initialiseScope(parentScope);
		this.initialiseNode(parentScope);
		this.initialiseChildren(parentScope);
	}

	initialiseAndDeclare (_parentScope: Scope, _kind: string, _init: ExpressionEntity | null) {}

	/**
	 * Override to change how and with what scopes children are initialised
	 */
	initialiseChildren (_parentScope: Scope) {
		this.eachChild(child => child.initialise(this.scope));
	}

	/**
	 * Override to perform special initialisation steps after the scope is initialised
	 */
	initialiseNode (_parentScope: Scope) { }

	/**
	 * Override if this scope should receive a different scope than the parent scope.
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

	reassignPath (_path: ObjectPath, _options: ExecutionPathOptions) { }

	render (code: MagicString) {
		this.eachChild(child => child.render(code));
	}

	shouldBeIncluded () {
		return (
			this.included ||
			this.hasEffects(ExecutionPathOptions.create()) ||
			this.hasIncludedChild()
		);
	}

	someChild (callback: (node: NodeBase) => boolean) {
		return this.keys.some(key => {
			const value = (<any>this)[key];
			if (!value) return false;

			if (Array.isArray(value)) {
				return value.some(child => child && callback(child));
			}
			return callback(value);
		});
	}

	someReturnExpressionWhenCalledAtPath (
		_path: ObjectPath,
		_callOptions: CallOptions,
		predicateFunction: SomeReturnExpressionCallback,
		options: ExecutionPathOptions
	): boolean {
		return predicateFunction(options)(UNKNOWN_EXPRESSION);
	}

	toString () {
		return this.module.code.slice(this.start, this.end);
	}
}
