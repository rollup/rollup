import MagicString from 'magic-string';
import { BLANK } from '../../utils/blank';
import relativeId from '../../utils/relativeId';
import { NodeRenderOptions, RenderOptions } from '../../utils/renderHelpers';
import CallOptions from '../CallOptions';
import { ExecutionPathOptions } from '../ExecutionPathOptions';
import { EntityPathTracker } from '../utils/EntityPathTracker';
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
import { ForEachReturnExpressionCallback, SomeReturnExpressionCallback } from './shared/Expression';
import { ExpressionNode, Node, NodeBase } from './shared/Node';

function getPropertyKey(memberExpression: MemberExpression): string | null {
	return memberExpression.computed
		? getComputedPropertyKey(memberExpression.property)
		: (<Identifier>memberExpression.property).name;
}

function getComputedPropertyKey(propertyKey: ExpressionNode): string | null {
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
		if (isMemberExpression(object)) {
			const parentPath = getPathIfNotComputed(object);
			return (
				parentPath && [...parentPath, { key: nextPathKey, pos: memberExpression.property.start }]
			);
		}
	}
	return null;
}

export function isMemberExpression(node: Node): node is MemberExpression {
	return node.type === NodeType.MemberExpression;
}

export default class MemberExpression extends NodeBase {
	type: NodeType.tMemberExpression;
	object: ExpressionNode;
	property: ExpressionNode;
	computed: boolean;

	propertyKey: ObjectPathKey;
	variable: Variable = null;
	private arePropertyReadSideEffectsChecked: boolean;
	private bound: boolean;
	private replacement: string | null;

	bind() {
		if (this.bound) return;
		this.bound = true;
		const path = getPathIfNotComputed(this);
		const baseVariable = path && this.scope.findVariable(path[0].key);
		if (baseVariable && baseVariable.isNamespace) {
			const resolvedVariable = this.resolveNamespaceVariables(baseVariable, path.slice(1));
			if (!resolvedVariable) {
				super.bind();
			} else if (typeof resolvedVariable === 'string') {
				this.replacement = resolvedVariable;
			} else {
				if (resolvedVariable.isExternal && (<ExternalVariable>resolvedVariable).module) {
					(<ExternalVariable>resolvedVariable).module.suggestName(path[0].key);
				}
				this.variable = resolvedVariable;
			}
		} else {
			super.bind();
		}
	}

	forEachReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		callback: ForEachReturnExpressionCallback,
		recursionTracker: EntityPathTracker
	) {
		if (!this.bound) this.bind();
		if (this.variable !== null) {
			this.variable.forEachReturnExpressionWhenCalledAtPath(
				path,
				callOptions,
				callback,
				recursionTracker
			);
		} else {
			this.object.forEachReturnExpressionWhenCalledAtPath(
				[this.propertyKey || this.getComputedKey(EMPTY_IMMUTABLE_TRACKER), ...path],
				callOptions,
				callback,
				recursionTracker
			);
		}
	}

	getLiteralValueAtPath(
		path: ObjectPath,
		recursionTracker: ImmutableEntityPathTracker
	): LiteralValueOrUnknown {
		if (this.variable !== null) {
			return this.variable.getLiteralValueAtPath(path, recursionTracker);
		}
		return this.object.getLiteralValueAtPath(
			[this.propertyKey || this.getComputedKey(recursionTracker), ...path],
			recursionTracker
		);
	}

	hasEffects(options: ExecutionPathOptions): boolean {
		return (
			this.property.hasEffects(options) ||
			this.object.hasEffects(options) ||
			(this.arePropertyReadSideEffectsChecked &&
				this.object.hasEffectsWhenAccessedAtPath(
					[this.propertyKey || this.getComputedKey(EMPTY_IMMUTABLE_TRACKER)],
					options
				))
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
			[this.propertyKey || this.getComputedKey(EMPTY_IMMUTABLE_TRACKER), ...path],
			options
		);
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, options: ExecutionPathOptions): boolean {
		if (this.variable !== null) {
			return this.variable.hasEffectsWhenAssignedAtPath(path, options);
		}
		return this.object.hasEffectsWhenAssignedAtPath(
			[this.propertyKey || this.getComputedKey(EMPTY_IMMUTABLE_TRACKER), ...path],
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
			[this.propertyKey || this.getComputedKey(EMPTY_IMMUTABLE_TRACKER), ...path],
			callOptions,
			options
		);
	}

	include() {
		if (!this.included) {
			this.included = true;
			if (this.variable !== null && !this.variable.included) {
				this.variable.include();
				this.context.requestTreeshakingPass();
			}
		}
		this.object.include();
		this.property.include();
	}

	initialise() {
		this.included = false;
		this.propertyKey = getPropertyKey(this);
		this.variable = null;
		this.arePropertyReadSideEffectsChecked = this.context.propertyReadSideEffects;
		this.bound = false;
		this.replacement = null;
	}

	reassignPath(path: ObjectPath) {
		if (!this.bound) this.bind();
		if (path.length === 0) this.disallowNamespaceReassignment();
		if (this.variable) {
			this.variable.reassignPath(path);
		} else {
			this.object.reassignPath([
				this.propertyKey || this.getComputedKey(EMPTY_IMMUTABLE_TRACKER),
				...path
			]);
		}
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
			code.overwrite(this.start, this.end, replacement, {
				storeName: true,
				contentOnly: true
			});
		} else {
			if (isCalleeOfDifferentParent) {
				code.appendRight(this.start, '0, ');
			}
			super.render(code, options);
		}
	}

	someReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		predicateFunction: SomeReturnExpressionCallback,
		options: ExecutionPathOptions
	): boolean {
		if (this.variable) {
			return this.variable.someReturnExpressionWhenCalledAtPath(
				path,
				callOptions,
				predicateFunction,
				options
			);
		}
		return this.object.someReturnExpressionWhenCalledAtPath(
			[this.propertyKey || this.getComputedKey(EMPTY_IMMUTABLE_TRACKER), ...path],
			callOptions,
			predicateFunction,
			options
		);
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

	private getComputedKey(recursionTracker: ImmutableEntityPathTracker) {
		const value = this.property.getLiteralValueAtPath(EMPTY_PATH, recursionTracker);
		return value === UNKNOWN_VALUE ? UNKNOWN_KEY : String(value);
	}

	private resolveNamespaceVariables(
		baseVariable: Variable,
		path: PathWithPositions
	): Variable | string | null {
		if (path.length === 0) return baseVariable;
		if (!baseVariable.isNamespace) return null;
		const exportName = path[0].key;
		const variable = baseVariable.isExternal
			? (<ExternalVariable>baseVariable).module.traceExport(exportName)
			: (<NamespaceVariable>baseVariable).context.traceExport(exportName);
		if (!variable) {
			const fileName = baseVariable.isExternal
				? (<ExternalVariable>baseVariable).module.id
				: (<NamespaceVariable>baseVariable).context.fileName;
			this.context.warn(
				{
					code: 'MISSING_EXPORT',
					missing: exportName,
					importer: relativeId(this.context.fileName),
					exporter: relativeId(fileName),
					message: `'${exportName}' is not exported by '${relativeId(fileName)}'`,
					url: `https://github.com/rollup/rollup/wiki/Troubleshooting#name-is-not-exported-by-module`
				},
				path[0].pos
			);
			return 'undefined';
		}
		return this.resolveNamespaceVariables(variable, path.slice(1));
	}
}
