import MagicString from 'magic-string';
import { BLANK } from '../../utils/blank';
import relativeId from '../../utils/relativeId';
import { NodeRenderOptions, RenderOptions } from '../../utils/renderHelpers';
import CallOptions from '../CallOptions';
import { DeoptimizableEntity } from '../DeoptimizableEntity';
import { ExecutionPathOptions } from '../ExecutionPathOptions';
import {
	EMPTY_IMMUTABLE_TRACKER,
	ImmutableEntityPathTracker
} from '../utils/ImmutableEntityPathTracker';
import {
	EMPTY_PATH,
	LiteralValueOrUnknown,
	ObjectPath,
	ObjectPathKey,
	UNKNOWN_KEY,
	UNKNOWN_VALUE
} from '../values';
import ExternalVariable from '../variables/ExternalVariable';
import NamespaceVariable from '../variables/NamespaceVariable';
import Variable from '../variables/Variable';
import Identifier from './Identifier';
import Literal from './Literal';
import * as NodeType from './NodeType';
import { ExpressionNode, IncludeChildren, NodeBase } from './shared/Node';
import { PatternNode } from './shared/Pattern';
import SpreadElement from './SpreadElement';

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
	object!: ExpressionNode;
	property!: ExpressionNode;
	propertyKey!: ObjectPathKey | null;
	type!: NodeType.tMemberExpression;
	variable: Variable | null = null;

	private bound = false;
	private expressionsToBeDeoptimized: DeoptimizableEntity[] = [];
	private replacement: string | null = null;

	addExportedVariables(): void {}

	bind() {
		if (this.bound) return;
		this.bound = true;
		const path = getPathIfNotComputed(this);
		const baseVariable = path && this.scope.findVariable(path[0].key);
		if (baseVariable && baseVariable.isNamespace) {
			const resolvedVariable = this.resolveNamespaceVariables(
				baseVariable,
				(path as PathWithPositions).slice(1)
			);
			if (!resolvedVariable) {
				super.bind();
			} else if (typeof resolvedVariable === 'string') {
				this.replacement = resolvedVariable;
			} else {
				if (resolvedVariable instanceof ExternalVariable && resolvedVariable.module) {
					resolvedVariable.module.suggestName((path as PathWithPositions)[0].key);
				}
				this.variable = resolvedVariable;
				this.scope.addNamespaceMemberAccess(
					getStringFromPath(path as PathWithPositions),
					resolvedVariable
				);
			}
		} else {
			super.bind();
			if (this.propertyKey === null) this.analysePropertyKey();
		}
	}

	deoptimizeCache() {
		for (const expression of this.expressionsToBeDeoptimized) {
			expression.deoptimizeCache();
		}
	}

	deoptimizePath(path: ObjectPath) {
		if (!this.bound) this.bind();
		if (path.length === 0) this.disallowNamespaceReassignment();
		if (this.variable) {
			this.variable.deoptimizePath(path);
		} else {
			if (this.propertyKey === null) this.analysePropertyKey();
			this.object.deoptimizePath([this.propertyKey as ObjectPathKey, ...path]);
		}
	}

	getLiteralValueAtPath(
		path: ObjectPath,
		recursionTracker: ImmutableEntityPathTracker,
		origin: DeoptimizableEntity
	): LiteralValueOrUnknown {
		if (!this.bound) this.bind();
		if (this.variable !== null) {
			return this.variable.getLiteralValueAtPath(path, recursionTracker, origin);
		}
		if (this.propertyKey === null) this.analysePropertyKey();
		this.expressionsToBeDeoptimized.push(origin);
		return this.object.getLiteralValueAtPath(
			[this.propertyKey as ObjectPathKey, ...path],
			recursionTracker,
			origin
		);
	}

	getReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		recursionTracker: ImmutableEntityPathTracker,
		origin: DeoptimizableEntity
	) {
		if (!this.bound) this.bind();
		if (this.variable !== null) {
			return this.variable.getReturnExpressionWhenCalledAtPath(path, recursionTracker, origin);
		}
		if (this.propertyKey === null) this.analysePropertyKey();
		this.expressionsToBeDeoptimized.push(origin);
		return this.object.getReturnExpressionWhenCalledAtPath(
			[this.propertyKey as ObjectPathKey, ...path],
			recursionTracker,
			origin
		);
	}

	hasEffects(options: ExecutionPathOptions): boolean {
		return (
			this.property.hasEffects(options) ||
			this.object.hasEffects(options) ||
			(this.context.propertyReadSideEffects &&
				this.object.hasEffectsWhenAccessedAtPath([this.propertyKey as ObjectPathKey], options))
		);
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, options: ExecutionPathOptions): boolean {
		if (path.length === 0) {
			return false;
		}
		if (this.variable !== null) {
			return this.variable.hasEffectsWhenAccessedAtPath(path, options);
		}
		return this.object.hasEffectsWhenAccessedAtPath(
			[this.propertyKey as ObjectPathKey, ...path],
			options
		);
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, options: ExecutionPathOptions): boolean {
		if (this.variable !== null) {
			return this.variable.hasEffectsWhenAssignedAtPath(path, options);
		}
		return this.object.hasEffectsWhenAssignedAtPath(
			[this.propertyKey as ObjectPathKey, ...path],
			options
		);
	}

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		options: ExecutionPathOptions
	): boolean {
		if (this.variable !== null) {
			return this.variable.hasEffectsWhenCalledAtPath(path, callOptions, options);
		}
		return this.object.hasEffectsWhenCalledAtPath(
			[this.propertyKey as ObjectPathKey, ...path],
			callOptions,
			options
		);
	}

	include(includeChildrenRecursively: IncludeChildren) {
		if (!this.included) {
			this.included = true;
			if (this.variable !== null) {
				this.context.includeVariable(this.variable);
			}
		}
		this.object.include(includeChildrenRecursively);
		this.property.include(includeChildrenRecursively);
	}

	includeCallArguments(args: (ExpressionNode | SpreadElement)[]): void {
		if (this.variable) {
			this.variable.includeCallArguments(args);
		} else {
			super.includeCallArguments(args);
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
			code.overwrite(this.start, this.end, replacement as string, {
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

	private analysePropertyKey() {
		this.propertyKey = UNKNOWN_KEY;
		const value = this.property.getLiteralValueAtPath(EMPTY_PATH, EMPTY_IMMUTABLE_TRACKER, this);
		this.propertyKey = value === UNKNOWN_VALUE ? UNKNOWN_KEY : String(value);
	}

	private disallowNamespaceReassignment() {
		if (
			this.object instanceof Identifier &&
			this.scope.findVariable(this.object.name).isNamespace
		) {
			this.context.error(
				{
					code: 'ILLEGAL_NAMESPACE_REASSIGNMENT',
					message: `Illegal reassignment to import '${this.object.name}'`
				},
				this.start
			);
		}
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
					url: `https://rollupjs.org/guide/en/#error-name-is-not-exported-by-module-`
				},
				path[0].pos
			);
			return 'undefined';
		}
		return this.resolveNamespaceVariables(variable, path.slice(1));
	}
}
