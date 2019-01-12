import MagicString from 'magic-string';
import { BLANK } from '../../utils/blank';
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
	getMemberReturnExpressionWhenCalled,
	hasMemberEffectWhenCalled,
	LiteralValueOrUnknown,
	objectMembers,
	ObjectPath,
	UNKNOWN_EXPRESSION,
	UNKNOWN_PATH,
	UNKNOWN_VALUE
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
		exactMatchWrite: Property | null;
		propertiesSet: Property[];
		exactMatchRead: Property | null;
		propertiesRead: (Property | SpreadElement)[];
	};
}

export default class ObjectExpression extends NodeBase {
	type: NodeType.tObjectExpression;
	properties: (Property | SpreadElement)[];

	// Caching and deoptimization:
	// We collect deoptimization information if we can resolve a computed property access
	private propertyMap: PropertyMap | null;
	private unmatchablePropertiesRead: (Property | SpreadElement)[] | null;
	private unmatchablePropertiesWrite: Property[] | null;
	private deoptimizedPaths: { [key: string]: true };
	private hasUnknownDeoptimizedProperty: boolean;
	private expressionsToBeDeoptimized: { [key: string]: DeoptimizableEntity[] };

	bind() {
		super.bind();
		if (this.propertyMap === null) this.buildPropertyMap();
	}

	// We could also track this per-property but this would quickly become much more complex
	deoptimizeCache() {
		if (!this.hasUnknownDeoptimizedProperty) this.deoptimizeAllProperties();
	}

	getLiteralValueAtPath(
		path: ObjectPath,
		recursionTracker: ImmutableEntityPathTracker,
		origin: DeoptimizableEntity
	): LiteralValueOrUnknown {
		if (this.propertyMap === null) this.buildPropertyMap();
		const key = path[0];

		if (
			path.length === 0 ||
			this.hasUnknownDeoptimizedProperty ||
			typeof key !== 'string' ||
			this.deoptimizedPaths[key]
		)
			return UNKNOWN_VALUE;

		if (
			path.length === 1 &&
			!this.propertyMap[key] &&
			!objectMembers[key] &&
			this.unmatchablePropertiesRead.length === 0
		) {
			if (!this.expressionsToBeDeoptimized[key]) {
				this.expressionsToBeDeoptimized[key] = [origin];
			} else {
				this.expressionsToBeDeoptimized[key].push(origin);
			}
			return undefined;
		}

		if (
			!this.propertyMap[key] ||
			this.propertyMap[key].exactMatchRead === null ||
			this.propertyMap[key].propertiesRead.length > 1
		)
			return UNKNOWN_VALUE;

		if (!this.expressionsToBeDeoptimized[key]) {
			this.expressionsToBeDeoptimized[key] = [origin];
		} else {
			this.expressionsToBeDeoptimized[key].push(origin);
		}
		return this.propertyMap[key].exactMatchRead.getLiteralValueAtPath(
			path.slice(1),
			recursionTracker,
			origin
		);
	}

	getReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		recursionTracker: ImmutableEntityPathTracker,
		origin: DeoptimizableEntity
	): ExpressionEntity {
		if (this.propertyMap === null) this.buildPropertyMap();
		const key = path[0];

		if (
			path.length === 0 ||
			this.hasUnknownDeoptimizedProperty ||
			typeof key !== 'string' ||
			this.deoptimizedPaths[key]
		)
			return UNKNOWN_EXPRESSION;

		if (
			path.length === 1 &&
			objectMembers[key] &&
			this.unmatchablePropertiesRead.length === 0 &&
			(!this.propertyMap[key] || this.propertyMap[key].exactMatchRead === null)
		)
			return getMemberReturnExpressionWhenCalled(objectMembers, key);

		if (
			!this.propertyMap[key] ||
			this.propertyMap[key].exactMatchRead === null ||
			this.propertyMap[key].propertiesRead.length > 1
		)
			return UNKNOWN_EXPRESSION;

		if (!this.expressionsToBeDeoptimized[key]) {
			this.expressionsToBeDeoptimized[key] = [origin];
		} else {
			this.expressionsToBeDeoptimized[key].push(origin);
		}
		return this.propertyMap[key].exactMatchRead.getReturnExpressionWhenCalledAtPath(
			path.slice(1),
			recursionTracker,
			origin
		);
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, options: ExecutionPathOptions) {
		if (path.length === 0) return false;
		const key = path[0];
		if (
			path.length > 1 &&
			(this.hasUnknownDeoptimizedProperty ||
				typeof key !== 'string' ||
				this.deoptimizedPaths[key] ||
				!this.propertyMap[key] ||
				this.propertyMap[key].exactMatchRead === null)
		)
			return true;

		const subPath = path.slice(1);
		for (const property of typeof key !== 'string'
			? this.properties
			: this.propertyMap[key]
			? this.propertyMap[key].propertiesRead
			: []) {
			if (property.hasEffectsWhenAccessedAtPath(subPath, options)) return true;
		}
		return false;
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, options: ExecutionPathOptions) {
		if (path.length === 0) return false;
		const key = path[0];
		if (
			path.length > 1 &&
			(this.hasUnknownDeoptimizedProperty ||
				typeof key !== 'string' ||
				this.deoptimizedPaths[key] ||
				!this.propertyMap[key] ||
				this.propertyMap[key].exactMatchRead === null)
		)
			return true;

		const subPath = path.slice(1);
		for (const property of typeof key !== 'string'
			? this.properties
			: path.length > 1
			? this.propertyMap[key].propertiesRead
			: this.propertyMap[key]
			? this.propertyMap[key].propertiesSet
			: []) {
			if (property.hasEffectsWhenAssignedAtPath(subPath, options)) return true;
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
			this.hasUnknownDeoptimizedProperty ||
			typeof key !== 'string' ||
			this.deoptimizedPaths[key] ||
			(this.propertyMap[key]
				? !this.propertyMap[key].exactMatchRead
				: path.length > 1 || !objectMembers[key])
		)
			return true;
		const subPath = path.slice(1);
		for (const property of this.propertyMap[key] ? this.propertyMap[key].propertiesRead : []) {
			if (property.hasEffectsWhenCalledAtPath(subPath, callOptions, options)) return true;
		}
		if (path.length === 1 && objectMembers[key])
			return hasMemberEffectWhenCalled(objectMembers, key, this.included, callOptions, options);
		return false;
	}

	initialise() {
		this.included = false;
		this.hasUnknownDeoptimizedProperty = false;
		this.deoptimizedPaths = Object.create(null);
		this.propertyMap = null;
		this.expressionsToBeDeoptimized = Object.create(null);
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
			if (!this.deoptimizedPaths[key]) {
				this.deoptimizedPaths[key] = true;

				// we only deoptimizeCache exact matches as in all other cases,
				// we do not return a literal value or return expression
				if (this.expressionsToBeDeoptimized[key]) {
					for (const expression of this.expressionsToBeDeoptimized[key]) {
						expression.deoptimizeCache();
					}
				}
			}
		}
		const subPath = path.length === 1 ? UNKNOWN_PATH : path.slice(1);
		for (const property of typeof key === 'string'
			? this.propertyMap[key]
				? this.propertyMap[key].propertiesRead
				: []
			: this.properties) {
			property.deoptimizePath(subPath);
		}
	}

	private deoptimizeAllProperties() {
		this.hasUnknownDeoptimizedProperty = true;
		for (const property of this.properties) {
			property.deoptimizePath(UNKNOWN_PATH);
		}
		for (const key of Object.keys(this.expressionsToBeDeoptimized)) {
			for (const expression of this.expressionsToBeDeoptimized[key]) {
				expression.deoptimizeCache();
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

	private buildPropertyMap() {
		this.propertyMap = Object.create(null);
		this.unmatchablePropertiesRead = [];
		this.unmatchablePropertiesWrite = [];
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
				if (keyValue === UNKNOWN_VALUE) {
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
				key = String((<Literal>property.key).value);
			}
			const propertyMapProperty = this.propertyMap[key];
			if (!propertyMapProperty) {
				this.propertyMap[key] = {
					exactMatchRead: isRead ? property : null,
					propertiesRead: isRead ? [property, ...this.unmatchablePropertiesRead] : [],
					exactMatchWrite: isWrite ? property : null,
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
}
