import Property from './Property';
import CallOptions from '../CallOptions';
import { ExecutionPathOptions } from '../ExecutionPathOptions';
import Identifier from './Identifier';
import { ForEachReturnExpressionCallback, SomeReturnExpressionCallback } from './shared/Expression';
import {
	EMPTY_PATH,
	hasMemberEffectWhenCalled,
	LiteralValueOrUnknown,
	objectMembers,
	ObjectPath,
	ObjectPathKey,
	someMemberReturnExpressionWhenCalled,
	UNKNOWN_KEY,
	UNKNOWN_VALUE
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

	private reassignedPaths: { [key: string]: true };
	private hasUnknownReassignedProperty: boolean;

	forEachReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		callback: ForEachReturnExpressionCallback,
		options: ExecutionPathOptions
	) {
		if (path.length === 0) return;

		const { properties } = this.getPossiblePropertiesWithName(
			path[0],
			PROPERTY_KINDS_READ,
			options
		);
		for (const property of properties) {
			property.forEachReturnExpressionWhenCalledAtPath(
				path.slice(1),
				callOptions,
				callback,
				options
			);
		}
	}

	getLiteralValueAtPath(path: ObjectPath, options: ExecutionPathOptions): LiteralValueOrUnknown {
		const key = path[0];
		if (
			path.length === 0 ||
			this.hasUnknownReassignedProperty ||
			(typeof key === 'string' && this.reassignedPaths[key])
		)
			return UNKNOWN_VALUE;

		const { properties, hasCertainHit } = this.getPossiblePropertiesWithName(
			path[0],
			PROPERTY_KINDS_READ,
			options
		);
		if (!hasCertainHit || properties.length > 1) return UNKNOWN_VALUE;
		return properties[0].getLiteralValueAtPath(path.slice(1), options);
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, options: ExecutionPathOptions) {
		if (path.length === 0) return false;
		const key = path[0];
		if (
			path.length > 1 &&
			(this.hasUnknownReassignedProperty || (typeof key === 'string' && this.reassignedPaths[key]))
		)
			return true;

		const { properties, hasCertainHit } = this.getPossiblePropertiesWithName(
			path[0],
			PROPERTY_KINDS_READ,
			options
		);
		if (path.length > 1 && !hasCertainHit) return true;
		const subPath = path.slice(1);
		for (const property of properties) {
			if (property.hasEffectsWhenAccessedAtPath(subPath, options)) return true;
		}
		return false;
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, options: ExecutionPathOptions) {
		if (path.length === 0) return false;
		const key = path[0];
		if (
			path.length > 1 &&
			(this.hasUnknownReassignedProperty || (typeof key === 'string' && this.reassignedPaths[key]))
		)
			return true;

		const { properties, hasCertainHit } = this.getPossiblePropertiesWithName(
			path[0],
			path.length === 1 ? PROPERTY_KINDS_WRITE : PROPERTY_KINDS_READ,
			options
		);
		if (path.length > 1 && !hasCertainHit) return true;
		const subPath = path.slice(1);
		for (const property of properties) {
			if (
				(path.length > 1 || property.kind === 'set') &&
				property.hasEffectsWhenAssignedAtPath(subPath, options)
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
		const key = path[0];
		if (
			path.length === 0 ||
			this.hasUnknownReassignedProperty ||
			(typeof key === 'string' && this.reassignedPaths[key])
		)
			return true;

		const { properties, hasCertainHit } = this.getPossiblePropertiesWithName(
			key,
			PROPERTY_KINDS_READ,
			options
		);
		if (!(hasCertainHit || (path.length === 1 && typeof key === 'string' && objectMembers[key])))
			return true;
		const subPath = path.slice(1);
		for (const property of properties) {
			if (property.hasEffectsWhenCalledAtPath(subPath, callOptions, options)) return true;
		}
		if (path.length === 1 && typeof key === 'string' && objectMembers[key])
			return hasMemberEffectWhenCalled(objectMembers, key, this.included, callOptions, options);
		return false;
	}

	initialise() {
		this.included = false;
		this.hasUnknownReassignedProperty = false;
		this.reassignedPaths = Object.create(null);
	}

	reassignPath(path: ObjectPath, options: ExecutionPathOptions) {
		if (path.length === 0) return;
		if (path.length === 1) {
			if (!this.hasUnknownReassignedProperty) {
				const key = path[0];
				if (typeof key === 'string') {
					this.reassignedPaths[key] = true;
				} else {
					this.hasUnknownReassignedProperty = true;
				}
			}
			return;
		}

		const { properties } = this.getPossiblePropertiesWithName(
			path[0],
			PROPERTY_KINDS_READ,
			options
		);
		const subPath = path.slice(1);
		for (const property of properties) {
			property.reassignPath(subPath, options);
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
		const key = path[0];
		if (
			path.length === 0 ||
			this.hasUnknownReassignedProperty ||
			(typeof key === 'string' && this.reassignedPaths[key])
		)
			return true;

		if (path.length === 1 && typeof key === 'string' && objectMembers[key]) {
			return predicateFunction(options, objectMembers[key].returns);
		}

		const { properties, hasCertainHit } = this.getPossiblePropertiesWithName(
			key,
			PROPERTY_KINDS_READ,
			options
		);
		if (!(hasCertainHit || (path.length === 1 && typeof key === 'string' && objectMembers[key])))
			return true;
		const subPath = path.slice(1);
		for (const property of properties) {
			if (
				property.someReturnExpressionWhenCalledAtPath(
					subPath,
					callOptions,
					predicateFunction,
					options
				)
			)
				return true;
		}
		if (path.length === 1 && typeof key === 'string' && objectMembers[key])
			return someMemberReturnExpressionWhenCalled(
				objectMembers,
				key,
				callOptions,
				predicateFunction,
				options
			);
		return false;
	}

	private getPossiblePropertiesWithName(
		name: ObjectPathKey,
		kinds: ObjectPath,
		options: ExecutionPathOptions
	) {
		if (name === UNKNOWN_KEY) {
			return { properties: this.properties, hasCertainHit: false };
		}
		const properties = [];
		let hasCertainHit = false;

		for (let index = this.properties.length - 1; index >= 0; index--) {
			const property = this.properties[index];
			if (kinds.indexOf(property.kind) < 0) continue;
			if (property.computed) {
				const value = property.key.getLiteralValueAtPath(EMPTY_PATH, options);
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
