import MagicString from 'magic-string';
import { BLANK } from '../../utils/blank';
import { NodeRenderOptions, RenderOptions } from '../../utils/renderHelpers';
import { CallOptions } from '../CallOptions';
import { DeoptimizableEntity } from '../DeoptimizableEntity';
import { HasEffectsContext } from '../ExecutionContext';
import {
	EMPTY_IMMUTABLE_TRACKER,
	EMPTY_PATH,
	ObjectPath,
	PathTracker,
	UNKNOWN_PATH
} from '../utils/PathTracker';
import {
	getMemberReturnExpressionWhenCalled,
	hasMemberEffectWhenCalled,
	LiteralValueOrUnknown,
	objectMembers,
	UNKNOWN_EXPRESSION,
	UnknownValue
} from '../values';
import Identifier from './Identifier';
import Literal from './Literal';
import * as NodeType from './NodeType';
import Property from './Property';
import { ExpressionEntity } from './shared/Expression';
import { NodeBase } from './shared/Node';
import SpreadElement from './SpreadElement';

interface PropertyMap {
	[key: string]: {
		exactMatchRead: Property | null;
		exactMatchWrite: Property | null;
		propertiesRead: (Property | SpreadElement)[];
		propertiesSet: Property[];
	};
}

export default class ObjectExpression extends NodeBase {
	properties!: (Property | SpreadElement)[];
	type!: NodeType.tObjectExpression;

	private deoptimizedPaths = new Set<string>();
	// We collect deoptimization information if we can resolve a computed property access
	private expressionsToBeDeoptimized = new Map<string, DeoptimizableEntity[]>();
	private hasUnknownDeoptimizedProperty = false;
	private propertyMap: PropertyMap | null = null;
	private unmatchablePropertiesRead: (Property | SpreadElement)[] = [];
	private unmatchablePropertiesWrite: Property[] = [];

	bind() {
		super.bind();
		if (this.propertyMap === null) this.buildPropertyMap();
	}

	// We could also track this per-property but this would quickly become much more complex
	deoptimizeCache() {
		if (!this.hasUnknownDeoptimizedProperty) this.deoptimizeAllProperties();
	}

	deoptimizePath(path: ObjectPath) {
		if (this.hasUnknownDeoptimizedProperty) return;
		if (this.propertyMap === null) this.buildPropertyMap();
		if (path.length === 0) {
			this.deoptimizeAllProperties();
			return;
		}
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
			? (this.propertyMap as PropertyMap)[key]
				? (this.propertyMap as PropertyMap)[key].propertiesRead
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
		if (this.propertyMap === null) this.buildPropertyMap();
		const key = path[0];

		if (
			path.length === 0 ||
			this.hasUnknownDeoptimizedProperty ||
			typeof key !== 'string' ||
			this.deoptimizedPaths.has(key)
		)
			return UnknownValue;

		if (
			path.length === 1 &&
			!(this.propertyMap as PropertyMap)[key] &&
			!objectMembers[key] &&
			this.unmatchablePropertiesRead.length === 0
		) {
			const expressionsToBeDeoptimized = this.expressionsToBeDeoptimized.get(key);
			if (expressionsToBeDeoptimized) {
				expressionsToBeDeoptimized.push(origin);
			} else {
				this.expressionsToBeDeoptimized.set(key, [origin]);
			}
			return undefined;
		}

		if (
			!(this.propertyMap as PropertyMap)[key] ||
			(this.propertyMap as PropertyMap)[key].exactMatchRead === null ||
			(this.propertyMap as PropertyMap)[key].propertiesRead.length > 1
		) {
			return UnknownValue;
		}

		const expressionsToBeDeoptimized = this.expressionsToBeDeoptimized.get(key);
		if (expressionsToBeDeoptimized) {
			expressionsToBeDeoptimized.push(origin);
		} else {
			this.expressionsToBeDeoptimized.set(key, [origin]);
		}
		return ((this.propertyMap as PropertyMap)[key]
			.exactMatchRead as Property).getLiteralValueAtPath(path.slice(1), recursionTracker, origin);
	}

	getReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): ExpressionEntity {
		if (this.propertyMap === null) this.buildPropertyMap();
		const key = path[0];

		if (
			path.length === 0 ||
			this.hasUnknownDeoptimizedProperty ||
			typeof key !== 'string' ||
			this.deoptimizedPaths.has(key)
		)
			return UNKNOWN_EXPRESSION;

		if (
			path.length === 1 &&
			objectMembers[key] &&
			this.unmatchablePropertiesRead.length === 0 &&
			(!(this.propertyMap as PropertyMap)[key] ||
				(this.propertyMap as PropertyMap)[key].exactMatchRead === null)
		)
			return getMemberReturnExpressionWhenCalled(objectMembers, key);

		if (
			!(this.propertyMap as PropertyMap)[key] ||
			(this.propertyMap as PropertyMap)[key].exactMatchRead === null ||
			(this.propertyMap as PropertyMap)[key].propertiesRead.length > 1
		)
			return UNKNOWN_EXPRESSION;

		const expressionsToBeDeoptimized = this.expressionsToBeDeoptimized.get(key);
		if (expressionsToBeDeoptimized) {
			expressionsToBeDeoptimized.push(origin);
		} else {
			this.expressionsToBeDeoptimized.set(key, [origin]);
		}
		return ((this.propertyMap as PropertyMap)[key]
			.exactMatchRead as Property).getReturnExpressionWhenCalledAtPath(
			path.slice(1),
			recursionTracker,
			origin
		);
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, context: HasEffectsContext) {
		if (path.length === 0) return false;
		const key = path[0];
		if (
			path.length > 1 &&
			(this.hasUnknownDeoptimizedProperty ||
				typeof key !== 'string' ||
				this.deoptimizedPaths.has(key) ||
				!(this.propertyMap as PropertyMap)[key] ||
				(this.propertyMap as PropertyMap)[key].exactMatchRead === null)
		)
			return true;

		const subPath = path.slice(1);
		for (const property of typeof key !== 'string'
			? this.properties
			: (this.propertyMap as PropertyMap)[key]
			? (this.propertyMap as PropertyMap)[key].propertiesRead
			: []) {
			if (property.hasEffectsWhenAccessedAtPath(subPath, context)) return true;
		}
		return false;
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, context: HasEffectsContext) {
		if (path.length === 0) return false;
		const key = path[0];
		if (
			path.length > 1 &&
			(this.hasUnknownDeoptimizedProperty ||
				typeof key !== 'string' ||
				this.deoptimizedPaths.has(key) ||
				!(this.propertyMap as PropertyMap)[key] ||
				(this.propertyMap as PropertyMap)[key].exactMatchRead === null)
		)
			return true;

		const subPath = path.slice(1);
		for (const property of typeof key !== 'string'
			? this.properties
			: path.length > 1
			? (this.propertyMap as PropertyMap)[key].propertiesRead
			: (this.propertyMap as PropertyMap)[key]
			? (this.propertyMap as PropertyMap)[key].propertiesSet
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
		if (
			path.length === 0 ||
			this.hasUnknownDeoptimizedProperty ||
			typeof key !== 'string' ||
			this.deoptimizedPaths.has(key) ||
			((this.propertyMap as PropertyMap)[key]
				? !(this.propertyMap as PropertyMap)[key].exactMatchRead
				: path.length > 1 || !objectMembers[key])
		)
			return true;
		const subPath = path.slice(1);
		for (const property of (this.propertyMap as PropertyMap)[key]
			? (this.propertyMap as PropertyMap)[key].propertiesRead
			: []) {
			if (property.hasEffectsWhenCalledAtPath(subPath, callOptions, context)) return true;
		}
		if (path.length === 1 && objectMembers[key])
			return hasMemberEffectWhenCalled(objectMembers, key, this.included, callOptions, context);
		return false;
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

	private buildPropertyMap() {
		this.propertyMap = Object.create(null);
		for (let index = this.properties.length - 1; index >= 0; index--) {
			const property = this.properties[index];
			if (property instanceof SpreadElement) {
				this.unmatchablePropertiesRead.push(property);
				continue;
			}
			const isWrite = property.kind !== 'get';
			const isRead = property.kind !== 'set';
			let key;
			if (property.computed) {
				const keyValue = property.key.getLiteralValueAtPath(
					EMPTY_PATH,
					EMPTY_IMMUTABLE_TRACKER,
					this
				);
				if (keyValue === UnknownValue) {
					if (isRead) {
						this.unmatchablePropertiesRead.push(property);
					} else {
						this.unmatchablePropertiesWrite.push(property);
					}
					continue;
				}
				key = String(keyValue);
			} else if (property.key instanceof Identifier) {
				key = property.key.name;
			} else {
				key = String((property.key as Literal).value);
			}
			const propertyMapProperty = (this.propertyMap as PropertyMap)[key];
			if (!propertyMapProperty) {
				(this.propertyMap as PropertyMap)[key] = {
					exactMatchRead: isRead ? property : null,
					exactMatchWrite: isWrite ? property : null,
					propertiesRead: isRead ? [property, ...this.unmatchablePropertiesRead] : [],
					propertiesSet: isWrite && !isRead ? [property, ...this.unmatchablePropertiesWrite] : []
				};
				continue;
			}
			if (isRead && propertyMapProperty.exactMatchRead === null) {
				propertyMapProperty.exactMatchRead = property;
				propertyMapProperty.propertiesRead.push(property, ...this.unmatchablePropertiesRead);
			}
			if (isWrite && !isRead && propertyMapProperty.exactMatchWrite === null) {
				propertyMapProperty.exactMatchWrite = property;
				propertyMapProperty.propertiesSet.push(property, ...this.unmatchablePropertiesWrite);
			}
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
}
