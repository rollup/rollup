import MagicString from 'magic-string';
import { RenderOptions } from '../../utils/renderHelpers';
import { CallOptions, NO_ARGS } from '../CallOptions';
import { DeoptimizableEntity } from '../DeoptimizableEntity';
import { HasEffectsContext } from '../ExecutionContext';
import {
	EMPTY_PATH,
	ObjectPath,
	PathTracker,
	SHARED_RECURSION_TRACKER,
	UnknownKey
} from '../utils/PathTracker';
import { LiteralValueOrUnknown, UNKNOWN_EXPRESSION } from '../values';
import * as NodeType from './NodeType';
import { ExpressionEntity } from './shared/Expression';
import { ExpressionNode, NodeBase } from './shared/Node';

export default class Property extends NodeBase implements DeoptimizableEntity {
	computed!: boolean;
	key!: ExpressionNode;
	kind!: 'init' | 'get' | 'set';
	method!: boolean;
	shorthand!: boolean;
	type!: NodeType.tProperty;
	value!: ExpressionNode;

	private accessorCallOptions!: CallOptions;
	private declarationInit: ExpressionEntity | null = null;
	private returnExpression: ExpressionEntity | null = null;

	bind() {
		super.bind();
		if (this.kind === 'get') {
			// ensure the returnExpression is set for the tree-shaking passes
			this.getReturnExpression();
		}
		if (this.declarationInit !== null) {
			this.declarationInit.deoptimizePath([UnknownKey, UnknownKey]);
		}
	}

	declare(kind: string, init: ExpressionEntity) {
		this.declarationInit = init;
		return this.value.declare(kind, UNKNOWN_EXPRESSION);
	}

	// As getter properties directly receive their values from function expressions that always
	// have a fixed return value, there is no known situation where a getter is deoptimized.
	deoptimizeCache(): void {}

	deoptimizePath(path: ObjectPath) {
		if (this.kind === 'get') {
			this.getReturnExpression().deoptimizePath(path);
		} else {
			this.value.deoptimizePath(path);
		}
	}

	getLiteralValueAtPath(
		path: ObjectPath,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): LiteralValueOrUnknown {
		if (this.kind === 'get') {
			return this.getReturnExpression().getLiteralValueAtPath(path, recursionTracker, origin);
		}
		return this.value.getLiteralValueAtPath(path, recursionTracker, origin);
	}

	getReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): ExpressionEntity {
		if (this.kind === 'get') {
			return this.getReturnExpression().getReturnExpressionWhenCalledAtPath(
				path,
				recursionTracker,
				origin
			);
		}
		return this.value.getReturnExpressionWhenCalledAtPath(path, recursionTracker, origin);
	}

	hasEffects(context: HasEffectsContext): boolean {
		return this.key.hasEffects(context) || this.value.hasEffects(context);
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, context: HasEffectsContext): boolean {
		if (this.kind === 'get') {
			const trackedExpressions = context.accessed.getEntities(path);
			if (trackedExpressions.has(this)) return false;
			trackedExpressions.add(this);
			return (
				this.value.hasEffectsWhenCalledAtPath(EMPTY_PATH, this.accessorCallOptions, context) ||
				(path.length > 0 && this.returnExpression!.hasEffectsWhenAccessedAtPath(path, context))
			);
		}
		return this.value.hasEffectsWhenAccessedAtPath(path, context);
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, context: HasEffectsContext): boolean {
		if (this.kind === 'get') {
			const trackedExpressions = context.assigned.getEntities(path);
			if (trackedExpressions.has(this)) return false;
			trackedExpressions.add(this);
			return this.returnExpression!.hasEffectsWhenAssignedAtPath(path, context);
		}
		if (this.kind === 'set') {
			const trackedExpressions = context.assigned.getEntities(path);
			if (trackedExpressions.has(this)) return false;
			trackedExpressions.add(this);
			return this.value.hasEffectsWhenCalledAtPath(EMPTY_PATH, this.accessorCallOptions, context);
		}
		return this.value.hasEffectsWhenAssignedAtPath(path, context);
	}

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		context: HasEffectsContext
	) {
		if (this.kind === 'get') {
			const trackedExpressions = (callOptions.withNew
				? context.instantiated
				: context.called
			).getEntities(path, callOptions);
			if (trackedExpressions.has(this)) return false;
			trackedExpressions.add(this);
			return this.returnExpression!.hasEffectsWhenCalledAtPath(path, callOptions, context);
		}
		return this.value.hasEffectsWhenCalledAtPath(path, callOptions, context);
	}

	initialise() {
		this.accessorCallOptions = {
			args: NO_ARGS,
			withNew: false
		};
	}

	render(code: MagicString, options: RenderOptions) {
		if (!this.shorthand) {
			this.key.render(code, options);
		}
		this.value.render(code, options, { isShorthandProperty: this.shorthand });
	}

	private getReturnExpression(): ExpressionEntity {
		if (this.returnExpression === null) {
			this.returnExpression = UNKNOWN_EXPRESSION;
			return (this.returnExpression = this.value.getReturnExpressionWhenCalledAtPath(
				EMPTY_PATH,
				SHARED_RECURSION_TRACKER,
				this
			));
		}
		return this.returnExpression;
	}
}
