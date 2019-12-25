import MagicString from 'magic-string';
import { BLANK } from '../../utils/blank';
import { NodeRenderOptions, RenderOptions } from '../../utils/renderHelpers';
import { CallOptions } from '../CallOptions';
import { DeoptimizableEntity } from '../DeoptimizableEntity';
import { HasEffectsContext } from '../ExecutionContext';
import {
	EMPTY_PATH,
	ObjectPath,
	PathTracker,
	SHARED_RECURSION_TRACKER,
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

	bind() {
		super.bind();
		// ensure the propertyMap is set for the tree-shaking passes
		this.getPropertyMap();
	}

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
		const propertyMap = this.getPropertyMap();
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
			!propertyMap[key] &&
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
			!propertyMap[key] ||
			propertyMap[key].exactMatchRead === null ||
			propertyMap[key].propertiesRead.length > 1
		) {
			return UnknownValue;
		}

		const expressionsToBeDeoptimized = this.expressionsToBeDeoptimized.get(key);
		if (expressionsToBeDeoptimized) {
			expressionsToBeDeoptimized.push(origin);
		} else {
			this.expressionsToBeDeoptimized.set(key, [origin]);
		}
		return propertyMap[key].exactMatchRead!.getLiteralValueAtPath(
			path.slice(1),
			recursionTracker,
			origin
		);
	}

	getReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): ExpressionEntity {
		const propertyMap = this.getPropertyMap();
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
			(!propertyMap[key] || propertyMap[key].exactMatchRead === null)
		)
			return getMemberReturnExpressionWhenCalled(objectMembers, key);

		if (
			!propertyMap[key] ||
			propertyMap[key].exactMatchRead === null ||
			propertyMap[key].propertiesRead.length > 1
		)
			return UNKNOWN_EXPRESSION;

		const expressionsToBeDeoptimized = this.expressionsToBeDeoptimized.get(key);
		if (expressionsToBeDeoptimized) {
			expressionsToBeDeoptimized.push(origin);
		} else {
			this.expressionsToBeDeoptimized.set(key, [origin]);
		}
		return propertyMap[key].exactMatchRead!.getReturnExpressionWhenCalledAtPath(
			path.slice(1),
			recursionTracker,
			origin
		);
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, context: HasEffectsContext) {
		if (path.length === 0) return false;
		const key = path[0];
		const propertyMap = this.propertyMap!;
		if (
			path.length > 1 &&
			(this.hasUnknownDeoptimizedProperty ||
				typeof key !== 'string' ||
				this.deoptimizedPaths.has(key) ||
				!propertyMap[key] ||
				propertyMap[key].exactMatchRead === null)
		)
			return true;

		const subPath = path.slice(1);
		for (const property of typeof key !== 'string'
			? this.properties
			: propertyMap[key]
			? propertyMap[key].propertiesRead
			: []) {
			if (property.hasEffectsWhenAccessedAtPath(subPath, context)) return true;
		}
		return false;
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
		if (
			typeof key !== 'string' ||
			this.hasUnknownDeoptimizedProperty ||
			this.deoptimizedPaths.has(key) ||
			(this.propertyMap![key]
				? !this.propertyMap![key].exactMatchRead
				: path.length > 1 || !objectMembers[key])
		) {
			return true;
		}
		const subPath = path.slice(1);
		if (this.propertyMap![key]) {
			for (const property of this.propertyMap![key].propertiesRead) {
				if (property.hasEffectsWhenCalledAtPath(subPath, callOptions, context)) return true;
			}
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
			let key;
			if (property.computed) {
				const keyValue = property.key.getLiteralValueAtPath(
					EMPTY_PATH,
					SHARED_RECURSION_TRACKER,
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
