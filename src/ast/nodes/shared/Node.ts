import { locate } from 'locate-character';
import ExecutionPathOptions from '../../ExecutionPathOptions';
import Scope from '../../scopes/Scope';
import Module from '../../../Module';
import MagicString from 'magic-string';
import Variable from '../../variables/Variable';
import {
	ExpressionEntity,
	ForEachReturnExpressionCallback,
	SomeReturnExpressionCallback
} from './Expression';
import CallOptions from '../../CallOptions';
import { ObjectPath, UNKNOWN_EXPRESSION, UNKNOWN_VALUE } from '../../values';
import { Entity } from '../../Entity';
import { NodeRenderOptions, RenderOptions } from '../../../utils/renderHelpers';
import { getAndCreateKeys, keys } from '../../keys';

export interface GenericEsTreeNode {
	type: string;
	[key: string]: any;
}

export interface Node extends Entity {
	end: number;
	included: boolean;
	keys: string[];
	module: Module;
	needsBoundaries?: boolean;
	parent: Node | { type?: string };
	start: number;
	type: string;
	variable?: Variable | null;

	/**
	 * Called once all nodes have been initialised and the scopes have been populated.
	 */
	bind(): void;

	/**
	 * Declare a new variable with the optional initialisation.
	 */
	declare(kind: string, init: ExpressionEntity | null): void;

	/**
	 * Determine if this Node would have an effect on the bundle.
	 * This is usually true for already included nodes. Exceptions are e.g. break statements
	 * which only have an effect if their surrounding loop or switch statement is included.
	 * The options pass on information like this about the current execution path.
	 */
	hasEffects(options: ExecutionPathOptions): boolean;

	/**
	 * Includes the node in the bundle. Children are usually included if they are
	 * necessary for this node (e.g. a function body) or if they have effects.
	 * Necessary variables need to be included as well. Should return true if any
	 * nodes or variables have been added that were missing before.
	 */
	include(): boolean;

	/**
	 * Alternative version of include to override the default behaviour of
	 * declarations to only include nodes for declarators that have an effect. Necessary
	 * for for-loops that do not use a declared loop variable.
	 */
	includeWithAllDeclaredVariables(): boolean;
	render(code: MagicString, options: RenderOptions, nodeRenderOptions?: NodeRenderOptions): void;

	/**
	 * Start a new execution path to determine if this node has an effect on the bundle and
	 * should therefore be included. Included nodes should always be included again in subsequent
	 * visits as the inclusion of additional variables may require the inclusion of more child
	 * nodes in e.g. block statements.
	 */
	shouldBeIncluded(): boolean;
}

export interface StatementNode extends Node {}

export interface ExpressionNode extends ExpressionEntity, Node {}

export class NodeBase implements ExpressionNode {
	type: string;
	keys: string[];
	scope: Scope;
	start: number;
	end: number;
	module: Module;
	parent: Node | { type: string; module: Module };

	// Not initialised during construction
	included: boolean = false;

	constructor(
		esTreeNode: GenericEsTreeNode,
		// we need to pass down the node constructors to avoid a circular dependency
		nodeConstructors: { [p: string]: typeof NodeBase },
		parent: Node | { type: string; module: Module },
		parentScope: Scope,
		preventNewScope: boolean
	) {
		this.keys = keys[esTreeNode.type] || getAndCreateKeys(esTreeNode);
		this.parent = parent;
		this.module = parent.module;
		this.createScope(parentScope, preventNewScope);
		this.parseNode(esTreeNode, nodeConstructors);
		this.initialise();
		this.module.magicString.addSourcemapLocation(this.start);
		this.module.magicString.addSourcemapLocation(this.end);
	}

	/**
	 * Override this to bind assignments to variables and do any initialisations that
	 * require the scopes to be populated with variables.
	 */
	bind() {
		for (const key of this.keys) {
			const value = (<GenericEsTreeNode>this)[key];
			if (value === null) continue;
			if (Array.isArray(value)) {
				for (const child of value) {
					if (child !== null) child.bind();
				}
			} else {
				value.bind();
			}
		}
	}

	/**
	 * Override if this node should receive a different scope than the parent scope.
	 */
	createScope(parentScope: Scope, _preventNewScope: boolean) {
		this.scope = parentScope;
	}

	declare(_kind: string, _init: ExpressionEntity | null) {}

