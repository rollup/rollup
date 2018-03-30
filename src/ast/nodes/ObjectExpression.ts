import Property from './Property';
import CallOptions from '../CallOptions';
import ExecutionPathOptions from '../ExecutionPathOptions';
import Identifier from './Identifier';
import { ForEachReturnExpressionCallback, SomeReturnExpressionCallback } from './shared/Expression';
import { isUnknownKey, objectMembers, ObjectPath, ObjectPathKey, UNKNOWN_KEY } from '../values';
import { Node, NodeBase } from './shared/Node';
import { NodeType } from './NodeType';
import { childIsStatement, NodeRenderOptions, RenderOptions } from '../../utils/renderHelpers';
import { BLANK } from '../../utils/blank';
import MagicString from 'magic-string';

const PROPERTY_KINDS_READ = ['init', 'get'];
const PROPERTY_KINDS_WRITE = ['init', 'set'];

export function isObjectExpression(node: Node): node is ObjectExpression {
	return node.type === NodeType.ObjectExpression;
}

export default class ObjectExpression extends NodeBase {
	type: NodeType.ObjectExpression;
	properties: Property[];

	reassignPath(path: ObjectPath, options: ExecutionPathOptions) {
		if (path.length === 0) return;

		const { properties, hasCertainHit } = this._getPossiblePropertiesWithName(
			path[0],
			path.length === 1 ? PROPERTY_KINDS_WRITE : PROPERTY_KINDS_READ
		);
		(path.length === 1 || hasCertainHit) &&
			properties.forEach(
				property =>
					(path.length > 1 || property.kind === 'set') &&
					property.reassignPath(path.slice(1), options)
			);
	}

	forEachReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		callback: ForEachReturnExpressionCallback,
		options: ExecutionPathOptions
	) {
		if (path.length === 0) return;

		const { properties, hasCertainHit } = this._getPossiblePropertiesWithName(
			path[0],
			PROPERTY_KINDS_READ
		);
		hasCertainHit &&
			properties.forEach(property =>
				property.forEachReturnExpressionWhenCalledAtPath(
					path.slice(1),
					callOptions,
					callback,
					options
				)
			);
	}

	_getPossiblePropertiesWithName(name: ObjectPathKey, kinds: ObjectPath) {
		if (name === UNKNOWN_KEY) {
			return { properties: this.properties, hasCertainHit: false };
		}
		const properties = [];
		let hasCertainHit = false;

		for (let index = this.properties.length - 1; index >= 0; index--) {
			const property = this.properties[index];
			if (kinds.indexOf(property.kind) < 0) continue;
			if (property.computed) {
				properties.push(property);
			} else if ((<Identifier>property.key).name === name) {
				properties.push(property);
				hasCertainHit = true;
				break;
			}
		}
		return { properties, hasCertainHit };
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, options: ExecutionPathOptions) {
		if (path.length === 0) return false;

		const { properties, hasCertainHit } = this._getPossiblePropertiesWithName(
			path[0],
			PROPERTY_KINDS_READ
		);
		return (
			(path.length > 1 && !hasCertainHit) ||
			properties.some(property => property.hasEffectsWhenAccessedAtPath(path.slice(1), options))
		);
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, options: ExecutionPathOptions) {
		if (path.length === 0) return false;

		const { properties, hasCertainHit } = this._getPossiblePropertiesWithName(
			path[0],
			path.length === 1 ? PROPERTY_KINDS_WRITE : PROPERTY_KINDS_READ
		);
		return (
			(path.length > 1 && !hasCertainHit) ||
			properties.some(
				property =>
					(path.length > 1 || property.kind === 'set') &&
					property.hasEffectsWhenAssignedAtPath(path.slice(1), options)
			)
		);
	}

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		options: ExecutionPathOptions
	): boolean {
		if (path.length === 0) return true;
		const subPath = path[0];
		if (path.length === 1 && !isUnknownKey(subPath) && objectMembers[subPath]) {
			return false;
		}

		const { properties, hasCertainHit } = this._getPossiblePropertiesWithName(
			path[0],
			PROPERTY_KINDS_READ
		);
		return (
			!hasCertainHit ||
			properties.some(property =>
				property.hasEffectsWhenCalledAtPath(path.slice(1), callOptions, options)
			)
		);
	}

	render(code: MagicString, options: RenderOptions, { renderedParent }: NodeRenderOptions = BLANK) {
		super.render(code, options);
		if (renderedParent && childIsStatement(renderedParent)) {
			code.appendRight(this.start, '(');
			code.prependLeft(this.end, ')');
		}
	}

	someReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		predicateFunction: SomeReturnExpressionCallback,
		options: ExecutionPathOptions
	): boolean {
		if (path.length === 0) return true;
		const subPath = path[0];
		if (path.length === 1 && !isUnknownKey(subPath) && objectMembers[subPath]) {
			return predicateFunction(options)(objectMembers[subPath].returns);
		}

		const { properties, hasCertainHit } = this._getPossiblePropertiesWithName(
			subPath,
			PROPERTY_KINDS_READ
		);
		return (
			!hasCertainHit ||
			properties.some(property =>
				property.someReturnExpressionWhenCalledAtPath(
					path.slice(1),
					callOptions,
					predicateFunction,
					options
				)
			)
		);
	}
}
