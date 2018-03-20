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
import Import from '../Import';

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
	variable?: Variable;

	/**
	 * Called once all nodes have been initialised and the scopes have been populated.
	 * Usually one should not override this function but override bindNode and/or
	 * bindChildren instead.
	 */
	bind(): void;
	eachChild(callback: (node: Node) => void): void;

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
	includeInBundle(): boolean;

	/**
	 * Alternative version of includeInBundle to override the default behaviour of
	 * declarations to only include nodes for declarators that have an effect. Necessary
	 * for for-loops that do not use a declared loop variable.
	 */
	includeWithAllDeclaredVariables(): boolean;

	/**
	 * Assign a scope to this node and make sure all children have the right scopes.
	 * Perform any additional initialisation that does not depend on the scope being
	 * populated with variables.
	 * Usually one should not override this function but override initialiseScope,
	 * initialiseNode and/or initialiseChildren instead. BlockScopes have a special
	 * alternative initialisation initialiseAndReplaceScope.
	 */
	initialise(parentScope: Scope, dynamicImportReturnList: Import[]): void;
	initialiseAndDeclare(
		parentScope: Scope,
		dynamicImportReturnList: Import[],
		kind: string,
		init: ExpressionEntity | null
	): void;
	render(code: MagicString, options: RenderOptions, nodeRenderOptions?: NodeRenderOptions): void;

	/**
	 * Start a new execution path to determine if this node has an effect on the bundle and
	 * should therefore be included. Included nodes should always be included again in subsequent
	 * visits as the inclusion of additional variables may require the inclusion of more child
	 * nodes in e.g. block statements.
	 */
	shouldBeIncluded(): boolean;
	someChild(callback: (node: Node) => boolean): boolean;
}

export interface StatementNode extends Node {}

export interface ExpressionNode extends ExpressionEntity, Node {}

export class NodeBase implements ExpressionNode {
	type: string;
	keys: string[];
	included: boolean = false;
	scope: Scope;
	start: number;
	end: number;
	module: Module;
	parent: Node | { type?: string };

	constructor(
		esTreeNode: GenericEsTreeNode,
		// we need to pass down the node constructors to avoid a circular dependency
		nodeConstructors: { [p: string]: typeof NodeBase },
		parent: Node | {},
		module: Module
	) {
		this.keys = keys[esTreeNode.type] || getAndCreateKeys(esTreeNode);
		this.parent = parent;
		this.module = module;
		for (const key in esTreeNode) {
			const value = esTreeNode[key];
			if (typeof value !== 'object' || value === null) {
				(<GenericEsTreeNode>this)[key] = value;
			} else if (Array.isArray(value)) {
				(<GenericEsTreeNode>this)[key] = [];
				for (const child of value) {
					if (child === null) {
						(<GenericEsTreeNode>this)[key].push(null);
					} else {
						const Type = nodeConstructors[child.type] || nodeConstructors.UnknownNode;
						(<GenericEsTreeNode>this)[key].push(new Type(child, nodeConstructors, this, module));
					}
				}
			} else {
				const Type = nodeConstructors[value.type] || nodeConstructors.UnknownNode;
				(<GenericEsTreeNode>this)[key] = new Type(value, nodeConstructors, this, module);
			}
		}
		module.magicString.addSourcemapLocation(this.start);
		module.magicString.addSourcemapLocation(this.end);
	}

	bind() {
		this.bindChildren();
		this.bindNode();
	}

	/**
	 * Override to control on which children "bind" is called.
	 */
	bindChildren() {
		this.eachChild((child: Node) => child.bind());
	}

	/**
	 * Override this to bind assignments to variables and do any initialisations that
	 * require the scopes to be populated with variables.
	 */
	bindNode() {}

	eachChild(callback: (node: Node) => void) {
		for (const key of this.keys) {
			const value = (<GenericEsTreeNode>this)[key];
			if (!value) continue;

			if (Array.isArray(value)) {
				for (const child of value) {
					if (child) callback(child);
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
		return this.someChild((child: NodeBase) => child.hasEffects(options));
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

	private hasIncludedChild(): boolean {
		return this.included || this.someChild((child: NodeBase) => child.hasIncludedChild());
	}

	includeInBundle() {
		let addedNewNodes = !this.included;
		this.included = true;
		this.eachChild(childNode => {
			if (childNode.includeInBundle()) {
				addedNewNodes = true;
			}
		});
		return addedNewNodes;
	}

	includeWithAllDeclaredVariables() {
		return this.includeInBundle();
	}

	initialise(parentScope: Scope, dynamicImportReturnList: Import[]) {
		this.initialiseScope(parentScope);
		this.initialiseNode(parentScope, dynamicImportReturnList);
		this.initialiseChildren(parentScope, dynamicImportReturnList);
	}

	initialiseAndDeclare(
		_parentScope: Scope,
		_dynamicImportReturnList: Import[],
		_kind: string,
		_init: ExpressionEntity | null
	) {}

	/**
	 * Override to change how and with what scopes children are initialised
	 */
	initialiseChildren(_parentScope: Scope, dynamicImportReturnList: Import[]) {
		this.eachChild(child => child.initialise(this.scope, dynamicImportReturnList));
	}

	/**
	 * Override to perform special initialisation steps after the scope is initialised
	 */
	initialiseNode(_parentScope: Scope, _dynamicImportReturnList: Import[]) {}

	/**
	 * Override if this scope should receive a different scope than the parent scope.
	 */
	initialiseScope(parentScope: Scope) {
		this.scope = parentScope;
	}

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

	reassignPath(_path: ObjectPath, _options: ExecutionPathOptions) {}

	render(code: MagicString, options: RenderOptions) {
		this.eachChild(child => child.render(code, options));
	}

	shouldBeIncluded() {
		return this.hasIncludedChild() || this.hasEffects(ExecutionPathOptions.create());
	}

	someChild(callback: (node: NodeBase) => boolean) {
		for (const key of this.keys) {
			const value = (<GenericEsTreeNode>this)[key];
			if (!value) continue;

			if (Array.isArray(value)) {
				for (const child of value) {
					if (child && callback(child)) return true;
				}
			} else if (callback(value)) return true;
		}
		return false;
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
