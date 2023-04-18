import type * as acorn from 'acorn';
import { locate, type Location } from 'locate-character';
import type MagicString from 'magic-string';
import type { AstContext } from '../../../Module';
import { ANNOTATION_KEY, INVALID_COMMENT_KEY } from '../../../utils/pureComments';
import type { NodeRenderOptions, RenderOptions } from '../../../utils/renderHelpers';
import type { DeoptimizableEntity } from '../../DeoptimizableEntity';
import type { Entity } from '../../Entity';
import {
	createHasEffectsContext,
	type HasEffectsContext,
	type InclusionContext
} from '../../ExecutionContext';
import type { NodeInteractionAssigned } from '../../NodeInteractions';
import { INTERACTION_ASSIGNED } from '../../NodeInteractions';
import { getAndCreateKeys, keys } from '../../keys';
import type ChildScope from '../../scopes/ChildScope';
import { EMPTY_PATH, UNKNOWN_PATH } from '../../utils/PathTracker';
import type Variable from '../../variables/Variable';
import type * as NodeType from '../NodeType';
import type { InclusionOptions } from './Expression';
import { ExpressionEntity } from './Expression';

export interface GenericEsTreeNode extends acorn.Node {
	[key: string]: any;
}

export const INCLUDE_PARAMETERS = 'variables' as const;
export type IncludeChildren = boolean | typeof INCLUDE_PARAMETERS;

export interface Node extends Entity {
	annotations?: acorn.Comment[];
	context: AstContext;
	end: number;
	esTreeNode: GenericEsTreeNode | null;
	included: boolean;
	keys: string[];
	needsBoundaries?: boolean;
	parent: Node | { type?: string };
	preventChildBlockScope?: boolean;
	start: number;
	type: string;
	variable?: Variable | null;

	addExportedVariables(
		variables: readonly Variable[],
		exportNamesByVariable: ReadonlyMap<Variable, readonly string[]>
	): void;

	/**
	 * Called once all nodes have been initialised and the scopes have been
	 * populated.
	 */
	bind(): void;

	/**
	 * Determine if this Node would have an effect on the bundle. This is usually
	 * true for already included nodes. Exceptions are e.g. break statements which
	 * only have an effect if their surrounding loop or switch statement is
	 * included.
	 * The options pass on information like this about the current execution path.
	 */
	hasEffects(context: HasEffectsContext): boolean;

	/**
	 * Special version of hasEffects for assignment left-hand sides which ensures
	 * that accessor effects are checked as well. This is necessary to do from the
	 * child so that member expressions can use the correct this value.
	 * setAssignedValue needs to be called during initialise to use this.
	 */
	hasEffectsAsAssignmentTarget(context: HasEffectsContext, checkAccess: boolean): boolean;

	/**
	 * Includes the node in the bundle. If the flag is not set, children are
	 * usually included if they are necessary for this node (e.g. a function body)
	 * or if they have effects. Necessary variables need to be included as well.
	 */
	include(
		context: InclusionContext,
		includeChildrenRecursively: IncludeChildren,
		options?: InclusionOptions
	): void;

	/**
	 * Special version of include for assignment left-hand sides which ensures
	 * that accessors are handled correctly. This is necessary to do from the
	 * child so that member expressions can use the correct this value.
	 * setAssignedValue needs to be called during initialise to use this.
	 */
	includeAsAssignmentTarget(
		context: InclusionContext,
		includeChildrenRecursively: IncludeChildren,
		deoptimizeAccess: boolean
	): void;

	render(code: MagicString, options: RenderOptions, nodeRenderOptions?: NodeRenderOptions): void;

	/**
	 * Sets the assigned value e.g. for assignment expression left. This must be
	 * called during initialise in case hasEffects/includeAsAssignmentTarget are
	 * used.
	 */
	setAssignedValue(value: ExpressionEntity): void;

	/**
	 * Start a new execution path to determine if this node has an effect on the
	 * bundle and should therefore be included. Included nodes should always be
	 * included again in subsequent visits as the inclusion of additional
	 * variables may require the inclusion of more child nodes in e.g. block
	 * statements.
	 */
	shouldBeIncluded(context: InclusionContext): boolean;
}

export type StatementNode = Node;

export interface ExpressionNode extends ExpressionEntity, Node {
	isSkippedAsOptional?(origin: DeoptimizableEntity): boolean;
}

export interface ChainElement extends ExpressionNode {
	optional: boolean;
	isSkippedAsOptional(origin: DeoptimizableEntity): boolean;
}

export class NodeBase extends ExpressionEntity implements ExpressionNode {
	declare annotations?: acorn.Comment[];
	context: AstContext;
	declare end: number;
	esTreeNode: acorn.Node | null;
	keys: string[];
	parent: Node | { context: AstContext; type: string };
	declare scope: ChildScope;
	declare start: number;
	declare type: keyof typeof NodeType;
	/**
	 * This will be populated during initialise if setAssignedValue is called.
	 */
	protected declare assignmentInteraction: NodeInteractionAssigned;
	/**
	 * Nodes can apply custom deoptimizations once they become part of the
	 * executed code. To do this, they must initialize this as false, implement
	 * applyDeoptimizations and call this from include and hasEffects if they have
	 * custom handlers
	 */
	protected deoptimized = false;

	constructor(
		esTreeNode: GenericEsTreeNode,
		parent: Node | { context: AstContext; type: string },
		parentScope: ChildScope,
		keepEsTreeNode = false
	) {
		super();
		// Nodes can opt-in to keep the AST if needed during the build pipeline.
		// Avoid true when possible as large AST takes up memory.
		this.esTreeNode = keepEsTreeNode ? esTreeNode : null;
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
		_variables: readonly Variable[],
		_exportNamesByVariable: ReadonlyMap<Variable, readonly string[]>
	): void {}

