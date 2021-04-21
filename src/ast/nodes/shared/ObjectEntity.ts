import { CallOptions } from '../../CallOptions';
import { DeoptimizableEntity } from '../../DeoptimizableEntity';
import { HasEffectsContext, InclusionContext } from '../../ExecutionContext';
import {
	ObjectPath,
	ObjectPathKey,
	PathTracker,
	UnknownKey,
	UNKNOWN_PATH
} from '../../utils/PathTracker';
import {
	getMemberReturnExpressionWhenCalled,
	hasMemberEffectWhenCalled,
	LiteralValueOrUnknown,
	objectMembers,
	UnknownValue,
	UNKNOWN_EXPRESSION
} from '../../values';
import SpreadElement from '../SpreadElement';
import { ExpressionEntity } from './Expression';
import { ExpressionNode } from './Node';

export interface ObjectProperty {
	key: ObjectPathKey;
	kind: 'init' | 'set' | 'get';
	property: ExpressionEntity;
}

type PropertyMap = Record<string, ExpressionEntity[]>;

export class ObjectEntity implements ExpressionEntity {
	included = false;

	private readonly allProperties: ExpressionEntity[] = [];
	private readonly deoptimizedPaths = new Set<string>();
	private readonly expressionsToBeDeoptimizedByKey: Record<
		string,
		DeoptimizableEntity[]
	> = Object.create(null);
	private readonly gettersByKey: PropertyMap = Object.create(null);
	private hasUnknownDeoptimizedProperty = false;
	private readonly propertiesByKey: PropertyMap = Object.create(null);
	private readonly settersByKey: PropertyMap = Object.create(null);
	private readonly unmatchableGetters: ExpressionEntity[] = [];
	private readonly unmatchableProperties: ExpressionEntity[] = [];
	private readonly unmatchableSetters: ExpressionEntity[] = [];

	constructor(properties: ObjectProperty[]) {
		this.buildPropertyMaps(properties);
	}

	deoptimizeAllProperties() {
		if (this.hasUnknownDeoptimizedProperty) return;
		this.hasUnknownDeoptimizedProperty = true;
		for (const property of this.allProperties) {
			property.deoptimizePath(UNKNOWN_PATH);
		}
		for (const expressionsToBeDeoptimized of Object.values(this.expressionsToBeDeoptimizedByKey)) {
			for (const expression of expressionsToBeDeoptimized) {
				expression.deoptimizeCache();
			}
		}
	}

	deoptimizePath(path: ObjectPath) {
		if (this.hasUnknownDeoptimizedProperty) return;
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
				const expressionsToBeDeoptimized = this.expressionsToBeDeoptimizedByKey[key];
				if (expressionsToBeDeoptimized) {
					for (const expression of expressionsToBeDeoptimized) {
						expression.deoptimizeCache();
					}
				}
			}
		}
		const subPath = path.length === 1 ? UNKNOWN_PATH : path.slice(1);

		for (const property of typeof key === 'string'
			? (this.propertiesByKey[key] || this.unmatchableProperties).concat(
					this.settersByKey[key] || this.unmatchableSetters
			  )
			: this.allProperties) {
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
		const expressionAtPath = this.getMemberExpressionAndTrackDeopt(key, origin);
		if (expressionAtPath) {
			return expressionAtPath.getLiteralValueAtPath(path.slice(1), recursionTracker, origin);
		}
		if (path.length === 1 && !objectMembers[key as string]) {
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
		const expressionAtPath = this.getMemberExpressionAndTrackDeopt(key, origin);
		if (expressionAtPath) {
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

	hasEffectsWhenAccessedAtPath(path: ObjectPath, context: HasEffectsContext): boolean {
		const [key, ...subPath] = path;
		if (path.length > 1) {
			const expressionAtPath = this.getMemberExpression(key);
			return !expressionAtPath || expressionAtPath.hasEffectsWhenAccessedAtPath(subPath, context);
		}

		if (typeof key !== 'string') return true;

		const properties = this.gettersByKey[key] || this.unmatchableGetters;
		for (const property of properties) {
			if (property.hasEffectsWhenAccessedAtPath(subPath, context)) return true;
		}
		return false;
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, context: HasEffectsContext): boolean {
		const [key, ...subPath] = path;
		if (path.length > 1) {
			const expressionAtPath = this.getMemberExpression(key);
			return !expressionAtPath || expressionAtPath.hasEffectsWhenAssignedAtPath(subPath, context);
		}

		if (typeof key !== 'string') return true;

		const properties = this.settersByKey[key] || this.unmatchableSetters;
		for (const property of properties) {
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

	include() {
		this.included = true;
	}

	includeCallArguments(context: InclusionContext, args: (ExpressionNode | SpreadElement)[]) {
		for (const arg of args) {
			arg.include(context, false);
		}
	}

	mayModifyThisWhenCalledAtPath(
		path: ObjectPath,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	) {
		if (path.length === 0) {
			return false;
		}
		const key = path[0];
		const expressionAtPath = this.getMemberExpressionAndTrackDeopt(key, origin);
		if (expressionAtPath) {
			return expressionAtPath.mayModifyThisWhenCalledAtPath(
				path.slice(1),
				recursionTracker,
				origin
			);
		}
		return false;
	}

	private buildPropertyMaps(properties: ObjectProperty[]): void {
		const {
			allProperties,
			propertiesByKey,
			settersByKey,
			gettersByKey,
			unmatchableProperties,
			unmatchableGetters,
			unmatchableSetters
		} = this;
		for (let index = properties.length - 1; index >= 0; index--) {
			const { key, kind, property } = properties[index];
			allProperties.push(property);
			if (kind === 'set') {
				if (typeof key !== 'string') {
					unmatchableSetters.push(property);
				} else if (!settersByKey[key]) {
					settersByKey[key] = [property, ...unmatchableSetters];
				}
			} else {
				if (typeof key !== 'string') {
					unmatchableProperties.push(property);
					if (kind === 'get') {
						unmatchableGetters.push(property);
					}
				} else if (!propertiesByKey[key]) {
					propertiesByKey[key] = [property, ...unmatchableProperties];
					gettersByKey[key] = [...unmatchableGetters];
					if (kind === 'get') {
						gettersByKey[key].push(property);
					}
				}
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
		const properties = this.propertiesByKey[key];
		if (properties?.length === 1) {
			return properties[0];
		}
		if (properties || this.unmatchableProperties.length > 0) {
			return UNKNOWN_EXPRESSION;
		}
		return null;
	}

	private getMemberExpressionAndTrackDeopt(
		key: ObjectPathKey,
		origin: DeoptimizableEntity
	): ExpressionEntity | null {
		if (key === UnknownKey) {
			return UNKNOWN_EXPRESSION;
		}
		const expression = this.getMemberExpression(key);
		if (expression !== UNKNOWN_EXPRESSION) {
			const expressionsToBeDeoptimized = (this.expressionsToBeDeoptimizedByKey[key] =
				this.expressionsToBeDeoptimizedByKey[key] || []);
			expressionsToBeDeoptimized.push(origin);
		}
		return expression;
	}
}
