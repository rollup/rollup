import * as acorn from 'acorn';
import { locate } from 'locate-character';
import MagicString from 'magic-string';
import { AstContext, CommentDescription } from '../../../Module';
import { NodeRenderOptions, RenderOptions } from '../../../utils/renderHelpers';
import { CallOptions } from '../../CallOptions';
import { DeoptimizableEntity } from '../../DeoptimizableEntity';
import { Entity } from '../../Entity';
import {
	createHasEffectsContext,
	HasEffectsContext,
	InclusionContext
} from '../../ExecutionContext';
import { getAndCreateKeys, keys } from '../../keys';
import ChildScope from '../../scopes/ChildScope';
import { ObjectPath, PathTracker } from '../../utils/PathTracker';
import { LiteralValueOrUnknown, UnknownValue, UNKNOWN_EXPRESSION } from '../../values';
import Variable from '../../variables/Variable';
import * as NodeType from '../NodeType';
import SpreadElement from '../SpreadElement';
import { ExpressionEntity } from './Expression';

export interface GenericEsTreeNode extends acorn.Node {
	[key: string]: any;
}

export const INCLUDE_PARAMETERS: 'variables' = 'variables';
export type IncludeChildren = boolean | typeof INCLUDE_PARAMETERS;

export interface Node extends Entity {
	annotations?: CommentDescription[];
	context: AstContext;
	end: number;
	esTreeNode: GenericEsTreeNode;
	included: boolean;
	keys: string[];
	needsBoundaries?: boolean;
	parent: Node | { type?: string };
	preventChildBlockScope?: boolean;
	start: number;
	type: string;
	variable?: Variable | null;

	addExportedVariables(variables: Variable[], exportNamesByVariable: Map<Variable, string[]>): void;

	/**
	 * Called once all nodes have been initialised and the scopes have been populated.
	 */
	bind(): void;

	/**
	 * Determine if this Node would have an effect on the bundle.
	 * This is usually true for already included nodes. Exceptions are e.g. break statements
	 * which only have an effect if their surrounding loop or switch statement is included.
	 * The options pass on information like this about the current execution path.
	 */
	hasEffects(context: HasEffectsContext): boolean;

	/**
	 * Includes the node in the bundle. If the flag is not set, children are usually included
	 * if they are necessary for this node (e.g. a function body) or if they have effects.
	 * Necessary variables need to be included as well.
	 */
	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren): void;

	/**
	 * Alternative version of include to override the default behaviour of
	 * declarations to only include nodes for declarators that have an effect. Necessary
	 * for for-loops that do not use a declared loop variable.
	 */
	includeAllDeclaredVariables(
		context: InclusionContext,
		includeChildrenRecursively: IncludeChildren
	): void;

	render(code: MagicString, options: RenderOptions, nodeRenderOptions?: NodeRenderOptions): void;

	/**
	 * Start a new execution path to determine if this node has an effect on the bundle and
	 * should therefore be included. Included nodes should always be included again in subsequent
	 * visits as the inclusion of additional variables may require the inclusion of more child
	 * nodes in e.g. block statements.
	 */
	shouldBeIncluded(context: InclusionContext): boolean;
}

export interface StatementNode extends Node {}

export interface ExpressionNode extends ExpressionEntity, Node {}

export class NodeBase implements ExpressionNode {
	context: AstContext;
	end!: number;
	esTreeNode: acorn.Node;
	included = false;
	keys: string[];
	parent: Node | { context: AstContext; type: string };
	scope!: ChildScope;
	start!: number;
	type!: keyof typeof NodeType;

	constructor(
		esTreeNode: GenericEsTreeNode,
		parent: Node | { context: AstContext; type: string },
		parentScope: ChildScope
	) {
		this.esTreeNode = esTreeNode;
		this.keys = keys[esTreeNode.type] || getAndCreateKeys(esTreeNode);
		this.parent = parent;
		this.context = parent.context;
		this.createScope(parentScope);
		this.parseNode(esTreeNode);
		this.initialise();
		this.context.magicString.addSourcemapLocation(this.start);
		this.context.magicString.addSourcemapLocation(this.end);
	}

	addExportedVariables(
		_variables: Variable[],
		_exportNamesByVariable: Map<Variable, string[]>
	): void {}