	eachChild(callback: (node: Node) => void) {
		for (const key of this.keys) {
			const value = (<GenericEsTreeNode>this)[key];
			if (value === null) continue;
			if (Array.isArray(value)) {
				for (const child of value) {
					if (child !== null) callback(child);
				}
			} else {
				callback(value);
			}
		}
	}

	forEachReturnExpressionWhenCalledAtPath(
		_path: ObjectPath,
		_callOptions: CallOptions,
		_callback: ForEachReturnExpressionCallback,
		_options: ExecutionPathOptions
	) {}

	getValue() {
		return UNKNOWN_VALUE;
	}

	hasEffects(options: ExecutionPathOptions): boolean {
		for (const key of this.keys) {
			const value = (<GenericEsTreeNode>this)[key];
			if (value === null) continue;
			if (Array.isArray(value)) {
				for (const child of value) {
					if (child !== null && child.hasEffects(options)) return true;
				}
			} else if (value.hasEffects(options)) return true;
		}
		return false;
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, _options: ExecutionPathOptions) {
		return path.length > 0;
	}

	hasEffectsWhenAssignedAtPath(_path: ObjectPath, _options: ExecutionPathOptions) {
		return true;
	}

	hasEffectsWhenCalledAtPath(
		_path: ObjectPath,
		_callOptions: CallOptions,
		_options: ExecutionPathOptions
	) {
		return true;
	}

	include() {
		let anotherPassNeeded = false;
		this.included = true;
		for (const key of this.keys) {
			const value = (<GenericEsTreeNode>this)[key];
			if (value === null) continue;
			if (Array.isArray(value)) {
				for (const child of value) {
					if (child !== null && child.include()) anotherPassNeeded = true;
				}
			} else if (value.include()) anotherPassNeeded = true;
		}
		return anotherPassNeeded;
	}

	includeWithAllDeclaredVariables() {
		return this.include();
	}

	/**
	 * Override to perform special initialisation steps after the scope is initialised
	 */
	initialise() {}

	insertSemicolon(code: MagicString) {
		if (code.original[this.end - 1] !== ';') {
			code.appendLeft(this.end, ';');
		}
	}

	locate() {
		// useful for debugging
		const location = locate(this.module.code, this.start, { offsetLine: 1 });
		location.file = this.module.id;
		location.toString = () => JSON.stringify(location);

		return location;
	}

	parseNode(esTreeNode: GenericEsTreeNode, nodeConstructors: { [p: string]: typeof NodeBase }) {
		for (const key of Object.keys(esTreeNode)) {
			// That way, we can override this function to add custom initialisation and then call super.parseNode
			if (this.hasOwnProperty(key)) continue;
			const value = esTreeNode[key];
			if (typeof value !== 'object' || value === null) {
				(<GenericEsTreeNode>this)[key] = value;
			} else if (Array.isArray(value)) {
				(<GenericEsTreeNode>this)[key] = [];
				for (const child of value) {
					(<GenericEsTreeNode>this)[key].push(
						child &&
							new (nodeConstructors[child.type] || nodeConstructors.UnknownNode)(
								child,
								nodeConstructors,
								this,
								this.scope,
								false
							)
					);
				}
			} else {
				(<GenericEsTreeNode>this)[key] = new (nodeConstructors[value.type] ||
					nodeConstructors.UnknownNode)(value, nodeConstructors, this, this.scope, false);
			}
		}
	}

	reassignPath(_path: ObjectPath, _options: ExecutionPathOptions) {}

	render(code: MagicString, options: RenderOptions) {
		for (const key of this.keys) {
			const value = (<GenericEsTreeNode>this)[key];
			if (value === null) continue;
			if (Array.isArray(value)) {
				for (const child of value) {
					if (child !== null) child.render(code, options);
				}
			} else {
				value.render(code, options);
			}
		}
	}

	shouldBeIncluded(): boolean {
		return this.included || this.hasEffects(ExecutionPathOptions.create());
	}

	someReturnExpressionWhenCalledAtPath(
		_path: ObjectPath,
		_callOptions: CallOptions,
		predicateFunction: SomeReturnExpressionCallback,
		options: ExecutionPathOptions
	): boolean {
		return predicateFunction(options)(UNKNOWN_EXPRESSION);
	}

	toString() {
		return this.module.code.slice(this.start, this.end);
	}
}

export { NodeBase as StatementBase };
