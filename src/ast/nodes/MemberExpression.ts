import MagicString from 'magic-string';
import { NormalizedTreeshakingOptions } from '../../rollup/types';
import { BLANK } from '../../utils/blank';
import relativeId from '../../utils/relativeId';
import { NodeRenderOptions, RenderOptions } from '../../utils/renderHelpers';
import { CallOptions } from '../CallOptions';
import { DeoptimizableEntity } from '../DeoptimizableEntity';
import { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import {
	EMPTY_PATH,
	ObjectPath,
	ObjectPathKey,
	PathTracker,
	SHARED_RECURSION_TRACKER,
	UnknownKey,
	UNKNOWN_PATH
} from '../utils/PathTracker';
import { LiteralValueOrUnknown, UnknownValue } from '../values';
import ExternalVariable from '../variables/ExternalVariable';
import NamespaceVariable from '../variables/NamespaceVariable';
import Variable from '../variables/Variable';
import Identifier from './Identifier';
import Literal from './Literal';
import * as NodeType from './NodeType';
import { ExpressionNode, IncludeChildren, NodeBase } from './shared/Node';
import { PatternNode } from './shared/Pattern';
import SpreadElement from './SpreadElement';
import Super from './Super';

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

export default class MemberExpression extends NodeBase implements DeoptimizableEntity, PatternNode {
	computed!: boolean;
	object!: ExpressionNode | Super;
	optional!: boolean;
	property!: ExpressionNode;
	propertyKey!: ObjectPathKey | null;
	type!: NodeType.tMemberExpression;
	variable: Variable | null = null;

	private bound = false;
	private expressionsToBeDeoptimized: DeoptimizableEntity[] = [];
	private replacement: string | null = null;
	private wasPathDeoptimizedWhileOptimized = false;

	addExportedVariables(): void {}

	bind() {
		if (this.bound) return;
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
				if (resolvedVariable instanceof ExternalVariable && resolvedVariable.module) {
					resolvedVariable.module.suggestName(path![0].key);
				}
				this.variable = resolvedVariable;
				this.scope.addNamespaceMemberAccess(getStringFromPath(path!), resolvedVariable);
			}
		} else {
			super.bind();
			// ensure the propertyKey is set for the tree-shaking passes
			this.getPropertyKey();
		}
	}

	deoptimizeCache() {
		const expressionsToBeDeoptimized = this.expressionsToBeDeoptimized;
		this.expressionsToBeDeoptimized = [];
		this.propertyKey = UnknownKey;
		if (this.wasPathDeoptimizedWhileOptimized) {
			this.object.deoptimizePath(UNKNOWN_PATH);
		}
		for (const expression of expressionsToBeDeoptimized) {
			expression.deoptimizeCache();
		}
	}

	deoptimizePath(path: ObjectPath) {
		if (!this.bound) this.bind();
		if (path.length === 0) this.disallowNamespaceReassignment();
		if (this.variable) {
			this.variable.deoptimizePath(path);
		} else {
			const propertyKey = this.getPropertyKey();
			if (propertyKey === UnknownKey) {
				this.object.deoptimizePath(UNKNOWN_PATH);
			} else {
				this.wasPathDeoptimizedWhileOptimized = true;
				this.object.deoptimizePath([propertyKey, ...path]);
			}
		}
	}

	getLiteralValueAtPath(
		path: ObjectPath,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): LiteralValueOrUnknown {
		if (!this.bound) this.bind();
		if (this.variable !== null) {
			return this.variable.getLiteralValueAtPath(path, recursionTracker, origin);
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
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	) {
		if (!this.bound) this.bind();
		if (this.variable !== null) {
			return this.variable.getReturnExpressionWhenCalledAtPath(path, recursionTracker, origin);
		}
		this.expressionsToBeDeoptimized.push(origin);
		return this.object.getReturnExpressionWhenCalledAtPath(
			[this.getPropertyKey(), ...path],
			recursionTracker,
			origin
		);
	}

	hasEffects(context: HasEffectsContext): boolean {
		return (
			this.property.hasEffects(context) ||
			this.object.hasEffects(context) ||
			((this.context.options.treeshake as NormalizedTreeshakingOptions).propertyReadSideEffects &&
				this.object.hasEffectsWhenAccessedAtPath([this.propertyKey!], context))
		);
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, context: HasEffectsContext): boolean {
		if (path.length === 0) return false;
		if (this.variable !== null) {
			return this.variable.hasEffectsWhenAccessedAtPath(path, context);
		}
		return this.object.hasEffectsWhenAccessedAtPath([this.propertyKey!, ...path], context);
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, context: HasEffectsContext): boolean {
		if (this.variable !== null) {
			return this.variable.hasEffectsWhenAssignedAtPath(path, context);
		}
		return this.object.hasEffectsWhenAssignedAtPath([this.propertyKey!, ...path], context);
	}

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		context: HasEffectsContext
	): boolean {
		if (this.variable !== null) {
			return this.variable.hasEffectsWhenCalledAtPath(path, callOptions, context);
		}
		return this.object.hasEffectsWhenCalledAtPath(
			[this.propertyKey!, ...path],
			callOptions,
			context
		);
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren) {
		if (!this.included) {
			this.included = true;
			if (this.variable !== null) {
				this.context.includeVariable(this.variable);
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

	initialise() {
		this.propertyKey = getResolvablePropertyKey(this);
	}

	render(
		code: MagicString,
		options: RenderOptions,
		{ renderedParentType, isCalleeOfRenderedParent }: NodeRenderOptions = BLANK
	) {
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
			super.render(code, options);
		}
	}

	private disallowNamespaceReassignment() {
		if (this.object instanceof Identifier) {
			const variable = this.scope.findVariable(this.object.name);
			if (variable.isNamespace) {
				if (this.variable) {
					this.context.includeVariable(this.variable);
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
		if (!baseVariable.isNamespace) return null;
		const exportName = path[0].key;
		const variable =
			baseVariable instanceof ExternalVariable
				? baseVariable.module.getVariableForExportName(exportName)
				: (baseVariable as NamespaceVariable).context.traceExport(exportName);
		if (!variable) {
			const fileName =
				baseVariable instanceof ExternalVariable
					? baseVariable.module.id
					: (baseVariable as NamespaceVariable).context.fileName;
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