	/**
	 * Override this to bind assignments to variables and do any initialisations that
	 * require the scopes to be populated with variables.
	 */
	bind() {
		for (const key of this.keys) {
			const value = (this as GenericEsTreeNode)[key];
			if (value === null || key === 'annotations') continue;
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
	createScope(parentScope: ChildScope) {
		this.scope = parentScope;
	}

	deoptimizePath(_path: ObjectPath) {}

	getLiteralValueAtPath(
		_path: ObjectPath,
		_recursionTracker: PathTracker,
		_origin: DeoptimizableEntity
	): LiteralValueOrUnknown {
		return UnknownValue;
	}

	getReturnExpressionWhenCalledAtPath(
		_path: ObjectPath,
		_recursionTracker: PathTracker,
		_origin: DeoptimizableEntity
	): ExpressionEntity {
		return UNKNOWN_EXPRESSION;
	}

	hasEffects(context: HasEffectsContext): boolean {
		for (const key of this.keys) {
			const value = (this as GenericEsTreeNode)[key];
			if (value === null || key === 'annotations') continue;
			if (Array.isArray(value)) {
				for (const child of value) {
					if (child !== null && child.hasEffects(context)) return true;
				}
			} else if (value.hasEffects(context)) return true;
		}
		return false;
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, _context: HasEffectsContext) {
		return path.length > 0;
	}

	hasEffectsWhenAssignedAtPath(_path: ObjectPath, _context: HasEffectsContext) {
		return true;
	}

	hasEffectsWhenCalledAtPath(
		_path: ObjectPath,
		_callOptions: CallOptions,
		_context: HasEffectsContext
	) {
		return true;
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren) {
		this.included = true;
		for (const key of this.keys) {
			const value = (this as GenericEsTreeNode)[key];
			if (value === null || key === 'annotations') continue;
			if (Array.isArray(value)) {
				for (const child of value) {
					if (child !== null) child.include(context, includeChildrenRecursively);
				}
			} else {
				value.include(context, includeChildrenRecursively);
			}
		}
	}

	includeAllDeclaredVariables(
		context: InclusionContext,
		includeChildrenRecursively: IncludeChildren
	): void {
		this.include(context, includeChildrenRecursively);
	}

	includeCallArguments(context: InclusionContext, args: (ExpressionNode | SpreadElement)[]): void {
		for (const arg of args) {
			arg.include(context, false);
		}
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

	parseNode(esTreeNode: GenericEsTreeNode) {
		for (const key of Object.keys(esTreeNode)) {
			// That way, we can override this function to add custom initialisation and then call super.parseNode
			if (this.hasOwnProperty(key)) continue;
			const value = esTreeNode[key];
			if (typeof value !== 'object' || value === null || key === 'annotations') {
				(this as GenericEsTreeNode)[key] = value;
			} else if (Array.isArray(value)) {
				(this as GenericEsTreeNode)[key] = [];
				for (const child of value) {
					(this as GenericEsTreeNode)[key].push(
						child === null
							? null
							: new (this.context.nodeConstructors[child.type] ||
									this.context.nodeConstructors.UnknownNode)(child, this, this.scope)
					);
				}
			} else {
				(this as GenericEsTreeNode)[key] = new (this.context.nodeConstructors[value.type] ||
					this.context.nodeConstructors.UnknownNode)(value, this, this.scope);
			}
		}
	}

	render(code: MagicString, options: RenderOptions) {
		for (const key of this.keys) {
			const value = (this as GenericEsTreeNode)[key];
			if (value === null || key === 'annotations') continue;
			if (Array.isArray(value)) {
				for (const child of value) {
					if (child !== null) child.render(code, options);
				}
			} else {
				value.render(code, options);
			}
		}
	}

	shouldBeIncluded(context: InclusionContext): boolean {
		return this.included || (!context.brokenFlow && this.hasEffects(createHasEffectsContext()));
	}
}

export { NodeBase as StatementBase };

// useful for debugging
export function locateNode(node: Node) {
	const location = locate(node.context.code, node.start, { offsetLine: 1 });
	(location as any).file = node.context.fileName;
	location.toString = () => JSON.stringify(location);

	return location;
}

export function logNode(node: Node) {
	console.log(node.context.code.slice(node.start, node.end));
}
