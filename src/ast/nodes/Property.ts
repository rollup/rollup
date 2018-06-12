import MagicString from 'magic-string';
import { RenderOptions } from '../../utils/renderHelpers';
import CallOptions from '../CallOptions';
import { ExecutionPathOptions } from '../ExecutionPathOptions';
import {
	EMPTY_IMMUTABLE_TRACKER,
	ImmutableEntityPathTracker
} from '../utils/ImmutableEntityPathTracker';
import { EMPTY_PATH, LiteralValueOrUnknown, ObjectPath, UNKNOWN_EXPRESSION } from '../values';
import * as NodeType from './NodeType';
import { ExpressionEntity } from './shared/Expression';
import { ExpressionNode, NodeBase } from './shared/Node';

export default class Property extends NodeBase {
	type: NodeType.tProperty;
	key: ExpressionNode;
	value: ExpressionNode;
	kind: 'init' | 'get' | 'set';
	method: boolean;
	shorthand: boolean;
	computed: boolean;

	private accessorCallOptions: CallOptions;
	private returnExpression: ExpressionEntity | null;

	bind() {
		super.bind();
		if (this.kind === 'get' && this.returnExpression === null) {
			this.returnExpression = this.value.getReturnExpressionWhenCalledAtPath(
				EMPTY_PATH,
				EMPTY_IMMUTABLE_TRACKER
			);
		}
	}

	declare(kind: string, _init: ExpressionEntity | null) {
		this.value.declare(kind, UNKNOWN_EXPRESSION);
	}

	getLiteralValueAtPath(
		path: ObjectPath,
		recursionTracker: ImmutableEntityPathTracker
	): LiteralValueOrUnknown {
		if (this.kind === 'get') {
			if (this.returnExpression === null) {
				this.returnExpression = this.value.getReturnExpressionWhenCalledAtPath(
					EMPTY_PATH,
					EMPTY_IMMUTABLE_TRACKER
				);
			}
			return this.returnExpression.getLiteralValueAtPath(path, recursionTracker);
		}
		return this.value.getLiteralValueAtPath(path, recursionTracker);
	}

	getReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		recursionTracker: ImmutableEntityPathTracker
	): ExpressionEntity {
		if (this.kind === 'set') {
			return UNKNOWN_EXPRESSION;
		}
		if (this.kind === 'get') {
			if (this.returnExpression === null) {
				this.returnExpression = this.value.getReturnExpressionWhenCalledAtPath(
					EMPTY_PATH,
					EMPTY_IMMUTABLE_TRACKER
				);
			}
			return this.returnExpression.getReturnExpressionWhenCalledAtPath(path, recursionTracker);
		}
		return this.value.getReturnExpressionWhenCalledAtPath(path, recursionTracker);
	}

	hasEffects(options: ExecutionPathOptions): boolean {
		return this.key.hasEffects(options) || this.value.hasEffects(options);
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, options: ExecutionPathOptions): boolean {
		if (this.kind === 'get') {
			return (
				this.value.hasEffectsWhenCalledAtPath(
					[],
					this.accessorCallOptions,
					options.getHasEffectsWhenCalledOptions()
				) ||
				(path.length > 0 && this.returnExpression.hasEffectsWhenAccessedAtPath(path, options))
			);
		}
		return this.value.hasEffectsWhenAccessedAtPath(path, options);
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, options: ExecutionPathOptions): boolean {
		if (this.kind === 'get') {
			return path.length === 0 || this.returnExpression.hasEffectsWhenAssignedAtPath(path, options);
		}
		if (this.kind === 'set') {
			return (
				path.length > 0 ||
				this.value.hasEffectsWhenCalledAtPath(
					[],
					this.accessorCallOptions,
					options.getHasEffectsWhenCalledOptions()
				)
			);
		}
		return this.value.hasEffectsWhenAssignedAtPath(path, options);
	}

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		options: ExecutionPathOptions
	) {
		if (this.kind === 'get') {
			return this.returnExpression.hasEffectsWhenCalledAtPath(path, callOptions, options);
		}
		return this.value.hasEffectsWhenCalledAtPath(path, callOptions, options);
	}

	initialise() {
		this.included = false;
		this.returnExpression = null;
		this.accessorCallOptions = CallOptions.create({
			withNew: false,
			callIdentifier: this
		});
	}

	reassignPath(path: ObjectPath) {
		if (this.kind === 'get') {
			if (path.length > 0) {
				if (this.returnExpression === null) {
					this.returnExpression = this.value.getReturnExpressionWhenCalledAtPath(
						EMPTY_PATH,
						EMPTY_IMMUTABLE_TRACKER
					);
				}
				this.returnExpression.reassignPath(path);
			}
		} else if (this.kind !== 'set') {
			this.value.reassignPath(path);
		}
	}

	render(code: MagicString, options: RenderOptions) {
		if (!this.shorthand) {
			this.key.render(code, options);
		}
		this.value.render(code, options);
	}
}
