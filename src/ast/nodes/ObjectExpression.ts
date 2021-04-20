import MagicString from 'magic-string';
import { BLANK } from '../../utils/blank';
import { NodeRenderOptions, RenderOptions } from '../../utils/renderHelpers';
import { CallOptions } from '../CallOptions';
import { DeoptimizableEntity } from '../DeoptimizableEntity';
import { HasEffectsContext } from '../ExecutionContext';
import {
	getObjectPathHandler,
	ObjectPathHandler,
	ObjectProperty
} from '../utils/ObjectPathHandler';
import {
	EMPTY_PATH,
	ObjectPath,
	PathTracker,
	SHARED_RECURSION_TRACKER,
	UnknownKey
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

	// TODO Lukas Instead of resolved keys, push expressions as keys to further move logic out of here
	private getObjectPathHandler(): ObjectPathHandler {
		if (this.objectPathHandler !== null) {
			return this.objectPathHandler;
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
				// TODO Lukas how would setters and getters for __proto__ behave, ok to ignore them?
				if (key === '__proto__' && property.kind === 'init') {
					properties.unshift({ kind: 'init', key: UnknownKey, property: UNKNOWN_EXPRESSION });
					continue;
				}
			}
			properties.push({ kind: property.kind, key, property });
		}
		return (this.objectPathHandler = getObjectPathHandler(properties));
	}
}
