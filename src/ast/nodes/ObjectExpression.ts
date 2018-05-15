import Property from './Property';
import CallOptions from '../CallOptions';
import { ExecutionPathOptions } from '../ExecutionPathOptions';
import Identifier from './Identifier';
import { ForEachReturnExpressionCallback, SomeReturnExpressionCallback } from './shared/Expression';
import {
	objectMembers,
	ObjectPath,
	ObjectPathKey,
	LiteralValueOrUnknown,
	UNKNOWN_KEY,
	UNKNOWN_VALUE,
	EMPTY_PATH
} from '../values';
import { Node, NodeBase } from './shared/Node';
import * as NodeType from './NodeType';
import { NodeRenderOptions, RenderOptions } from '../../utils/renderHelpers';
import { BLANK } from '../../utils/blank';
import MagicString from 'magic-string';
import Literal from './Literal';

const PROPERTY_KINDS_READ = ['init', 'get'];
const PROPERTY_KINDS_WRITE = ['init', 'set'];

export function isObjectExpression(node: Node): node is ObjectExpression {
	return node.type === NodeType.ObjectExpression;
}

export default class ObjectExpression extends NodeBase {
	type: NodeType.tObjectExpression;
	properties: Property[];

	forEachReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		callback: ForEachReturnExpressionCallback,
		options: ExecutionPathOptions
	) {
		if (path.length === 0) return;

		const { properties, hasCertainHit } = this.getPossiblePropertiesWithName(
			path[0],
			PROPERTY_KINDS_READ
		);
		if (hasCertainHit) {
			for (const property of properties) {
				property.forEachReturnExpressionWhenCalledAtPath(
					path.slice(1),
					callOptions,
					callback,
					options
				);
			}
		}
	}

	getLiteralValueAtPath(path: ObjectPath): LiteralValueOrUnknown {
		if (path.length === 0) return UNKNOWN_VALUE;

		const { properties, hasCertainHit } = this.getPossiblePropertiesWithName(
			path[0],
			PROPERTY_KINDS_READ
		);
		if (!hasCertainHit || properties.length > 1) return UNKNOWN_VALUE;
		return properties[0].getLiteralValueAtPath(path.slice(1));
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, options: ExecutionPathOptions) {
		if (path.length === 0) return false;

		const { properties, hasCertainHit } = this.getPossiblePropertiesWithName(
			path[0],
			PROPERTY_KINDS_READ
		);
		if (path.length > 1 && !hasCertainHit) return true;
		for (const property of properties) {
			if (property.hasEffectsWhenAccessedAtPath(path.slice(1), options)) return true;
		}
		return false;
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, options: ExecutionPathOptions) {
		if (path.length === 0) return false;

		const { properties, hasCertainHit } = this.getPossiblePropertiesWithName(
			path[0],
			path.length === 1 ? PROPERTY_KINDS_WRITE : PROPERTY_KINDS_READ
		);
		if (path.length > 1 && !hasCertainHit) return true;
		for (const property of properties) {
			if (
				(path.length > 1 || property.kind === 'set') &&
				property.hasEffectsWhenAssignedAtPath(path.slice(1), options)
			)
				return true;
		}
		return false;
	}

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		options: ExecutionPathOptions
	): boolean {
		if (path.length === 0) return true;
		const subPath = path[0];
		if (path.length === 1 && typeof subPath === 'string' && objectMembers[subPath]) {
			return false;
		}

		const { properties, hasCertainHit } = this.getPossiblePropertiesWithName(
			path[0],
			PROPERTY_KINDS_READ
		);
		if (!hasCertainHit) return true;
		for (const property of properties) {
			if (property.hasEffectsWhenCalledAtPath(path.slice(1), callOptions, options)) return true;
		}
		return false;
	}

	reassignPath(path: ObjectPath, options: ExecutionPathOptions) {
		if (path.length === 0) return;

		const { properties, hasCertainHit } = this.getPossiblePropertiesWithName(
			path[0],
			path.length === 1 ? PROPERTY_KINDS_WRITE : PROPERTY_KINDS_READ
		);
		if (path.length === 1 || hasCertainHit) {
			for (const property of properties) {
				if (path.length > 1 || property.kind === 'set') {
					property.reassignPath(path.slice(1), options);
				}
			}
		}
	}

	render(
		code: MagicString,
		options: RenderOptions,
		{ renderedParentType }: NodeRenderOptions = BLANK
	) {
		super.render(code, options);
		if (renderedParentType === NodeType.ExpressionStatement) {
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
		if (path.length === 1 && typeof subPath === 'string' && objectMembers[subPath]) {
			return predicateFunction(options)(objectMembers[subPath].returns);
		}

		const { properties, hasCertainHit } = this.getPossiblePropertiesWithName(
			subPath,
			PROPERTY_KINDS_READ
		);
		if (!hasCertainHit) return true;
		for (const property of properties) {
			if (
				property.someReturnExpressionWhenCalledAtPath(
					path.slice(1),
					callOptions,
					predicateFunction,
					options
				)
			)
				return true;
		}
		return false;
	}

	private getPossiblePropertiesWithName(name: ObjectPathKey, kinds: ObjectPath) {
		if (name === UNKNOWN_KEY) {
			return { properties: this.properties, hasCertainHit: false };
		}
		const properties = [];
		let hasCertainHit = false;

		for (let index = this.properties.length - 1; index >= 0; index--) {
			const property = this.properties[index];
			if (kinds.indexOf(property.kind) < 0) continue;
			if (property.computed) {
				const value = property.key.getLiteralValueAtPath(EMPTY_PATH);
				if (String(value) === name) {
					properties.push(property);
					hasCertainHit = true;
					break;
				} else if (value === UNKNOWN_VALUE) {
					properties.push(property);
				}
			} else if (
				(property.key instanceof Identifier && property.key.name === name) ||
				(property.key instanceof Literal && property.key.value === name)
			) {
				properties.push(property);
				hasCertainHit = true;
				break;
			}
		}
		return { properties, hasCertainHit };
	}
}