	/**
	 * Override this to bind assignments to variables and do any initialisations
	 * that require the scopes to be populated with variables.
	 */
	bind(): void {
		for (const key of this.keys) {
			const value = (this as GenericEsTreeNode)[key];
			if (Array.isArray(value)) {
				for (const child of value) {
					child?.bind();
				}
			} else if (value) {
				value.bind();
			}
		}
	}

	/**
	 * Override if this node should receive a different scope than the parent
	 * scope.
	 */
	createScope(parentScope: ChildScope): void {
		this.scope = parentScope;
	}

	hasEffects(context: HasEffectsContext): boolean {
		if (!this.deoptimized) this.applyDeoptimizations();
		for (const key of this.keys) {
			const value = (this as GenericEsTreeNode)[key];
			if (value === null) continue;
			if (Array.isArray(value)) {
				for (const child of value) {
					if (child?.hasEffects(context)) return true;
				}
			} else if (value.hasEffects(context)) return true;
		}
		return false;
	}

	hasEffectsAsAssignmentTarget(context: HasEffectsContext, _checkAccess: boolean): boolean {
		return (
			this.hasEffects(context) ||
			this.hasEffectsOnInteractionAtPath(EMPTY_PATH, this.assignmentInteraction, context)
		);
	}

	include(
		context: InclusionContext,
		includeChildrenRecursively: IncludeChildren,
		_options?: InclusionOptions
	): void {
		if (!this.deoptimized) this.applyDeoptimizations();
		this.included = true;
		for (const key of this.keys) {
			const value = (this as GenericEsTreeNode)[key];
			if (value === null) continue;
			if (Array.isArray(value)) {
				for (const child of value) {
					child?.include(context, includeChildrenRecursively);
				}
			} else {
				value.include(context, includeChildrenRecursively);
			}
		}
	}

	includeAsAssignmentTarget(
		context: InclusionContext,
		includeChildrenRecursively: IncludeChildren,
		_deoptimizeAccess: boolean
	) {
		this.include(context, includeChildrenRecursively);
	}

	/**
	 * Override to perform special initialisation steps after the scope is
	 * initialised
	 */
	initialise(): void {}

	insertSemicolon(code: MagicString): void {
		if (code.original[this.end - 1] !== ';') {
			code.appendLeft(this.end, ';');
		}
	}

	parseNode(esTreeNode: GenericEsTreeNode, keepEsTreeNodeKeys?: string[]): void {
		for (const [key, value] of Object.entries(esTreeNode)) {
			// That way, we can override this function to add custom initialisation and then call super.parseNode
			if (this.hasOwnProperty(key)) continue;
			if (key.charCodeAt(0) === 95 /* _ */) {
				if (key === ANNOTATION_KEY) {
					this.annotations = value;
				} else if (key === INVALID_COMMENT_KEY) {
					for (const { start, end } of value as acorn.Comment[])
						this.context.magicString.remove(start, end);
				}
			} else if (typeof value !== 'object' || value === null) {
				(this as GenericEsTreeNode)[key] = value;
			} else if (Array.isArray(value)) {
				(this as GenericEsTreeNode)[key] = [];
				for (const child of value) {
					(this as GenericEsTreeNode)[key].push(
						child === null
							? null
							: new (this.context.getNodeConstructor(child.type))(
									child,
									this,
									this.scope,
									keepEsTreeNodeKeys?.includes(key)
							  )
					);
				}
			} else {
				(this as GenericEsTreeNode)[key] = new (this.context.getNodeConstructor(value.type))(
					value,
					this,
					this.scope,
					keepEsTreeNodeKeys?.includes(key)
				);
			}
		}
	}

	render(code: MagicString, options: RenderOptions): void {
		for (const key of this.keys) {
			const value = (this as GenericEsTreeNode)[key];
			if (value === null) continue;
			if (Array.isArray(value)) {
				for (const child of value) {
					child?.render(code, options);
				}
			} else {
				value.render(code, options);
			}
		}
	}

	setAssignedValue(value: ExpressionEntity): void {
		this.assignmentInteraction = { args: [null, value], type: INTERACTION_ASSIGNED };
	}

	shouldBeIncluded(context: InclusionContext): boolean {
		return this.included || (!context.brokenFlow && this.hasEffects(createHasEffectsContext()));
	}

	/**
	 * Just deoptimize everything by default so that when e.g. we do not track
	 * something properly, it is deoptimized.
	 * @protected
	 */
	protected applyDeoptimizations(): void {
		this.deoptimized = true;
		for (const key of this.keys) {
			const value = (this as GenericEsTreeNode)[key];
			if (value === null) continue;
			if (Array.isArray(value)) {
				for (const child of value) {
					child?.deoptimizePath(UNKNOWN_PATH);
				}
			} else {
				value.deoptimizePath(UNKNOWN_PATH);
			}
		}
		this.context.requestTreeshakingPass();
	}
}

export { NodeBase as StatementBase };

export function locateNode(node: Node): Location & { file: string } {
	const location = locate(node.context.code, node.start, { offsetLine: 1 }) as Location & {
		file: string;
	};
	location.file = node.context.fileName;
	location.toString = () => JSON.stringify(location);

	return location;
}

export function logNode(node: Node): string {
	return node.context.code.slice(node.start, node.end);
}
