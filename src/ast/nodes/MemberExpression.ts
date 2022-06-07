import type MagicString from 'magic-string';
import { AstContext } from '../../Module';
import type { NormalizedTreeshakingOptions } from '../../rollup/types';
import { BLANK } from '../../utils/blank';
import relativeId from '../../utils/relativeId';
import type { NodeRenderOptions, RenderOptions } from '../../utils/renderHelpers';
import type { DeoptimizableEntity } from '../DeoptimizableEntity';
import type { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import {
	INTERACTION_ACCESSED,
	INTERACTION_ASSIGNED,
	NodeInteraction,
	NodeInteractionAccessed,
	NodeInteractionAssigned,
	NodeInteractionCalled,
	NodeInteractionWithThisArg
} from '../NodeInteractions';
import {
	EMPTY_PATH,
	type ObjectPath,
	type ObjectPathKey,
	type PathTracker,
	SHARED_RECURSION_TRACKER,
	UNKNOWN_PATH,
	UnknownKey,
	UnknownNonAccessorKey
} from '../utils/PathTracker';
import ExternalVariable from '../variables/ExternalVariable';
import type NamespaceVariable from '../variables/NamespaceVariable';
import type Variable from '../variables/Variable';
import Identifier from './Identifier';
import Literal from './Literal';
import type * as NodeType from './NodeType';
import type PrivateIdentifier from './PrivateIdentifier';
import type SpreadElement from './SpreadElement';
import type Super from './Super';
import {
	type ExpressionEntity,
	type LiteralValueOrUnknown,
	UNKNOWN_EXPRESSION,
	UnknownValue
} from './shared/Expression';
import { type ExpressionNode, type IncludeChildren, NodeBase } from './shared/Node';

// To avoid infinite recursions
const MAX_PATH_DEPTH = 7;

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

export default class MemberExpression extends NodeBase implements DeoptimizableEntity {
	declare computed: boolean;
	declare object: ExpressionNode | Super;
	declare optional: boolean;
	declare property: ExpressionNode | PrivateIdentifier;
	declare propertyKey: ObjectPathKey | null;
	declare type: NodeType.tMemberExpression;
	variable: Variable | null = null;
	protected declare assignmentInteraction: NodeInteractionAssigned & { thisArg: ExpressionEntity };
	private declare accessInteraction: NodeInteractionAccessed & { thisArg: ExpressionEntity };
	private assignmentDeoptimized = false;
	private bound = false;
	private expressionsToBeDeoptimized: DeoptimizableEntity[] = [];
	private replacement: string | null = null;

	bind(): void {
		this.bound = true;
		const path = getPathIfNotComputed(this);
		const baseVariable = path && this.scope.findVariable(path[0].key);
		if (baseVariable && baseVariable.isNamespace) {
			const resolvedVariable = resolveNamespaceVariables(
				baseVariable,
				path!.slice(1),
				this.context
			);
			if (!resolvedVariable) {
				super.bind();
			} else if (typeof resolvedVariable === 'string') {
				this.replacement = resolvedVariable;
			} else {
				this.variable = resolvedVariable;
				this.scope.addNamespaceMemberAccess(getStringFromPath(path!), resolvedVariable);
			}
		} else {
			super.bind();
		}
	}

	deoptimizeCache(): void {
		const expressionsToBeDeoptimized = this.expressionsToBeDeoptimized;
		this.expressionsToBeDeoptimized = [];
		this.propertyKey = UnknownKey;
		this.object.deoptimizePath(UNKNOWN_PATH);
		for (const expression of expressionsToBeDeoptimized) {
			expression.deoptimizeCache();
		}
	}

	deoptimizePath(path: ObjectPath): void {
		if (path.length === 0) this.disallowNamespaceReassignment();
		if (this.variable) {
			this.variable.deoptimizePath(path);
		} else if (!this.replacement) {
			if (path.length < MAX_PATH_DEPTH) {
				const propertyKey = this.getPropertyKey();
				this.object.deoptimizePath([
					propertyKey === UnknownKey ? UnknownNonAccessorKey : propertyKey,
					...path
				]);
			}
		}
	}

	deoptimizeThisOnInteractionAtPath(
		interaction: NodeInteractionWithThisArg,
		path: ObjectPath,
		recursionTracker: PathTracker
	): void {
		if (this.variable) {
			this.variable.deoptimizeThisOnInteractionAtPath(interaction, path, recursionTracker);
		} else if (!this.replacement) {
			if (path.length < MAX_PATH_DEPTH) {
				this.object.deoptimizeThisOnInteractionAtPath(
					interaction,
					[this.getPropertyKey(), ...path],
					recursionTracker
				);
			} else {
				interaction.thisArg.deoptimizePath(UNKNOWN_PATH);
			}
		}
	}

	getLiteralValueAtPath(
		path: ObjectPath,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): LiteralValueOrUnknown {
		if (this.variable) {
			return this.variable.getLiteralValueAtPath(path, recursionTracker, origin);
		}
		if (this.replacement) {
			return UnknownValue;
		}
		this.expressionsToBeDeoptimized.push(origin);
		if (path.length < MAX_PATH_DEPTH) {
			return this.object.getLiteralValueAtPath(
				[this.getPropertyKey(), ...path],
				recursionTracker,
				origin
			);
		}
		return UnknownValue;
	}

	getReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		interaction: NodeInteractionCalled,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): ExpressionEntity {
		if (this.variable) {
			return this.variable.getReturnExpressionWhenCalledAtPath(
				path,
				interaction,
				recursionTracker,
				origin
			);
		}
		if (this.replacement) {
			return UNKNOWN_EXPRESSION;
		}
		this.expressionsToBeDeoptimized.push(origin);
		if (path.length < MAX_PATH_DEPTH) {
			return this.object.getReturnExpressionWhenCalledAtPath(
				[this.getPropertyKey(), ...path],
				interaction,
				recursionTracker,
				origin
			);
		}
		return UNKNOWN_EXPRESSION;
	}

	hasEffects(context: HasEffectsContext): boolean {
		if (!this.deoptimized) this.applyDeoptimizations();
		return (
			this.property.hasEffects(context) ||
			this.object.hasEffects(context) ||
			this.hasAccessEffect(context)
		);
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
		if (this.replacement) {
			return true;
		}
		if (path.length < MAX_PATH_DEPTH) {
			return this.object.hasEffectsOnInteractionAtPath(
				[this.getPropertyKey(), ...path],
				interaction,
				context
			);
		}
		return true;
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren): void {
		if (!this.deoptimized) this.applyDeoptimizations();
		this.includeProperties(context, includeChildrenRecursively);
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
			this.includeProperties(context, includeChildrenRecursively);
		}
	}

	includeCallArguments(
		context: InclusionContext,
		args: readonly (ExpressionEntity | SpreadElement)[]
	): void {
		if (this.variable) {
			this.variable.includeCallArguments(context, args);
		} else {
			super.includeCallArguments(context, args);
		}
	}

	initialise(): void {
		this.propertyKey = getResolvablePropertyKey(this);
		this.accessInteraction = { thisArg: this.object, type: INTERACTION_ACCESSED };
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
		if (this.variable || this.replacement) {
			const {
				snippets: { getPropertyAccess }
			} = options;
			let replacement = this.variable ? this.variable.getName(getPropertyAccess) : this.replacement;
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
			args: [value],
			thisArg: this.object,
			type: INTERACTION_ASSIGNED
		};
	}

	protected applyDeoptimizations(): void {
		this.deoptimized = true;
		const { propertyReadSideEffects } = this.context.options
			.treeshake as NormalizedTreeshakingOptions;
		if (
			// Namespaces are not bound and should not be deoptimized
			this.bound &&
			propertyReadSideEffects &&
			!(this.variable || this.replacement)
		) {
			const propertyKey = this.getPropertyKey();
			this.object.deoptimizeThisOnInteractionAtPath(
				this.accessInteraction,
				[propertyKey],
				SHARED_RECURSION_TRACKER
			);
			this.context.requestTreeshakingPass();
		}
	}

	private applyAssignmentDeoptimization(): void {
		this.assignmentDeoptimized = true;
		const { propertyReadSideEffects } = this.context.options
			.treeshake as NormalizedTreeshakingOptions;
		if (
			// Namespaces are not bound and should not be deoptimized
			this.bound &&
			propertyReadSideEffects &&
			!(this.variable || this.replacement)
		) {
			this.object.deoptimizeThisOnInteractionAtPath(
				this.assignmentInteraction,
				[this.getPropertyKey()],
				SHARED_RECURSION_TRACKER
			);
			this.context.requestTreeshakingPass();
		}
	}

	private disallowNamespaceReassignment() {
		if (this.object instanceof Identifier) {
			const variable = this.scope.findVariable(this.object.name);
			if (variable.isNamespace) {
				if (this.variable) {
					this.context.includeVariableInModule(this.variable);
				}
				this.context.warn(
					{
						code: 'ILLEGAL_NAMESPACE_REASSIGNMENT',
						message: `Illegal reassignment to import '${this.object.name}'`
					},
					this.start
				);
			}
		}
	}

	private getPropertyKey(): ObjectPathKey {
		if (this.propertyKey === null) {
			this.propertyKey = UnknownKey;
			const value = this.property.getLiteralValueAtPath(EMPTY_PATH, SHARED_RECURSION_TRACKER, this);
			return (this.propertyKey = typeof value === 'symbol' ? UnknownKey : String(value));
		}
		return this.propertyKey;
	}

	private hasAccessEffect(context: HasEffectsContext) {
		const { propertyReadSideEffects } = this.context.options
			.treeshake as NormalizedTreeshakingOptions;
		return (
			!(this.variable || this.replacement) &&
			propertyReadSideEffects &&
			(propertyReadSideEffects === 'always' ||
				this.object.hasEffectsOnInteractionAtPath(
					[this.getPropertyKey()],
					this.accessInteraction,
					context
				))
		);
	}

	private includeProperties(
		context: InclusionContext,
		includeChildrenRecursively: IncludeChildren
	) {
		if (!this.included) {
			this.included = true;
			if (this.variable) {
				this.context.includeVariableInModule(this.variable);
			}
		}
		this.object.include(context, includeChildrenRecursively);
		this.property.include(context, includeChildrenRecursively);
	}
}

function resolveNamespaceVariables(
	baseVariable: Variable,
	path: PathWithPositions,
	astContext: AstContext
): Variable | string | null {
	if (path.length === 0) return baseVariable;
	if (!baseVariable.isNamespace || baseVariable instanceof ExternalVariable) return null;
	const exportName = path[0].key;
	const variable = (baseVariable as NamespaceVariable).context.traceExport(exportName);
	if (!variable) {
		const fileName = (baseVariable as NamespaceVariable).context.fileName;
		astContext.warn(
			{
				code: 'MISSING_EXPORT',
				exporter: relativeId(fileName),
				importer: relativeId(astContext.fileName),
				message: `'${exportName}' is not exported by '${relativeId(fileName)}'`,
				missing: exportName,
				url: `https://rollupjs.org/guide/en/#error-name-is-not-exported-by-module`
			},
			path[0].pos
		);
		return 'undefined';
	}
	return resolveNamespaceVariables(variable, path.slice(1), astContext);
}
