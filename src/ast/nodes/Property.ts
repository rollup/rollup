import { NodeBase, Node, ExpressionNode } from './shared/Node';
import CallOptions from '../CallOptions';
import { UNKNOWN_EXPRESSION } from '../values';
import ExecutionPathOptions from '../ExecutionPathOptions';
import Scope from '../scopes/Scope';
import MagicString from 'magic-string';
import { ObjectPath } from '../variables/VariableReassignmentTracker';
import { ExpressionEntity, ForEachReturnExpressionCallback, SomeReturnExpressionCallback } from './shared/Expression';
import { NodeType } from './NodeType';

export function isProperty (node: Node): node is Property {
	return node.type === NodeType.Property;
}

export default class Property extends NodeBase {
	type: NodeType.Property;
	key: ExpressionNode;
	value: ExpressionNode;
	kind: 'init' | 'get' | 'set';
	method: boolean;
	shorthand: boolean;
	computed: boolean;

	private _accessorCallOptions: CallOptions;

	reassignPath (path: ObjectPath, options: ExecutionPathOptions) {
		if (this.kind === 'get') {
			path.length > 0 &&
			this.value.forEachReturnExpressionWhenCalledAtPath(
				[],
				this._accessorCallOptions,
				innerOptions => node =>
					node.reassignPath(
						path, innerOptions.addAssignedReturnExpressionAtPath(path, this)
					),
				options
			);
		} else if (this.kind !== 'set') {
			this.value.reassignPath(path, options);
		}
	}

	forEachReturnExpressionWhenCalledAtPath (
		path: ObjectPath,
		callOptions: CallOptions,
		callback: ForEachReturnExpressionCallback,
		options: ExecutionPathOptions
	) {
		if (this.kind === 'get') {
			this.value.forEachReturnExpressionWhenCalledAtPath(
				[],
				this._accessorCallOptions,
				innerOptions => node =>
					node.forEachReturnExpressionWhenCalledAtPath(
						path,
						callOptions,
						callback,
						innerOptions
					),
				options
			);
		} else {
			this.value.forEachReturnExpressionWhenCalledAtPath(
				path,
				callOptions,
				callback,
				options
			);
		}
	}

	hasEffects (options: ExecutionPathOptions): boolean {
		return this.key.hasEffects(options) || this.value.hasEffects(options);
	}

	hasEffectsWhenAccessedAtPath (path: ObjectPath, options: ExecutionPathOptions): boolean {
		if (this.kind === 'get') {
			return (
				this.value.hasEffectsWhenCalledAtPath(
					[],
					this._accessorCallOptions,
					options.getHasEffectsWhenCalledOptions()
				) ||
				(!options.hasReturnExpressionBeenAccessedAtPath(path, this) &&
				 this.value.someReturnExpressionWhenCalledAtPath(
					 [],
					 this._accessorCallOptions,
					 innerOptions => node =>
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

	hasEffectsWhenAssignedAtPath (path: ObjectPath, options: ExecutionPathOptions): boolean {
		if (this.kind === 'get') {
			return (
				path.length === 0 ||
				this.value.someReturnExpressionWhenCalledAtPath(
					[],
					this._accessorCallOptions,
					innerOptions => node =>
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
					this._accessorCallOptions,
					options.getHasEffectsWhenCalledOptions()
				)
			);
		}
		return this.value.hasEffectsWhenAssignedAtPath(path, options);
	}

	hasEffectsWhenCalledAtPath (path: ObjectPath, callOptions: CallOptions, options: ExecutionPathOptions) {
		if (this.kind === 'get') {
			return (
				this.value.hasEffectsWhenCalledAtPath(
					[],
					this._accessorCallOptions,
					options.getHasEffectsWhenCalledOptions()
				) ||
				(!options.hasReturnExpressionBeenCalledAtPath(path, this) &&
				 this.value.someReturnExpressionWhenCalledAtPath(
					 [],
					 this._accessorCallOptions,
					 innerOptions => node =>
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

	initialiseAndDeclare (parentScope: Scope, kind: string, _init: ExpressionEntity | null) {
		this.initialiseScope(parentScope);
		this.initialiseNode(parentScope);
		this.key.initialise(parentScope);
		this.value.initialiseAndDeclare(parentScope, kind, UNKNOWN_EXPRESSION);
	}

	initialiseNode (_parentScope: Scope) {
		this._accessorCallOptions = CallOptions.create({
			withNew: false,
			caller: this
		});
	}

	render (code: MagicString, es: boolean) {
		if (!this.shorthand) {
			this.key.render(code, es);
		}
		this.value.render(code, es);
	}

	someReturnExpressionWhenCalledAtPath (
		path: ObjectPath,
		callOptions: CallOptions,
		predicateFunction: SomeReturnExpressionCallback,
		options: ExecutionPathOptions
	): boolean {
		if (this.kind === 'get') {
			return (
				this.value.hasEffectsWhenCalledAtPath(
					[],
					this._accessorCallOptions,
					options.getHasEffectsWhenCalledOptions()
				) ||
				this.value.someReturnExpressionWhenCalledAtPath(
					[],
					this._accessorCallOptions,
					innerOptions => node =>
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
