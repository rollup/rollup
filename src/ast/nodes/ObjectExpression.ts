import MagicString from 'magic-string';
import { BLANK } from '../../utils/blank';
import { getOrCreate } from '../../utils/getOrCreate';
import { NodeRenderOptions, RenderOptions } from '../../utils/renderHelpers';
import { CallOptions } from '../CallOptions';
import { DeoptimizableEntity } from '../DeoptimizableEntity';
import { HasEffectsContext } from '../ExecutionContext';
import {
	EMPTY_PATH,
	ObjectPath,
	ObjectPathKey,
	PathTracker,
	SHARED_RECURSION_TRACKER,
	UNKNOWN_PATH
} from '../utils/PathTracker';
import {
	getMemberReturnExpressionWhenCalled,
	hasMemberEffectWhenCalled,
	LiteralValueOrUnknown,
	objectMembers,
	UnknownValue,
	UNKNOWN_EXPRESSION
} from '../values';
import Identifier from './Identifier';
import Literal from './Literal';
import * as NodeType from './NodeType';
import Property from './Property';
import { ExpressionEntity } from './shared/Expression';
import { NodeBase } from './shared/Node';
import SpreadElement from './SpreadElement';

/**
 * This is a map of all properties of an object to allow quick lookups of relevant properties. These
 * are the meanings of the properties:
 * - exactMatchRead: If we know that there is at least one property with a given key, then this will
 *     contain the last property of that name in the object definition. "Read" means for reading
 *     access, i.e. this is the last regular property or getter for that name. Setters are ignored.
 *     Only if an "exactMatchRead" exists do we have a chance to e.g. get a literal value for that
 *     property. However, there is also a second property that is important here:
 * - propertiesRead: This is an array that contains the "exactMatchRead", but also all computed
 *     properties that cannot be resolved and are define after the exactMatchRead in the object.
 *     Note that this value only has meaning if an "exactMatchRead" exists as otherwise there
 *     was no known readable property of that given name but only a setter.
 *     If it does not exist, then the instance property "unmatchablePropertiesRead" will contain all
 *     unresolved properties that might resolve to a given key.
 *     This property is important for deoptimization: If a property is mutated, all "possible
 *     matches" need to be deoptimized.
 * - exactMatchWrite/propertiesWrite: Equivalent to exactMatchRead/propertiesRead except they only
 *     look at regular properties and setters but ignore getters
 *
 * Example:
 * {
 *   foo: 'first',
 *   foo: 'second',
 *   [unknown]: 'third';
 *   [otherUnknown]: 'fourth';
 * }
 *
 * In this case you get:
 * {
 *   exactMatchRead: <foo: 'second'>,
 *   propertiesRead: [<foo: 'second'>, <[unknown]: 'third'>, <[otherUnknown]: 'fourth'>]
 *   exactMatchWrite: <foo: 'second'>,
 *   propertiesWrite: [<foo: 'second'>, <[unknown]: 'third'>, <[otherUnknown]: 'fourth'>]
 * }
 */
interface PropertyMap {
	[key: string]: {
		exactMatchRead: Property | null;
		exactMatchWrite: Property | null;
		propertiesRead: (Property | SpreadElement)[];
		propertiesWrite: Property[];
	};
}

export default class ObjectExpression extends NodeBase implements DeoptimizableEntity {
	properties!: (Property | SpreadElement)[];
	type!: NodeType.tObjectExpression;

	private deoptimizedPaths = new Set<string>();

	// We collect deoptimization information if we can resolve a computed property access
	private expressionsToBeDeoptimized = new Map<string, DeoptimizableEntity[]>();
	private hasUnknownDeoptimizedProperty = false;
	private propertyMap: PropertyMap | null = null;
	private unmatchablePropertiesRead: (Property | SpreadElement)[] = [];
	private unmatchablePropertiesWrite: Property[] = [];

	// We could also track this per-property but this would quickly become much more complex
	deoptimizeCache() {
		if (!this.hasUnknownDeoptimizedProperty) this.deoptimizeAllProperties();
	}

