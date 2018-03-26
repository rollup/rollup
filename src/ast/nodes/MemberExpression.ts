import relativeId from '../../utils/relativeId';
import { ExpressionNode, Node, NodeBase } from './shared/Node';
import Variable from '../variables/Variable';
import ExecutionPathOptions from '../ExecutionPathOptions';
import { isLiteral } from './Literal';
import CallOptions from '../CallOptions';
import MagicString from 'magic-string';
import Identifier, { isIdentifier } from './Identifier';
import { isNamespaceVariable } from '../variables/NamespaceVariable';
import { isExternalVariable } from '../variables/ExternalVariable';
import { ForEachReturnExpressionCallback, SomeReturnExpressionCallback } from './shared/Expression';
import { NodeType } from './NodeType';
import { NodeRenderOptions, RenderOptions } from '../../utils/renderHelpers';
import { isUnknownKey, ObjectPath, ObjectPathKey, UNKNOWN_KEY } from '../values';
import { BLANK } from '../../utils/blank';

const validProp = /^[a-zA-Z_$][a-zA-Z_$0-9]*$/;

function getPropertyKey(memberExpression: MemberExpression): ObjectPathKey {
	return memberExpression.computed
		? getComputedPropertyKey(memberExpression.property)
		: (<Identifier>memberExpression.property).name;
}

function getComputedPropertyKey(propertyKey: ExpressionNode): ObjectPathKey {
	if (isLiteral(propertyKey)) {
		const key = String(propertyKey.value);
		return validProp.test(key) ? key : UNKNOWN_KEY;
	}
	return UNKNOWN_KEY;
}

type PathWithPositions = { key: string; pos: number }[];

function getPathIfNotComputed(memberExpression: MemberExpression): PathWithPositions | null {
	const nextPathKey = memberExpression.propertyKey;
	const object = memberExpression.object;
	if (isUnknownKey(nextPathKey)) {
		return null;
	}
	if (isIdentifier(object)) {
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
	return null;
}

export function isMemberExpression(node: Node): node is MemberExpression {
	return node.type === NodeType.MemberExpression;
}

export default class MemberExpression extends NodeBase {
	type: NodeType.MemberExpression;
	object: ExpressionNode;
	property: ExpressionNode;
	computed: boolean;

	propertyKey: ObjectPathKey;
	variable: Variable;
	private isBound: boolean;
	private replacement: string;
	private arePropertyReadSideEffectsChecked: boolean;

	bind() {
		this.isBound = true;
		const path = getPathIfNotComputed(this);
		const baseVariable = path && this.scope.findVariable(path[0].key);
		if (baseVariable && isNamespaceVariable(baseVariable)) {
			const resolvedVariable = this.resolveNamespaceVariables(baseVariable, path.slice(1));
			if (!resolvedVariable) {
				this.bindChildren();
			} else if (typeof resolvedVariable === 'string') {
				this.replacement = resolvedVariable;
			} else {
				if (isExternalVariable(resolvedVariable) && resolvedVariable.module) {
					resolvedVariable.module.suggestName(path[0].key);
				}
				this.variable = resolvedVariable;
			}
		} else {
			this.bindChildren();
		}
	}

	private resolveNamespaceVariables(
		baseVariable: Variable,
		path: PathWithPositions
	): Variable | string | null {
		if (path.length === 0) return baseVariable;
		if (!isNamespaceVariable(baseVariable)) return null;
		const exportName = path[0].key;
		const variable = baseVariable.module.traceExport(exportName);
		if (!variable) {
			this.module.warn(
				{
					code: 'MISSING_EXPORT',
					missing: exportName,
					importer: relativeId(this.module.id),
					exporter: relativeId(baseVariable.module.id),
					message: `'${exportName}' is not exported by '${relativeId(baseVariable.module.id)}'`,
					url: `https://github.com/rollup/rollup/wiki/Troubleshooting#name-is-not-exported-by-module`
				},
				path[0].pos
			);
			return 'undefined';
		}
		return this.resolveNamespaceVariables(variable, path.slice(1));
	}

	forEachReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		callback: ForEachReturnExpressionCallback,
		options: ExecutionPathOptions
	) {
		if (!this.isBound) this.bind();
		if (this.variable) {
			this.variable.forEachReturnExpressionWhenCalledAtPath(path, callOptions, callback, options);
		} else {
			this.object.forEachReturnExpressionWhenCalledAtPath(
				[this.propertyKey, ...path],
				callOptions,
				callback,
				options
			);
		}
	}

	hasEffects(options: ExecutionPathOptions): boolean {
		return (
			super.hasEffects(options) ||
			(this.arePropertyReadSideEffectsChecked &&
				this.object.hasEffectsWhenAccessedAtPath([this.propertyKey], options))
		);
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, options: ExecutionPathOptions): boolean {
		if (path.length === 0) {
			return false;
		}
		if (this.variable) {
			return this.variable.hasEffectsWhenAccessedAtPath(path, options);
		}
		return this.object.hasEffectsWhenAccessedAtPath([this.propertyKey, ...path], options);
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, options: ExecutionPathOptions): boolean {
		if (this.variable) {
			return this.variable.hasEffectsWhenAssignedAtPath(path, options);
		}
		return this.object.hasEffectsWhenAssignedAtPath([this.propertyKey, ...path], options);
	}

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		options: ExecutionPathOptions
	): boolean {
		if (this.variable) {
			return this.variable.hasEffectsWhenCalledAtPath(path, callOptions, options);
		}
		return (
			this.propertyKey === UNKNOWN_KEY ||
			this.object.hasEffectsWhenCalledAtPath([this.propertyKey, ...path], callOptions, options)
		);
	}

	includeInBundle() {
		let addedNewNodes = super.includeInBundle();
		if (this.variable && !this.variable.included) {
			this.variable.includeVariable();
			addedNewNodes = true;
		}
		return addedNewNodes;
	}

	initialiseNode() {
		this.propertyKey = getPropertyKey(this);
		this.arePropertyReadSideEffectsChecked =
			this.module.graph.treeshake && this.module.graph.treeshakingOptions.propertyReadSideEffects;
	}

	reassignPath(path: ObjectPath, options: ExecutionPathOptions) {
		if (!this.isBound) this.bind();
		if (path.length === 0) this.disallowNamespaceReassignment();
		if (this.variable) {
			this.variable.reassignPath(path, options);
		} else {
			this.object.reassignPath([this.propertyKey, ...path], options);
		}
	}

	private disallowNamespaceReassignment() {
		if (
			isIdentifier(this.object) &&
			isNamespaceVariable(this.scope.findVariable(this.object.name))
		) {
			this.module.error(
				{
					code: 'ILLEGAL_NAMESPACE_REASSIGNMENT',
					message: `Illegal reassignment to import '${this.object.name}'`
				},
				this.start
			);
		}
	}

	render(
		code: MagicString,
		options: RenderOptions,
		{ hasBecomeCallee }: NodeRenderOptions = BLANK
	) {
		if (this.variable || this.replacement) {
			let replacement = this.variable ? this.variable.getName() : this.replacement;
			if (hasBecomeCallee) replacement = '0, ' + replacement;
			code.overwrite(this.start, this.end, replacement, {
				storeName: true,
				contentOnly: true
			});
		} else {
			if (hasBecomeCallee) {
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
		return (
			getPropertyKey(this) === UNKNOWN_KEY ||
			this.object.someReturnExpressionWhenCalledAtPath(
				[this.propertyKey, ...path],
				callOptions,
				predicateFunction,
				options
			)
		);
	}
}
