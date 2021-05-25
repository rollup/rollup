import MagicString from 'magic-string';
import { NormalizedTreeshakingOptions } from '../../rollup/types';
import { BLANK } from '../../utils/blank';
import relativeId from '../../utils/relativeId';
import { NodeRenderOptions, RenderOptions } from '../../utils/renderHelpers';
import { CallOptions } from '../CallOptions';
import { DeoptimizableEntity } from '../DeoptimizableEntity';
import { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import { EVENT_ACCESSED, EVENT_ASSIGNED, NodeEvent } from '../NodeEvents';
import {
	EMPTY_PATH,
	ObjectPath,
	ObjectPathKey,
	PathTracker,
	SHARED_RECURSION_TRACKER,
	UNKNOWN_PATH,
	UnknownKey
} from '../utils/PathTracker';
import ExternalVariable from '../variables/ExternalVariable';
import NamespaceVariable from '../variables/NamespaceVariable';
import Variable from '../variables/Variable';
import AssignmentExpression from './AssignmentExpression';
import Identifier from './Identifier';
import Literal from './Literal';
import * as NodeType from './NodeType';
import PrivateIdentifier from './PrivateIdentifier';
import SpreadElement from './SpreadElement';
import Super from './Super';
import {
	ExpressionEntity,
	LiteralValueOrUnknown,
	UNKNOWN_EXPRESSION,
	UnknownValue
} from './shared/Expression';
import { ExpressionNode, IncludeChildren, NodeBase } from './shared/Node';

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
	computed!: boolean;
	object!: ExpressionNode | Super;
	optional!: boolean;
	property!: ExpressionNode | PrivateIdentifier;
	propertyKey!: ObjectPathKey | null;
	type!: NodeType.tMemberExpression;
	variable: Variable | null = null;
	protected deoptimized = false;
	private bound = false;
	private expressionsToBeDeoptimized: DeoptimizableEntity[] = [];
	private replacement: string | null = null;

	bind(): void {
		this.bound = true;
		const path = getPathIfNotComputed(this);
		const baseVariable = path && this.scope.findVariable(path[0].key);
		if (baseVariable && baseVariable.isNamespace) {
			const resolvedVariable = this.resolveNamespaceVariables(baseVariable, path!.slice(1));
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
			this.object.deoptimizePath([this.getPropertyKey(), ...path]);
		}
	}

	deoptimizeThisOnEventAtPath(
		event: NodeEvent,
		path: ObjectPath,
		thisParameter: ExpressionEntity,
		recursionTracker: PathTracker
	): void {
		if (this.variable) {
			this.variable.deoptimizeThisOnEventAtPath(event, path, thisParameter, recursionTracker);
		} else if (!this.replacement) {
			this.object.deoptimizeThisOnEventAtPath(
				event,
				[this.getPropertyKey(), ...path],
				thisParameter,
				recursionTracker
			);
		}
	}

	getLiteralValueAtPath(
		path: ObjectPath,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): LiteralValueOrUnknown {
		if (this.variable !== null) {
			return this.variable.getLiteralValueAtPath(path, recursionTracker, origin);
		}
		if (this.replacement) {
			return UnknownValue;
		}
		this.expressionsToBeDeoptimized.push(origin);
		return this.object.getLiteralValueAtPath(
			[this.getPropertyKey(), ...path],
			recursionTracker,
			origin
		);
	}

	getReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): ExpressionEntity {
		if (this.variable !== null) {
			return this.variable.getReturnExpressionWhenCalledAtPath(
				path,
				callOptions,
				recursionTracker,
				origin
			);
		}
		if (this.replacement) {
			return UNKNOWN_EXPRESSION;
		}
		this.expressionsToBeDeoptimized.push(origin);
		return this.object.getReturnExpressionWhenCalledAtPath(
			[this.getPropertyKey(), ...path],
			callOptions,
			recursionTracker,
			origin
		);
	}

	hasEffects(context: HasEffectsContext): boolean {
		if (!this.deoptimized) this.applyDeoptimizations();
		const { propertyReadSideEffects } = this.context.options
			.treeshake as NormalizedTreeshakingOptions;
		return (
			this.property.hasEffects(context) ||
			this.object.hasEffects(context) ||
			// Assignments do not access the property before assigning
			(!(
				this.variable ||
				this.replacement ||
				(this.parent instanceof AssignmentExpression && this.parent.operator === '=')
			) &&
				propertyReadSideEffects &&
				(propertyReadSideEffects === 'always' ||
					this.object.hasEffectsWhenAccessedAtPath([this.getPropertyKey()], context)))
		);
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, context: HasEffectsContext): boolean {
		if (this.variable !== null) {
			return this.variable.hasEffectsWhenAccessedAtPath(path, context);
		}
		if (this.replacement) {
			return true;
		}
		return this.object.hasEffectsWhenAccessedAtPath([this.getPropertyKey(), ...path], context);
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, context: HasEffectsContext): boolean {
		if (this.variable !== null) {
			return this.variable.hasEffectsWhenAssignedAtPath(path, context);
		}
		if (this.replacement) {
			return true;
		}
		return this.object.hasEffectsWhenAssignedAtPath([this.getPropertyKey(), ...path], context);
	}

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		context: HasEffectsContext
	): boolean {
		if (this.variable !== null) {
			return this.variable.hasEffectsWhenCalledAtPath(path, callOptions, context);
		}
		if (this.replacement) {
			return true;
		}
		return this.object.hasEffectsWhenCalledAtPath(
			[this.getPropertyKey(), ...path],
			callOptions,
			context
		);
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren): void {
		if (!this.deoptimized) this.applyDeoptimizations();
		if (!this.included) {
			this.included = true;
			if (this.variable !== null) {
				this.context.includeVariableInModule(this.variable);
			}
		}
		this.object.include(context, includeChildrenRecursively);
		this.property.include(context, includeChildrenRecursively);
	}

	includeCallArguments(context: InclusionContext, args: (ExpressionNode | SpreadElement)[]): void {
		if (this.variable) {
			this.variable.includeCallArguments(context, args);
		} else {
			super.includeCallArguments(context, args);
		}
	}

	initialise(): void {
		this.propertyKey = getResolvablePropertyKey(this);
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
		const isCalleeOfDifferentParent =
			renderedParentType === NodeType.CallExpression && isCalleeOfRenderedParent;
		if (this.variable || this.replacement) {
			let replacement = this.variable ? this.variable.getName() : this.replacement;
			if (isCalleeOfDifferentParent) replacement = '0, ' + replacement;
			code.overwrite(this.start, this.end, replacement!, {
				contentOnly: true,
				storeName: true
			});
		} else {
			if (isCalleeOfDifferentParent) {
				code.appendRight(this.start, '0, ');
			}
			const surroundingElement = renderedParentType || renderedSurroundingElement;
			this.object.render(
				code,
				options,
				surroundingElement ? { renderedSurroundingElement: surroundingElement } : BLANK
			);
			this.property.render(code, options);
		}
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
			// Regular Assignments do not access the property before assigning
			if (!(this.parent instanceof AssignmentExpression && this.parent.operator === '=')) {
				this.object.deoptimizeThisOnEventAtPath(
					EVENT_ACCESSED,
					[this.propertyKey!],
					this.object,
					SHARED_RECURSION_TRACKER
				);
			}
			if (this.parent instanceof AssignmentExpression) {
				this.object.deoptimizeThisOnEventAtPath(
					EVENT_ASSIGNED,
					[this.propertyKey!],
					this.object,
					SHARED_RECURSION_TRACKER
				);
			}
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
			return (this.propertyKey = value === UnknownValue ? UnknownKey : String(value));
		}
		return this.propertyKey;
	}

	private resolveNamespaceVariables(
		baseVariable: Variable,
		path: PathWithPositions
	): Variable | string | null {
		if (path.length === 0) return baseVariable;
		if (!baseVariable.isNamespace || baseVariable instanceof ExternalVariable) return null;
		const exportName = path[0].key;
		const variable = (baseVariable as NamespaceVariable).context.traceExport(exportName);
		if (!variable) {
			const fileName = (baseVariable as NamespaceVariable).context.fileName;
			this.context.warn(
				{
					code: 'MISSING_EXPORT',
					exporter: relativeId(fileName),
					importer: relativeId(this.context.fileName),
					message: `'${exportName}' is not exported by '${relativeId(fileName)}'`,
					missing: exportName,
					url: `https://rollupjs.org/guide/en/#error-name-is-not-exported-by-module`
				},
				path[0].pos
			);
			return 'undefined';
		}
		return this.resolveNamespaceVariables(variable, path.slice(1));
	}
}
