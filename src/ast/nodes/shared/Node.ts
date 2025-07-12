import { locate, type Location } from 'locate-character';
import type MagicString from 'magic-string';
import type { AstNode } from '../../../rollup/ast-types';
import type { ast } from '../../../rollup/types';
import { ANNOTATION_KEY, INVALID_ANNOTATION_KEY } from '../../../utils/astConverterHelpers';
import type { NodeRenderOptions, RenderOptions } from '../../../utils/renderHelpers';
import { childNodeKeys } from '../../childNodeKeys';
import type { DeoptimizableEntity } from '../../DeoptimizableEntity';
import type { Entity } from '../../Entity';
import {
	createHasEffectsContext,
	type HasEffectsContext,
	type InclusionContext
} from '../../ExecutionContext';
import type { NodeInteractionAssigned } from '../../NodeInteractions';
import { INTERACTION_ASSIGNED } from '../../NodeInteractions';
import type ChildScope from '../../scopes/ChildScope';
import {
	EMPTY_PATH,
	type EntityPathTracker,
	type ObjectPath,
	UNKNOWN_PATH
} from '../../utils/PathTracker';
import type Variable from '../../variables/Variable';
import type * as NodeType from '../NodeType';
import { Flag, isFlagSet, setFlag } from './BitFlags';
import type { InclusionOptions, LiteralValueOrUnknown } from './Expression';
import { ExpressionEntity } from './Expression';

// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
export interface GenericEsTreeNode extends ast.BaseNode {
	[key: string]: any;
}

export const INCLUDE_PARAMETERS = 'variables' as const;
export type IncludeChildren = boolean | typeof INCLUDE_PARAMETERS;

export interface Node extends Entity {
	annotations?: readonly ast.Annotation[];
	end: number;
	included: boolean;
	needsBoundaries?: boolean;
	parent: Node | null;
	scope: ChildScope;
	preventChildBlockScope?: boolean;
	start: number;
	type: string;
	variable?: Variable | null;

