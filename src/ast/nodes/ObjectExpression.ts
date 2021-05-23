import MagicString from 'magic-string';
import { BLANK } from '../../utils/blank';
import { NodeRenderOptions, RenderOptions } from '../../utils/renderHelpers';
import { CallOptions } from '../CallOptions';
import { DeoptimizableEntity } from '../DeoptimizableEntity';
import { HasEffectsContext } from '../ExecutionContext';
import { NodeEvent } from '../NodeEvents';
import {
	EMPTY_PATH,
	ObjectPath,
	PathTracker,
	SHARED_RECURSION_TRACKER,
	UnknownKey
} from '../utils/PathTracker';
import Identifier from './Identifier';
import Literal from './Literal';
import * as NodeType from './NodeType';
import Property from './Property';
import {
	ExpressionEntity,
	LiteralValueOrUnknown,
	UnknownValue,
	UNKNOWN_EXPRESSION
} from './shared/Expression';
import { NodeBase } from './shared/Node';
import { ObjectEntity, ObjectProperty } from './shared/ObjectEntity';
import { OBJECT_PROTOTYPE } from './shared/ObjectPrototype';
import SpreadElement from './SpreadElement';

export default class ObjectExpression extends NodeBase implements DeoptimizableEntity {
	properties!: (Property | SpreadElement)[];
	type!: NodeType.tObjectExpression;
	private objectEntity: ObjectEntity | null = null;

	deoptimizeCache() {
		this.getObjectEntity().deoptimizeAllProperties();
	}

	deoptimizePath(path: ObjectPath) {
		this.getObjectEntity().deoptimizePath(path);
	}

	deoptimizeThisOnEventAtPath(
		event: NodeEvent,
		path: ObjectPath,
		thisParameter: ExpressionEntity,
		recursionTracker: PathTracker
	) {
		this.getObjectEntity().deoptimizeThisOnEventAtPath(
			event,
			path,
			thisParameter,
			recursionTracker
		);
	}

	getLiteralValueAtPath(
		path: ObjectPath,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): LiteralValueOrUnknown {
		return this.getObjectEntity().getLiteralValueAtPath(path, recursionTracker, origin);
	}

	getReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): ExpressionEntity {
		return this.getObjectEntity().getReturnExpressionWhenCalledAtPath(
			path,
			callOptions,
			recursionTracker,
			origin
		);
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, context: HasEffectsContext) {
		return this.getObjectEntity().hasEffectsWhenAccessedAtPath(path, context);
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, context: HasEffectsContext) {
		return this.getObjectEntity().hasEffectsWhenAssignedAtPath(path, context);
	}

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		context: HasEffectsContext
	): boolean {
		return this.getObjectEntity().hasEffectsWhenCalledAtPath(path, callOptions, context);
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

	private getObjectEntity(): ObjectEntity {
		if (this.objectEntity !== null) {
			return this.objectEntity;
		}
		const properties: ObjectProperty[] = [];
		for (const property of this.properties) {
			if (property instanceof SpreadElement) {
				properties.push({ kind: 'init', key: UnknownKey, property });
				continue;
			}
			let key: string;
			if (property.computed) {
				const keyValue = property.key.getLiteralValueAtPath(
					EMPTY_PATH,
					SHARED_RECURSION_TRACKER,
					this
				);
				if (keyValue === UnknownValue) {
					properties.push({ kind: property.kind, key: UnknownKey, property });
					continue;
				} else {
					key = String(keyValue);
				}
			} else {
				key =
					property.key instanceof Identifier
						? property.key.name
						: String((property.key as Literal).value);
				if (key === '__proto__' && property.kind === 'init') {
					properties.unshift({ kind: 'init', key: UnknownKey, property: UNKNOWN_EXPRESSION });
					continue;
				}
			}
			properties.push({ kind: property.kind, key, property });
		}
		return (this.objectEntity = new ObjectEntity(properties, OBJECT_PROTOTYPE));
	}
}
