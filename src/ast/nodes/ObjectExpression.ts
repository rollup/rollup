import MagicString from 'magic-string';
import { BLANK } from '../../utils/blank';
import { NodeRenderOptions, RenderOptions } from '../../utils/renderHelpers';
import { CallOptions } from '../CallOptions';
import { DeoptimizableEntity } from '../DeoptimizableEntity';
import { HasEffectsContext } from '../ExecutionContext';
import { getObjectPathHandler, ObjectPathHandler, PropertyMap } from '../utils/ObjectPathHandler';
import {
	EMPTY_PATH,
	ObjectPath,
	PathTracker,
	SHARED_RECURSION_TRACKER
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

export default class ObjectExpression extends NodeBase implements DeoptimizableEntity {
	properties!: (Property | SpreadElement)[];
	type!: NodeType.tObjectExpression;

	private expressionsToBeDeoptimizedByKey = new Map<string, DeoptimizableEntity[]>();
	private objectPathHandler: ObjectPathHandler | null = null;

	deoptimizeCache() {
		this.getObjectPathHandler().deoptimizeCache();
	}

	deoptimizePath(path: ObjectPath) {
		this.getObjectPathHandler().deoptimizePath(path);
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
		const expressionAtPath = this.getObjectPathHandler().getMemberExpressionAndTrackDeopt(
			key,
			origin
		);
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
		const expressionAtPath = this.getObjectPathHandler().getMemberExpressionAndTrackDeopt(
			key,
			origin
		);
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

	hasEffectsWhenAccessedAtPath(path: ObjectPath, context: HasEffectsContext) {
		if (path.length === 0) {
			return false;
		}
		const key = path[0];
		const expressionAtPath = this.getObjectPathHandler().getMemberExpression(key);
		if (expressionAtPath) {
			return expressionAtPath.hasEffectsWhenAccessedAtPath(path.slice(1), context);
		}
		return path.length > 1;
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, context: HasEffectsContext) {
		return this.getObjectPathHandler().hasEffectsWhenAssignedAtPath(path, context);
	}

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		context: HasEffectsContext
	): boolean {
		const key = path[0];
		const expressionAtPath = this.getObjectPathHandler().getMemberExpression(key);
		if (expressionAtPath) {
			return expressionAtPath.hasEffectsWhenCalledAtPath(path.slice(1), callOptions, context);
		}
		if (path.length > 1) {
			return true;
		}
		return hasMemberEffectWhenCalled(objectMembers, key, this.included, callOptions, context);
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
		const expressionAtPath = this.getObjectPathHandler().getMemberExpressionAndTrackDeopt(
			key,
			origin
		);
		if (expressionAtPath) {
			return expressionAtPath.mayModifyThisWhenCalledAtPath(
				path.slice(1),
				recursionTracker,
				origin
			);
		}
		return false;
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

	private getObjectPathHandler(): ObjectPathHandler {
		if (this.objectPathHandler !== null) {
			return this.objectPathHandler;
		}
		const propertyMap: PropertyMap = Object.create(null);
		const unmatchablePropertiesRead: ExpressionEntity[] = [];
		const unmatchablePropertiesWrite: ExpressionEntity[] = [];
		for (let index = this.properties.length - 1; index >= 0; index--) {
			const property = this.properties[index];
			if (property instanceof SpreadElement) {
				unmatchablePropertiesRead.push(property);
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
					unmatchablePropertiesRead.push(property);
				} else {
					unmatchablePropertiesWrite.push(property);
				}
				continue;
			}
			const propertyMapProperty = propertyMap[key];
			if (!propertyMapProperty) {
				propertyMap[key] = {
					exactMatchRead: isRead ? property : null,
					exactMatchWrite: isWrite ? property : null,
					propertiesRead: isRead ? [property, ...unmatchablePropertiesRead] : [],
					propertiesWrite: isWrite && !isRead ? [property, ...unmatchablePropertiesWrite] : []
				};
				continue;
			}
			if (isRead && propertyMapProperty.exactMatchRead === null) {
				propertyMapProperty.exactMatchRead = property;
				propertyMapProperty.propertiesRead.push(property, ...unmatchablePropertiesRead);
			}
			if (isWrite && propertyMapProperty.exactMatchWrite === null) {
				propertyMapProperty.exactMatchWrite = property;
				if (!isRead) {
					propertyMapProperty.propertiesWrite.push(property, ...unmatchablePropertiesWrite);
				}
			}
		}
		return (this.objectPathHandler = getObjectPathHandler(
			propertyMap,
			unmatchablePropertiesRead,
			unmatchablePropertiesWrite,
			this.properties,
			this.expressionsToBeDeoptimizedByKey
		));
	}
}