	addExportedVariables(
		variables: Variable[],
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
	 * This is called repeatedly for each tree-shaking pass.
	 */
	include(
		context: InclusionContext,
		includeChildrenRecursively: IncludeChildren,
		options?: InclusionOptions
	): void;

	/**
	 * Includes this node for the first time in the bundle and ensures that all
	 * paths that this node relies on are included as well. Does not include
	 * child nodes by default, though.
	 */
	includeNode(context: InclusionContext): void;

	/**
	 * Explicitly include a path of this Node.
	 */
	includePath(path: ObjectPath, context: InclusionContext): void;

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

	removeAnnotations(code: MagicString): void;

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

export const IS_SKIPPED_CHAIN = Symbol('IS_SKIPPED_CHAIN');
export type SkippedChain = typeof IS_SKIPPED_CHAIN;

export interface ExpressionNode extends ExpressionEntity, Node, Partial<ChainElement> {}

export interface ChainElement {
	getLiteralValueAtPathAsChainElement(
		path: ObjectPath,
		recursionTracker: EntityPathTracker,
		origin: DeoptimizableEntity
	): LiteralValueOrUnknown | SkippedChain;
	hasEffectsAsChainElement(context: HasEffectsContext): boolean | SkippedChain;
}

export class NodeBase<T extends AstNode> extends ExpressionEntity implements ExpressionNode {
	annotations?: readonly ast.Annotation[];
	end!: number;
	parent: Node | null;
	scope!: ChildScope;
	start!: number;
	type!: keyof typeof NodeType;
	/**
	 * This will be populated during initialise if setAssignedValue is called.
	 */
	protected assignmentInteraction!: NodeInteractionAssigned;

	/**
	 * Nodes can apply custom deoptimizations once they become part of the
	 * executed code. To do this, they must initialize this as false, implement
	 * applyDeoptimizations and call this from include and hasEffects if they have
	 * custom handlers
	 */
	protected get deoptimized(): boolean {
		return isFlagSet(this.flags, Flag.deoptimized);
	}

	protected set deoptimized(value: boolean) {
		this.flags = setFlag(this.flags, Flag.deoptimized, value);
	}

	constructor(parent: Node | null, parentScope: ChildScope) {
		super();
		this.parent = parent;
		this.scope = parentScope;
		this.createScope(parentScope);
	}

	addExportedVariables(
		_variables: Variable[],
		_exportNamesByVariable: ReadonlyMap<Variable, readonly string[]>
	): void {}

	/**
	 * Override this to bind assignments to variables and do any initialisations
	 * that require the scopes to be populated with variables.
	 */
	bind(): void {
		for (const key of childNodeKeys[this.type]) {
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
		for (const key of childNodeKeys[this.type]) {
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
		if (!this.included) this.includeNode(context);
		for (const key of childNodeKeys[this.type]) {
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

	includeNode(context: InclusionContext) {
		this.included = true;
		if (!this.deoptimized) this.applyDeoptimizations();
		for (const key of childNodeKeys[this.type]) {
			const value = (this as GenericEsTreeNode)[key];
			if (value === null) continue;
			if (Array.isArray(value)) {
				for (const child of value) {
					child?.includePath(UNKNOWN_PATH, context);
				}
			} else {
				value.includePath(UNKNOWN_PATH, context);
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
	initialise(): void {
		this.scope.context.magicString.addSourcemapLocation(this.start);
		this.scope.context.magicString.addSourcemapLocation(this.end);
	}

	// TODO Lukas These can be removed
	parseNode(esTreeNode: T): this {
		for (const [key, value] of Object.entries(esTreeNode)) {
			// Skip properties defined on the class already.
			// This way, we can override this function to add custom initialisation and then call super.parseNode
			// Note: this doesn't skip properties with defined getters/setters which we use to pack wrap booleans
			// in bitfields. Those are still assigned from the value in the esTreeNode.
			if (this.hasOwnProperty(key)) continue;

			if (typeof value !== 'object' || value === null) {
				(this as GenericEsTreeNode)[key] = value;
			} else if (Array.isArray(value)) {
				if (key === ANNOTATION_KEY || key === INVALID_ANNOTATION_KEY) {
					(this as GenericEsTreeNode)[key] = value;
				} else {
					(this as GenericEsTreeNode)[key] = new Array(value.length);
					let index = 0;
					for (const child of value) {
						(this as GenericEsTreeNode)[key][index++] =
							child === null
								? null
								: new (this.scope.context.getNodeConstructor(child.type))(
										this,
										this.scope
									).parseNode(child);
					}
				}
			} else {
				(this as GenericEsTreeNode)[key] = new (this.scope.context.getNodeConstructor(value.type))(
					this,
					this.scope
				).parseNode(value);
			}
		}
		// extend child keys for unknown node types
		childNodeKeys[esTreeNode.type] ||= createChildNodeKeysForNode(esTreeNode);
		this.initialise();
		return this;
	}

	removeAnnotations(code: MagicString): void {
		if (this.annotations) {
			for (const annotation of this.annotations) {
				code.remove(annotation.start, annotation.end);
			}
		}
	}

	render(code: MagicString, options: RenderOptions): void {
		for (const key of childNodeKeys[this.type]) {
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
	applyDeoptimizations() {
		this.deoptimized = true;
		for (const key of childNodeKeys[this.type]) {
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
		this.scope.context.requestTreeshakingPass();
	}
}

function createChildNodeKeysForNode(esTreeNode: GenericEsTreeNode): string[] {
	return Object.keys(esTreeNode).filter(
		key => typeof esTreeNode[key] === 'object' && key.charCodeAt(0) !== 95 /* _ */
	);
}

export function locateNode(node: Node): Location & { file: string } {
	const {
		start,
		scope: {
			context: { code, fileName }
		}
	} = node;
	const location = locate(code, start, { offsetLine: 1 }) as Location & {
		file: string;
	};
	location.file = fileName;
	location.toString = () => JSON.stringify(location);

	return location;
}

export function logNode(node: Node | ExpressionEntity): string {
	if ('scope' in node) {
		return node.scope.context.code.slice(node.start, node.end);
	}
	return node.constructor.name;
}

export function onlyIncludeSelf(this: NodeBase<AstNode>) {
	this.included = true;
	if (!this.deoptimized) this.applyDeoptimizations();
}

export function onlyIncludeSelfNoDeoptimize(this: NodeBase<AstNode>) {
	this.included = true;
}

export function doNotDeoptimize(this: NodeBase<AstNode>) {
	this.deoptimized = true;
}