	deoptimizePath(path: ObjectPath) {
		if (this.hasUnknownDeoptimizedProperty) return;
		const propertyMap = this.getPropertyMap();
		const key = path[0];
		if (path.length === 1) {
			if (typeof key !== 'string') {
				this.deoptimizeAllProperties();
				return;
			}
			if (!this.deoptimizedPaths.has(key)) {
				this.deoptimizedPaths.add(key);

				// we only deoptimizeCache exact matches as in all other cases,
				// we do not return a literal value or return expression
				const expressionsToBeDeoptimized = this.expressionsToBeDeoptimized.get(key);
				if (expressionsToBeDeoptimized) {
					for (const expression of expressionsToBeDeoptimized) {
						expression.deoptimizeCache();
					}
				}
			}
		}
		const subPath = path.length === 1 ? UNKNOWN_PATH : path.slice(1);
		for (const property of typeof key === 'string'
			? propertyMap[key]
				? propertyMap[key].propertiesRead
				: []
			: this.properties) {
			property.deoptimizePath(subPath);
		}
	}

	getLiteralValueAtPath(
		path: ObjectPath,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): LiteralValueOrUnknown {
		if (path.length === 0) {
			return UnknownValue;
		}

		const key = path[0];
		const expressionAtPath = this.getMemberExpression(key);
		if (expressionAtPath) {
			if (expressionAtPath === UNKNOWN_EXPRESSION) {
				return UnknownValue;
			}
			getOrCreate(this.expressionsToBeDeoptimized, key, () => []).push(origin);
			return expressionAtPath.getLiteralValueAtPath(path.slice(1), recursionTracker, origin);
		}

		if (path.length === 1 && !objectMembers[key as string]) {
			getOrCreate(this.expressionsToBeDeoptimized, key, () => []).push(origin);
			return undefined;
		}
		return UnknownValue;
	}

	getReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): ExpressionEntity {
		if (path.length === 0) {
			return UNKNOWN_EXPRESSION;
		}

		const key = path[0];
		const expressionAtPath = this.getMemberExpression(key);
		if (expressionAtPath) {
			if (expressionAtPath === UNKNOWN_EXPRESSION) {
				return UNKNOWN_EXPRESSION;
			}
			getOrCreate(this.expressionsToBeDeoptimized, key, () => []).push(origin);
			return expressionAtPath.getReturnExpressionWhenCalledAtPath(
				path.slice(1),
				recursionTracker,
				origin
			);
		}

		if (path.length === 1) {
			return getMemberReturnExpressionWhenCalled(objectMembers, key);
		}
		return UNKNOWN_EXPRESSION;
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, context: HasEffectsContext) {
		if (path.length === 0) {
			return false;
		}
		const key = path[0];
		const expressionAtPath = this.getMemberExpression(key);
		if (expressionAtPath) {
			return expressionAtPath.hasEffectsWhenAccessedAtPath(path.slice(1), context);
		}
		return path.length > 1;
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, context: HasEffectsContext) {
		const key = path[0];
		const propertyMap = this.propertyMap!;
		if (
			path.length > 1 &&
			(this.hasUnknownDeoptimizedProperty ||
				this.deoptimizedPaths.has(key as string) ||
				!propertyMap[key as string] ||
				propertyMap[key as string].exactMatchRead === null)
		) {
			return true;
		}

		const subPath = path.slice(1);
		for (const property of typeof key !== 'string'
			? this.properties
			: path.length > 1
			? propertyMap[key].propertiesRead
			: propertyMap[key]
			? propertyMap[key].propertiesWrite
			: []) {
			if (property.hasEffectsWhenAssignedAtPath(subPath, context)) return true;
		}
		return false;
	}

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		context: HasEffectsContext
	): boolean {
		const key = path[0];
		const expressionAtPath = this.getMemberExpression(key);
		if (expressionAtPath) {
			return expressionAtPath.hasEffectsWhenCalledAtPath(path.slice(1), callOptions, context);
		}
		if (path.length > 1) {
			return true;
		}
		return hasMemberEffectWhenCalled(objectMembers, key, this.included, callOptions, context);
	}

	mayModifyThisWhenCalledAtPath(path: ObjectPath, recursionTracker: PathTracker) {
		if (!path.length || typeof path[0] !== 'string') {
			return true;
		}
		const property = this.propertyMap![path[0]]?.exactMatchRead;
		return property
			? property.value.mayModifyThisWhenCalledAtPath(path.slice(1), recursionTracker)
			: true;
	}

	render(
		code: MagicString,
		options: RenderOptions,
		{ renderedParentType, renderedSurroundingElement }: NodeRenderOptions = BLANK
	) {
		super.render(code, options);
		const surroundingElement = renderedParentType || renderedSurroundingElement;
		if (
			surroundingElement === NodeType.ExpressionStatement ||
			surroundingElement === NodeType.ArrowFunctionExpression
		) {
			code.appendRight(this.start, '(');
			code.prependLeft(this.end, ')');
		}
	}

	private deoptimizeAllProperties() {
		this.hasUnknownDeoptimizedProperty = true;
		for (const property of this.properties) {
			property.deoptimizePath(UNKNOWN_PATH);
		}
		for (const expressionsToBeDeoptimized of this.expressionsToBeDeoptimized.values()) {
			for (const expression of expressionsToBeDeoptimized) {
				expression.deoptimizeCache();
			}
		}
	}

	private getMemberExpression(key: ObjectPathKey): ExpressionEntity | null {
		if (
			this.hasUnknownDeoptimizedProperty ||
			typeof key !== 'string' ||
			this.deoptimizedPaths.has(key)
		) {
			return UNKNOWN_EXPRESSION;
		}

		const propertyMap = this.getPropertyMap();
		if (
			propertyMap[key] &&
			propertyMap[key].exactMatchRead &&
			propertyMap[key].propertiesRead.length === 1
		) {
			return propertyMap[key].exactMatchRead!;
		}

		if (propertyMap[key] || this.unmatchablePropertiesRead.length > 0) {
			return UNKNOWN_EXPRESSION;
		}

		return null;
	}

	private getPropertyMap(): PropertyMap {
		if (this.propertyMap !== null) {
			return this.propertyMap;
		}
		const propertyMap = (this.propertyMap = Object.create(null));
		for (let index = this.properties.length - 1; index >= 0; index--) {
			const property = this.properties[index];
			if (property instanceof SpreadElement) {
				this.unmatchablePropertiesRead.push(property);
				continue;
			}
			const isWrite = property.kind !== 'get';
			const isRead = property.kind !== 'set';
			let key: string;
			let unmatchable = false;
			if (property.computed) {
				const keyValue = property.key.getLiteralValueAtPath(
					EMPTY_PATH,
					SHARED_RECURSION_TRACKER,
					this
				);
				if (keyValue === UnknownValue) unmatchable = true;
				key = String(keyValue);
			} else if (property.key instanceof Identifier) {
				key = property.key.name;
			} else {
				key = String((property.key as Literal).value);
			}
			if (unmatchable || (key === '__proto__' && !property.computed)) {
				if (isRead) {
					this.unmatchablePropertiesRead.push(property);
				} else {
					this.unmatchablePropertiesWrite.push(property);
				}
				continue;
			}
			const propertyMapProperty = propertyMap[key];
			if (!propertyMapProperty) {
				propertyMap[key] = {
					exactMatchRead: isRead ? property : null,
					exactMatchWrite: isWrite ? property : null,
					propertiesRead: isRead ? [property, ...this.unmatchablePropertiesRead] : [],
					propertiesWrite: isWrite && !isRead ? [property, ...this.unmatchablePropertiesWrite] : []
				};
				continue;
			}
			if (isRead && propertyMapProperty.exactMatchRead === null) {
				propertyMapProperty.exactMatchRead = property;
				propertyMapProperty.propertiesRead.push(property, ...this.unmatchablePropertiesRead);
			}
			if (isWrite && !isRead && propertyMapProperty.exactMatchWrite === null) {
				propertyMapProperty.exactMatchWrite = property;
				propertyMapProperty.propertiesWrite.push(property, ...this.unmatchablePropertiesWrite);
			}
		}
		return propertyMap;
	}
}
