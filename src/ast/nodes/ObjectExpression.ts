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
import SpreadElement from './SpreadElement';
import { ExpressionEntity, LiteralValueOrUnknown, UnknownValue } from './shared/Expression';
import { NodeBase } from './shared/Node';
import { ObjectEntity, ObjectProperty } from './shared/ObjectEntity';
import { OBJECT_PROTOTYPE } from './shared/ObjectPrototype';

export default class ObjectExpression extends NodeBase implements DeoptimizableEntity {
	declare properties: (Property | SpreadElement)[];
	declare type: NodeType.tObjectExpression;
	private objectEntity: ObjectEntity | null = null;

	deoptimizeCache(): void {
		this.getObjectEntity().deoptimizeAllProperties();
	}

	deoptimizePath(path: ObjectPath): void {
		this.getObjectEntity().deoptimizePath(path);
	}

	deoptimizeThisOnEventAtPath(
		event: NodeEvent,
		path: ObjectPath,
		thisParameter: ExpressionEntity,
		recursionTracker: PathTracker
	): void {
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

	hasEffectsWhenAccessedAtPath(path: ObjectPath, context: HasEffectsContext): boolean {
		return this.getObjectEntity().hasEffectsWhenAccessedAtPath(path, context);
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, context: HasEffectsContext): boolean {
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
		{ renderedSurroundingElement }: NodeRenderOptions = BLANK
	): void {
		super.render(code, options);
		if (
			renderedSurroundingElement === NodeType.ExpressionStatement ||
			renderedSurroundingElement === NodeType.ArrowFunctionExpression
		) {
			code.appendRight(this.start, '(');
			code.prependLeft(this.end, ')');
		}
	}

	private getObjectEntity(): ObjectEntity {
		if (this.objectEntity !== null) {
			return this.objectEntity;
		}
		let prototype: ExpressionEntity | null = OBJECT_PROTOTYPE;
		const properties: ObjectProperty[] = [];
		for (const property of this.properties) {
			if (property instanceof SpreadElement) {
				properties.push({ key: UnknownKey, kind: 'init', property });
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
					properties.push({ key: UnknownKey, kind: property.kind, property });
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
					prototype =
						property.value instanceof Literal && property.value.value === null
							? null
							: property.value;
					continue;
				}
			}
			properties.push({ key, kind: property.kind, property });
		}
		return (this.objectEntity = new ObjectEntity(properties, prototype));
	}
}
