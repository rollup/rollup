import MagicString from 'magic-string';
import { RenderOptions } from '../../utils/renderHelpers';
import CallOptions from '../CallOptions';
import { ExecutionPathOptions } from '../ExecutionPathOptions';
import { ImmutableEntityPathTracker } from '../utils/ImmutableEntityPathTracker';
import { LiteralValueOrUnknown, ObjectPath, UNKNOWN_EXPRESSION, UNKNOWN_VALUE } from '../values';
import * as NodeType from './NodeType';
import {
	ExpressionEntity,
	ForEachReturnExpressionCallback,
	SomeReturnExpressionCallback
} from './shared/Expression';
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

	declare(kind: string, _init: ExpressionEntity | null) {
		this.value.declare(kind, UNKNOWN_EXPRESSION);
	}

	forEachReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		callback: ForEachReturnExpressionCallback
	) {
		if (this.kind === 'get') {
			this.value.forEachReturnExpressionWhenCalledAtPath([], this.accessorCallOptions, node =>
				node.forEachReturnExpressionWhenCalledAtPath(path, callOptions, callback)
			);
		} else {
			this.value.forEachReturnExpressionWhenCalledAtPath(path, callOptions, callback);
		}
	}

	getLiteralValueAtPath(
		path: ObjectPath,
		getValueTracker: ImmutableEntityPathTracker
	): LiteralValueOrUnknown {
		if (this.kind === 'get') {
			return UNKNOWN_VALUE;
		}
		return this.value.getLiteralValueAtPath(path, getValueTracker);
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
				(!options.hasReturnExpressionBeenAccessedAtPath(path, this) &&
					this.value.someReturnExpressionWhenCalledAtPath(
						[],
						this.accessorCallOptions,
						(innerOptions, node) =>
							node.hasEffectsWhenAccessedAtPath(
								path,
								innerOptions.addAccessedReturnExpressionAtPath(path, this)
							),
						options
					))
			);
		}
		return this.value.hasEffectsWhenAccessedAtPath(path, options);
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, options: ExecutionPathOptions): boolean {
		if (this.kind === 'get') {
			return (
				path.length === 0 ||
				this.value.someReturnExpressionWhenCalledAtPath(
					[],
					this.accessorCallOptions,
					(innerOptions, node) =>
						node.hasEffectsWhenAssignedAtPath(
							path,
							innerOptions.addAssignedReturnExpressionAtPath(path, this)
						),
					options
				)
			);
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
			return (
				this.value.hasEffectsWhenCalledAtPath(
					[],
					this.accessorCallOptions,
					options.getHasEffectsWhenCalledOptions()
				) ||
				(!options.hasReturnExpressionBeenCalledAtPath(path, this) &&
					this.value.someReturnExpressionWhenCalledAtPath(
						[],
						this.accessorCallOptions,
						(innerOptions, node) =>
							node.hasEffectsWhenCalledAtPath(
								path,
								callOptions,
								innerOptions.addCalledReturnExpressionAtPath(path, this)
							),
						options
					))
			);
		}
		return this.value.hasEffectsWhenCalledAtPath(path, callOptions, options);
	}

	initialise() {
		this.included = false;
		this.accessorCallOptions = CallOptions.create({
			withNew: false,
			callIdentifier: this
		});
	}

	reassignPath(path: ObjectPath) {
		if (this.kind === 'get') {
			if (path.length > 0 && !this.context.reassignmentTracker.track(this, path)) {
				this.value.forEachReturnExpressionWhenCalledAtPath([], this.accessorCallOptions, node =>
					node.reassignPath(path)
				);
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

	someReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		predicateFunction: SomeReturnExpressionCallback,
		options: ExecutionPathOptions
	): boolean {
		if (this.kind === 'get') {
			return (
				this.value.hasEffectsWhenCalledAtPath(
					[],
					this.accessorCallOptions,
					options.getHasEffectsWhenCalledOptions()
				) ||
				this.value.someReturnExpressionWhenCalledAtPath(
					[],
					this.accessorCallOptions,
					(innerOptions, node) =>
						node.someReturnExpressionWhenCalledAtPath(
							path,
							callOptions,
							predicateFunction,
							innerOptions
						),
					options
				)
			);
		}
		return this.value.someReturnExpressionWhenCalledAtPath(
			path,
			callOptions,
			predicateFunction,
			options
		);
	}
}
