import { locate } from 'locate-character';
import MagicString from 'magic-string';
import { AstContext } from '../../../Module';
import { NodeRenderOptions, RenderOptions } from '../../../utils/renderHelpers';
import CallOptions from '../../CallOptions';
import { Entity } from '../../Entity';
import { ExecutionPathOptions, NEW_EXECUTION_PATH } from '../../ExecutionPathOptions';
import { getAndCreateKeys, keys } from '../../keys';
import Scope from '../../scopes/Scope';
import { ImmutableEntityPathTracker } from '../../utils/ImmutableEntityPathTracker';
import { LiteralValueOrUnknown, ObjectPath, UNKNOWN_EXPRESSION, UNKNOWN_VALUE } from '../../values';
import Variable from '../../variables/Variable';
import {
	ExpressionEntity,
	ForEachReturnExpressionCallback,
	SomeReturnExpressionCallback
} from './Expression';

export interface GenericEsTreeNode {
	type: string;
	[key: string]: any;
}

export interface Node extends Entity {
	end: number;
	included: boolean;
	keys: string[];
	context: AstContext;
	parent: Node | { type?: string };
	start: number;
	type: string;
	needsBoundaries?: boolean;
	preventChildBlockScope?: boolean;
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
	include(): void;

	/**
	 * Alternative version of include to override the default behaviour of
	 * declarations to only include nodes for declarators that have an effect. Necessary
	 * for for-loops that do not use a declared loop variable.
	 */
	includeWithAllDeclaredVariables(): void;
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
	context: AstContext;
	parent: Node | { type: string; context: AstContext };
	included: boolean;

	constructor(
		esTreeNode: GenericEsTreeNode,
		// we need to pass down the node constructors to avoid a circular dependency
		parent: Node | { type: string; context: AstContext },
		parentScope: Scope
	) {
		this.keys = keys[esTreeNode.type] || getAndCreateKeys(esTreeNode);
		this.parent = parent;
		this.context = parent.context;
		this.createScope(parentScope);
		this.parseNode(esTreeNode);
		this.initialise();
		this.context.magicString.addSourcemapLocation(this.start);
		this.context.magicString.addSourcemapLocation(this.end);
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
	createScope(parentScope: Scope) {
		this.scope = parentScope;
	}

	declare(_kind: string, _init: ExpressionEntity | null) {}

	forEachReturnExpressionWhenCalledAtPath(
		_path: ObjectPath,
		_callOptions: CallOptions,
		_callback: ForEachReturnExpressionCallback
	) {}

	getLiteralValueAtPath(
		_path: ObjectPath,
		_getValueTracker: ImmutableEntityPathTracker
	): LiteralValueOrUnknown {
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
		this.included = true;
		for (const key of this.keys) {
			const value = (<GenericEsTreeNode>this)[key];
			if (value === null) continue;
			if (Array.isArray(value)) {
				for (const child of value) {
					if (child !== null) child.include();
				}
			} else {
				value.include();
			}
		}
	}

	includeWithAllDeclaredVariables() {
		this.include();
	}

	/**
	 * Override to perform special initialisation steps after the scope is initialised
	 */
	initialise() {
		this.included = false;
	}

	insertSemicolon(code: MagicString) {
		if (code.original[this.end - 1] !== ';') {
			code.appendLeft(this.end, ';');
		}
	}

	locate() {
		// useful for debugging
		const location = locate(this.context.code, this.start, { offsetLine: 1 });
		location.file = this.context.fileName;
		location.toString = () => JSON.stringify(location);

		return location;
	}

	parseNode(esTreeNode: GenericEsTreeNode) {
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
						child === null
							? null
							: new (this.context.nodeConstructors[child.type] ||
									this.context.nodeConstructors.UnknownNode)(child, this, this.scope)
					);
				}
			} else {
				(<GenericEsTreeNode>this)[key] = new (this.context.nodeConstructors[value.type] ||
					this.context.nodeConstructors.UnknownNode)(value, this, this.scope);
			}
		}
	}

	reassignPath(_path: ObjectPath) {}

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
		return this.included || this.hasEffects(NEW_EXECUTION_PATH);
	}

	someReturnExpressionWhenCalledAtPath(
		_path: ObjectPath,
		_callOptions: CallOptions,
		predicateFunction: SomeReturnExpressionCallback,
		options: ExecutionPathOptions
	): boolean {
		return predicateFunction(options, UNKNOWN_EXPRESSION);
	}

	toString() {
		return this.context.code.slice(this.start, this.end);
	}
}

export { NodeBase as StatementBase };
