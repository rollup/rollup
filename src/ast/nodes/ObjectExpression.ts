import Node from '../Node';
import { UNKNOWN_KEY } from '../variables/VariableReassignmentTracker';

const PROPERTY_KINDS_READ = ['init', 'get'];
const PROPERTY_KINDS_WRITE = ['init', 'set'];

export default class ObjectExpression extends Node {
	reassignPath (path, options) {
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

	forEachReturnExpressionWhenCalledAtPath (
		path,
		callOptions,
		callback,
		options
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

	_getPossiblePropertiesWithName (name, kinds) {
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
			} else if (property.key.name === name) {
				properties.push(property);
				hasCertainHit = true;
				break;
			}
		}
		return { properties, hasCertainHit };
	}

	hasEffectsWhenAccessedAtPath (path, options) {
		if (path.length === 0) return false;

		const { properties, hasCertainHit } = this._getPossiblePropertiesWithName(
			path[0],
			PROPERTY_KINDS_READ
		);
		return (
			(path.length > 1 && !hasCertainHit) ||
			properties.some(property =>
				property.hasEffectsWhenAccessedAtPath(path.slice(1), options)
			)
		);
	}

	hasEffectsWhenAssignedAtPath (path, options) {
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

	hasEffectsWhenCalledAtPath (path, callOptions, options) {
		if (path.length === 0) return true;

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

	someReturnExpressionWhenCalledAtPath (
		path,
		callOptions,
		predicateFunction,
		options
	) {
		if (path.length === 0) return true;

		const { properties, hasCertainHit } = this._getPossiblePropertiesWithName(
			path[0],
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
