import type MagicString from 'magic-string';
import type { AstContext } from '../../Module';
import type { NormalizedTreeshakingOptions } from '../../rollup/types';
import { BLANK, EMPTY_ARRAY } from '../../utils/blank';
import { LOGLEVEL_WARN } from '../../utils/logging';
import { logIllegalImportReassignment, logMissingExport } from '../../utils/logs';
import type { NodeRenderOptions, RenderOptions } from '../../utils/renderHelpers';
import type { DeoptimizableEntity } from '../DeoptimizableEntity';
import type { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import { createHasEffectsContext, createInclusionContext } from '../ExecutionContext';
import type {
	NodeInteraction,
	NodeInteractionAccessed,
	NodeInteractionAssigned,
	NodeInteractionCalled
} from '../NodeInteractions';
import {
	INTERACTION_ACCESSED,
	INTERACTION_ASSIGNED,
	NODE_INTERACTION_UNKNOWN_ACCESS
} from '../NodeInteractions';
import { MAX_PATH_DEPTH } from '../utils/limitPathLength';
import {
	EMPTY_PATH,
	type EntityPathTracker,
	type ObjectPath,
	type ObjectPathKey,
	SHARED_RECURSION_TRACKER,
	SymbolToStringTag,
	UNKNOWN_PATH,
	UnknownKey,
	UnknownNonAccessorKey
} from '../utils/PathTracker';
import { UNDEFINED_EXPRESSION } from '../values';
import ExternalVariable from '../variables/ExternalVariable';
import type NamespaceVariable from '../variables/NamespaceVariable';
import type Variable from '../variables/Variable';
import Identifier from './Identifier';
import Literal from './Literal';
import type * as NodeType from './NodeType';
import type PrivateIdentifier from './PrivateIdentifier';
import { Flag, isFlagSet, setFlag } from './shared/BitFlags';
import { getChainElementLiteralValueAtPath } from './shared/chainElements';
import {
	deoptimizeInteraction,
	type ExpressionEntity,
	type LiteralValueOrUnknown,
	UNKNOWN_RETURN_EXPRESSION,
	UnknownValue
} from './shared/Expression';
import type { ChainElement, ExpressionNode, IncludeChildren, SkippedChain } from './shared/Node';
import { IS_SKIPPED_CHAIN, NodeBase } from './shared/Node';
import type { PatternNode } from './shared/Pattern';
import type Super from './Super';

function getResolvablePropertyKey(memberExpression: MemberExpression): string | null {
	return memberExpression.computed
		? getResolvableComputedPropertyKey(memberExpression.property)
		: (memberExpression.property as Identifier).name;
}

function getResolvableComputedPropertyKey(propertyKey: ExpressionNode): string | null {
	if (propertyKey instanceof Literal) {
		return String(propertyKey.value);
	}
	return null;
}

type PathWithPositions = { key: string; pos: number }[];

function getPathIfNotComputed(memberExpression: MemberExpression): PathWithPositions | null {
	const nextPathKey = memberExpression.propertyKey;
	const object = memberExpression.object;
	if (typeof nextPathKey === 'string') {
		if (object instanceof Identifier) {
			return [
				{ key: object.name, pos: object.start },
				{ key: nextPathKey, pos: memberExpression.property.start }
			];
		}
		if (object instanceof MemberExpression) {
			const parentPath = getPathIfNotComputed(object);
			return (
				parentPath && [...parentPath, { key: nextPathKey, pos: memberExpression.property.start }]
			);
		}
	}
	return null;
}

function getStringFromPath(path: PathWithPositions): string {
	let pathString = path[0].key;
	for (let index = 1; index < path.length; index++) {
		pathString += '.' + path[index].key;
	}
	return pathString;
}

export default class MemberExpression
	extends NodeBase
	implements DeoptimizableEntity, ChainElement, PatternNode
{
	declare object: ExpressionNode | Super;
	declare property: ExpressionNode | PrivateIdentifier;
	declare propertyKey: ObjectPathKey;
	declare type: NodeType.tMemberExpression;
	variable: Variable | null = null;
	declare protected assignmentInteraction: NodeInteractionAssigned;
	declare private accessInteraction: NodeInteractionAccessed;
	private expressionsToBeDeoptimized: DeoptimizableEntity[] = [];
	declare private dynamicPropertyKey: ObjectPathKey | null;

	get computed(): boolean {
		return isFlagSet(this.flags, Flag.computed);
	}
	set computed(value: boolean) {
		this.flags = setFlag(this.flags, Flag.computed, value);
	}

	get optional(): boolean {
		return isFlagSet(this.flags, Flag.optional);
	}
	set optional(value: boolean) {
		this.flags = setFlag(this.flags, Flag.optional, value);
	}

	private get assignmentDeoptimized(): boolean {
		return isFlagSet(this.flags, Flag.assignmentDeoptimized);
	}
	private set assignmentDeoptimized(value: boolean) {
		this.flags = setFlag(this.flags, Flag.assignmentDeoptimized, value);
	}

	private get bound(): boolean {
		return isFlagSet(this.flags, Flag.bound);
	}
	private set bound(value: boolean) {
		this.flags = setFlag(this.flags, Flag.bound, value);
	}

	private get isUndefined(): boolean {
		return isFlagSet(this.flags, Flag.isUndefined);
	}
	private set isUndefined(value: boolean) {
		this.flags = setFlag(this.flags, Flag.isUndefined, value);
	}

	bind(): void {
		this.bound = true;
		const path = getPathIfNotComputed(this);
		const baseVariable = path && this.scope.findVariable(path[0].key);
		if (baseVariable?.isNamespace) {
			const resolvedVariable = resolveNamespaceVariables(
				baseVariable,
				path!.slice(1),
				this.scope.context
			);
			if (!resolvedVariable) {
				super.bind();
			} else if (resolvedVariable === 'undefined') {
				this.isUndefined = true;
			} else {
				this.variable = resolvedVariable;
				this.scope.addNamespaceMemberAccess(getStringFromPath(path!), resolvedVariable);
			}
		} else {
			super.bind();
		}
	}

	deoptimizeArgumentsOnInteractionAtPath(
		interaction: NodeInteraction,
		path: ObjectPath,
		recursionTracker: EntityPathTracker
	): void {
		if (this.variable) {
			this.variable.deoptimizeArgumentsOnInteractionAtPath(interaction, path, recursionTracker);
		} else if (!this.isUndefined) {
			if (path.length < MAX_PATH_DEPTH) {
				this.object.deoptimizeArgumentsOnInteractionAtPath(
					interaction,
					this.propertyKey === UnknownKey ? UNKNOWN_PATH : [this.propertyKey, ...path],
					recursionTracker
				);
			} else {
				deoptimizeInteraction(interaction);
			}
		}
	}

	deoptimizeAssignment(destructuredInitPath: ObjectPath, init: ExpressionEntity) {
		this.deoptimizePath(EMPTY_PATH);
		init.deoptimizePath([...destructuredInitPath, UnknownKey]);
	}

	deoptimizeCache(): void {
		if (this.propertyKey === this.dynamicPropertyKey) return;
		const { expressionsToBeDeoptimized, object } = this;
		this.expressionsToBeDeoptimized = EMPTY_ARRAY as unknown as DeoptimizableEntity[];
		this.dynamicPropertyKey = this.propertyKey;
		object.deoptimizePath(UNKNOWN_PATH);
		if (this.included) {
			object.includePath(UNKNOWN_PATH, createInclusionContext());
		}
		for (const expression of expressionsToBeDeoptimized) {
			expression.deoptimizeCache();
		}
	}

	deoptimizePath(path: ObjectPath): void {
		if (path.length === 0) this.disallowNamespaceReassignment();
		if (this.variable) {
			this.variable.deoptimizePath(path);
		} else if (!this.isUndefined) {
			const { propertyKey } = this;
			this.object.deoptimizePath([
				propertyKey === UnknownKey ? UnknownNonAccessorKey : propertyKey,
				...(path.length < MAX_PATH_DEPTH
					? path
					: [...path.slice(0, MAX_PATH_DEPTH), UnknownKey as ObjectPathKey])
			]);
		}
	}

	getLiteralValueAtPath(
		path: ObjectPath,
		recursionTracker: EntityPathTracker,
		origin: DeoptimizableEntity
	): LiteralValueOrUnknown {
		if (this.variable) {
			return this.variable.getLiteralValueAtPath(path, recursionTracker, origin);
		}
		if (this.isUndefined) {
			return undefined;
		}
		const propertyKey = this.getDynamicPropertyKey();
		if (propertyKey !== UnknownKey && path.length < MAX_PATH_DEPTH) {
			if (propertyKey !== this.propertyKey) this.expressionsToBeDeoptimized.push(origin);
			return this.object.getLiteralValueAtPath([propertyKey, ...path], recursionTracker, origin);
		}
		return UnknownValue;
	}

	getLiteralValueAtPathAsChainElement(
		path: ObjectPath,
		recursionTracker: EntityPathTracker,
		origin: DeoptimizableEntity
	): LiteralValueOrUnknown | SkippedChain {
		if (this.variable) {
			return this.variable.getLiteralValueAtPath(path, recursionTracker, origin);
		}
		if (this.isUndefined) {
			return undefined;
		}
		return getChainElementLiteralValueAtPath(this, this.object, path, recursionTracker, origin);
	}

	getReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		interaction: NodeInteractionCalled,
		recursionTracker: EntityPathTracker,
		origin: DeoptimizableEntity
	): [expression: ExpressionEntity, isPure: boolean] {
		if (this.variable) {
			return this.variable.getReturnExpressionWhenCalledAtPath(
				path,
				interaction,
				recursionTracker,
				origin
			);
		}
		if (this.isUndefined) {
			return [UNDEFINED_EXPRESSION, false];
		}
		const propertyKey = this.getDynamicPropertyKey();
		if (propertyKey !== UnknownKey && path.length < MAX_PATH_DEPTH) {
			if (propertyKey !== this.propertyKey) this.expressionsToBeDeoptimized.push(origin);
			return this.object.getReturnExpressionWhenCalledAtPath(
				[propertyKey, ...path],
				interaction,
				recursionTracker,
				origin
			);
		}
		return UNKNOWN_RETURN_EXPRESSION;
	}

	hasEffects(context: HasEffectsContext): boolean {
		if (!this.deoptimized) this.applyDeoptimizations();
		return (
			this.property.hasEffects(context) ||
			this.object.hasEffects(context) ||
			this.hasAccessEffect(context)
		);
	}

	hasEffectsAsChainElement(context: HasEffectsContext): boolean | SkippedChain {
		if (this.variable || this.isUndefined) return this.hasEffects(context);
		const objectHasEffects =
			'hasEffectsAsChainElement' in this.object
				? (this.object as ChainElement).hasEffectsAsChainElement(context)
				: this.object.hasEffects(context);
		if (objectHasEffects === IS_SKIPPED_CHAIN) return IS_SKIPPED_CHAIN;
		if (
			this.optional &&
			this.object.getLiteralValueAtPath(EMPTY_PATH, SHARED_RECURSION_TRACKER, this) == null
		) {
			return objectHasEffects || IS_SKIPPED_CHAIN;
		}
		// We only apply deoptimizations lazily once we know we are not skipping
		if (!this.deoptimized) this.applyDeoptimizations();
		return objectHasEffects || this.property.hasEffects(context) || this.hasAccessEffect(context);
	}

	hasEffectsAsAssignmentTarget(context: HasEffectsContext, checkAccess: boolean): boolean {
		if (checkAccess && !this.deoptimized) this.applyDeoptimizations();
		if (!this.assignmentDeoptimized) this.applyAssignmentDeoptimization();
		return (
			this.property.hasEffects(context) ||
			this.object.hasEffects(context) ||
			(checkAccess && this.hasAccessEffect(context)) ||
			this.hasEffectsOnInteractionAtPath(EMPTY_PATH, this.assignmentInteraction, context)
		);
	}

	hasEffectsOnInteractionAtPath(
		path: ObjectPath,
		interaction: NodeInteraction,
		context: HasEffectsContext
	): boolean {
		if (this.variable) {
			return this.variable.hasEffectsOnInteractionAtPath(path, interaction, context);
		}
		if (this.isUndefined) {
			return true;
		}
		if (path.length < MAX_PATH_DEPTH) {
			return this.object.hasEffectsOnInteractionAtPath(
				[this.getDynamicPropertyKey(), ...path],
				interaction,
				context
			);
		}
		return true;
	}

	hasEffectsWhenDestructuring(
		context: HasEffectsContext,
		destructuredInitPath: ObjectPath,
		init: ExpressionEntity
	): boolean {
		return (
			destructuredInitPath.length > 0 &&
			init.hasEffectsOnInteractionAtPath(
				destructuredInitPath,
				NODE_INTERACTION_UNKNOWN_ACCESS,
				context
			)
		);
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren): void {
		if (!this.included) this.includeNode(context);
		this.object.include(context, includeChildrenRecursively);
		this.property.include(context, includeChildrenRecursively);
	}

	includeNode(context: InclusionContext) {
		this.included = true;
		if (!this.deoptimized) this.applyDeoptimizations();
		if (this.variable) {
			this.scope.context.includeVariableInModule(this.variable, EMPTY_PATH, context);
		} else if (!this.isUndefined) {
			this.object.includePath([this.propertyKey], context);
		}
	}

	includePath(path: ObjectPath, context: InclusionContext): void {
		if (!this.included) this.includeNode(context);
		if (this.variable) {
			this.variable?.includePath(path, context);
		} else if (!this.isUndefined) {
			this.object.includePath(
				[
					this.propertyKey,
					...(path.length < MAX_PATH_DEPTH
						? path
						: [...path.slice(0, MAX_PATH_DEPTH), UnknownKey as ObjectPathKey])
				],
				context
			);
		}
	}

	includeAsAssignmentTarget(
		context: InclusionContext,
		includeChildrenRecursively: IncludeChildren,
		deoptimizeAccess: boolean
	): void {
		if (!this.assignmentDeoptimized) this.applyAssignmentDeoptimization();
		if (deoptimizeAccess) {
			this.include(context, includeChildrenRecursively);
		} else {
			if (!this.included) this.includeNode(context);
			this.object.include(context, includeChildrenRecursively);
			this.property.include(context, includeChildrenRecursively);
		}
	}

	includeCallArguments(context: InclusionContext, interaction: NodeInteractionCalled): void {
		if (this.variable) {
			this.variable.includeCallArguments(context, interaction);
		} else {
			super.includeCallArguments(context, interaction);
		}
	}

	includeDestructuredIfNecessary(
		context: InclusionContext,
		destructuredInitPath: ObjectPath,
		init: ExpressionEntity
	): boolean {
		if (
			(this.included ||=
				destructuredInitPath.length > 0 &&
				!context.brokenFlow &&
				init.hasEffectsOnInteractionAtPath(
					destructuredInitPath,
					NODE_INTERACTION_UNKNOWN_ACCESS,
					createHasEffectsContext()
				))
		) {
			init.include(context, false);
			return true;
		}
		return false;
	}

	initialise(): void {
		super.initialise();
		this.dynamicPropertyKey = getResolvablePropertyKey(this);
		this.propertyKey = this.dynamicPropertyKey === null ? UnknownKey : this.dynamicPropertyKey;
		this.accessInteraction = { args: [this.object], type: INTERACTION_ACCESSED };
	}

	render(
		code: MagicString,
		options: RenderOptions,
		{
			renderedParentType,
			isCalleeOfRenderedParent,
			renderedSurroundingElement
		}: NodeRenderOptions = BLANK
	): void {
		if (this.variable || this.isUndefined) {
			const {
				snippets: { getPropertyAccess }
			} = options;
			let replacement = this.variable ? this.variable.getName(getPropertyAccess) : 'undefined';
			if (renderedParentType && isCalleeOfRenderedParent) replacement = '0, ' + replacement;
			code.overwrite(this.start, this.end, replacement!, {
				contentOnly: true,
				storeName: true
			});
		} else {
			if (renderedParentType && isCalleeOfRenderedParent) {
				code.appendRight(this.start, '0, ');
			}
			this.object.render(code, options, { renderedSurroundingElement });
			this.property.render(code, options);
		}
	}

	setAssignedValue(value: ExpressionEntity) {
		this.assignmentInteraction = {
			args: [this.object, value],
			type: INTERACTION_ASSIGNED
		};
	}

	applyDeoptimizations() {
		this.deoptimized = true;
		const { propertyReadSideEffects } = this.scope.context.options
			.treeshake as NormalizedTreeshakingOptions;
		if (
			// Namespaces are not bound and should not be deoptimized
			this.bound &&
			propertyReadSideEffects &&
			!(this.variable || this.isUndefined)
		) {
			this.object.deoptimizeArgumentsOnInteractionAtPath(
				this.accessInteraction,
				[this.propertyKey],
				SHARED_RECURSION_TRACKER
			);
			this.scope.context.requestTreeshakingPass();
		}
		if (this.variable) {
			this.variable.addUsedPlace(this);
			this.scope.context.requestTreeshakingPass();
		}
	}

	private applyAssignmentDeoptimization(): void {
		this.assignmentDeoptimized = true;
		const { propertyReadSideEffects } = this.scope.context.options
			.treeshake as NormalizedTreeshakingOptions;
		if (
			// Namespaces are not bound and should not be deoptimized
			this.bound &&
			propertyReadSideEffects &&
			!(this.variable || this.isUndefined)
		) {
			this.object.deoptimizeArgumentsOnInteractionAtPath(
				this.assignmentInteraction,
				[this.propertyKey],
				SHARED_RECURSION_TRACKER
			);
			this.scope.context.requestTreeshakingPass();
		}
	}

	private disallowNamespaceReassignment() {
		if (this.object instanceof Identifier) {
			const variable = this.scope.findVariable(this.object.name);
			if (variable.isNamespace) {
				if (this.variable) {
					this.scope.context.includeVariableInModule(
						this.variable,
						UNKNOWN_PATH,
						createInclusionContext()
					);
				}
				this.scope.context.log(
					LOGLEVEL_WARN,
					logIllegalImportReassignment(this.object.name, this.scope.context.module.id),
					this.start
				);
			}
		}
	}

	private getDynamicPropertyKey(): ObjectPathKey {
		if (this.dynamicPropertyKey === null) {
			this.dynamicPropertyKey = this.propertyKey;
			const value = this.property.getLiteralValueAtPath(EMPTY_PATH, SHARED_RECURSION_TRACKER, this);
			return (this.dynamicPropertyKey =
				value === SymbolToStringTag
					? value
					: typeof value === 'symbol'
						? UnknownKey
						: String(value));
		}
		return this.dynamicPropertyKey;
	}

	private hasAccessEffect(context: HasEffectsContext) {
		const { propertyReadSideEffects } = this.scope.context.options
			.treeshake as NormalizedTreeshakingOptions;
		return (
			!(this.variable || this.isUndefined) &&
			propertyReadSideEffects &&
			(propertyReadSideEffects === 'always' ||
				this.object.hasEffectsOnInteractionAtPath(
					[this.getDynamicPropertyKey()],
					this.accessInteraction,
					context
				))
		);
	}
}

function resolveNamespaceVariables(
	baseVariable: Variable,
	path: PathWithPositions,
	astContext: AstContext
): Variable | 'undefined' | null {
	if (path.length === 0) return baseVariable;
	if (!baseVariable.isNamespace || baseVariable instanceof ExternalVariable) return null;
	const exportName = path[0].key;
	const variable = (baseVariable as NamespaceVariable).context.traceExport(exportName);
	if (!variable) {
		if (path.length === 1) {
			const fileName = (baseVariable as NamespaceVariable).context.fileName;
			astContext.log(
				LOGLEVEL_WARN,
				logMissingExport(exportName, astContext.module.id, fileName),
				path[0].pos
			);
			return 'undefined';
		}
		return null;
	}
	return resolveNamespaceVariables(variable, path.slice(1), astContext);
}
