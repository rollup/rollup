import Node from '../Node';
import CallOptions from '../CallOptions';
import { UNKNOWN_ASSIGNMENT, UnknownAssignment, UndefinedAssignment, PredicateFunction } from '../values';
import Literal from './Literal';
import Identifier from './Identifier';
import Expression from './Expression';
import ExecutionPathOptions from '../ExecutionPathOptions';
import Scope from '../scopes/Scope';
import Pattern from './Pattern';
import Declaration from './Declaration';
import MagicString from 'magic-string';

// this excludes the AssignmentProperty case
export interface StandardProperty extends Property {
	value: Expression;
};

export default class Property extends Node {
	type: 'Property';
	key: Literal | Identifier | Expression;
	value: Expression | Pattern;
	kind: 'init' | 'get' | 'set';
	method: boolean;
	shorthand: boolean;
	computed: boolean;

	private _accessorCallOptions: CallOptions;

	reassignPath (path: string[], options: ExecutionPathOptions) {
		if (this.kind === 'get') {
			path.length > 0 &&
				(<Expression>this.value).forEachReturnExpressionWhenCalledAtPath(
					[],
					this._accessorCallOptions,
					innerOptions => node =>
						node.reassignPath(
							path,
							innerOptions.addAssignedReturnExpressionAtPath(path, this)
						),
					options
				);
		} else if (this.kind !== 'set') {
			this.value.reassignPath(path, options);
		}
	}

	forEachReturnExpressionWhenCalledAtPath (
		path: string[],
		callOptions: CallOptions,
		callback: (options: ExecutionPathOptions) => (node: Node) => void,
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

	hasEffectsWhenAccessedAtPath (path: string[], options: ExecutionPathOptions): boolean {
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

	hasEffectsWhenAssignedAtPath (path: string[], options: ExecutionPathOptions): boolean {
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

	hasEffectsWhenCalledAtPath (path: string[], callOptions: CallOptions, options: ExecutionPathOptions) {
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

	initialiseAndDeclare (parentScope: Scope, kind: string, init: Declaration | Expression | UnknownAssignment | UndefinedAssignment | null) {
		this.initialiseScope(parentScope);
		this.initialiseNode(parentScope);
		this.key.initialise(parentScope);
		this.value.initialiseAndDeclare(parentScope, kind, UNKNOWN_ASSIGNMENT);
	}

	initialiseNode () {
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
		path: string[],
		callOptions: CallOptions,
		predicateFunction: (options: ExecutionPathOptions) => PredicateFunction,
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
