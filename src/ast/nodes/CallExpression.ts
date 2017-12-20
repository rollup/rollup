import Node from '../Node';
import CallOptions from '../CallOptions';
import Expression from './Expression';
import ExecutionPathOptions from '../ExecutionPathOptions';
import SpreadElement from './SpreadElement';

export default class CallExpression extends Node {
	type: 'CallExpression';
	callee: Expression;
	arguments: (Expression | SpreadElement)[];

	private _callOptions: CallOptions;

	reassignPath (path: string[], options: ExecutionPathOptions) {
		!options.hasReturnExpressionBeenAssignedAtPath(path, this) &&
			this.callee.forEachReturnExpressionWhenCalledAtPath(
				[],
				this._callOptions,
				(innerOptions: ExecutionPathOptions) => (node: Node) =>
					node.reassignPath(
						path,
						innerOptions.addAssignedReturnExpressionAtPath(path, this)
					),
				options
			);
	}

	bindNode () {
		if (this.callee.type === 'Identifier') {
			const variable = this.scope.findVariable(this.callee.name);

			if (variable.isNamespace) {
				this.module.error(
					{
						code: 'CANNOT_CALL_NAMESPACE',
						message: `Cannot call a namespace ('${this.callee.name}')`
					},
					this.start
				);
			}

			if (this.callee.name === 'eval' && variable.isGlobal) {
				this.module.warn(
					{
						code: 'EVAL',
						message: `Use of eval is strongly discouraged, as it poses security risks and may cause issues with minification`,
						url:
							'https://github.com/rollup/rollup/wiki/Troubleshooting#avoiding-eval'
					},
					this.start
				);
			}
		}
	}

	forEachReturnExpressionWhenCalledAtPath (
		path: string[],
		callOptions: CallOptions,
		callback,
		options: ExecutionPathOptions
	) {
		this.callee.forEachReturnExpressionWhenCalledAtPath(
			[],
			this._callOptions,
			innerOptions => node =>
				node.forEachReturnExpressionWhenCalledAtPath(
					path,
					callOptions,
					callback,
					innerOptions
				),
			options
		);
	}

	hasEffects (options: ExecutionPathOptions): boolean {
		return (
			this.arguments.some(child => child.hasEffects(options)) ||
			this.callee.hasEffectsWhenCalledAtPath(
				[],
				this._callOptions,
				options.getHasEffectsWhenCalledOptions()
			)
		);
	}

	hasEffectsWhenAccessedAtPath (path: string[], options: ExecutionPathOptions): boolean {
		return (
			path.length > 0 &&
			!options.hasReturnExpressionBeenAccessedAtPath(path, this) &&
			this.callee.someReturnExpressionWhenCalledAtPath(
				[],
				this._callOptions,
				innerOptions => node =>
					node.hasEffectsWhenAccessedAtPath(
						path,
						innerOptions.addAccessedReturnExpressionAtPath(path, this)
					),
				options
			)
		);
	}

	hasEffectsWhenAssignedAtPath (path: string[], options: ExecutionPathOptions): boolean {
		return (
			!options.hasReturnExpressionBeenAssignedAtPath(path, this) &&
			this.callee.someReturnExpressionWhenCalledAtPath(
				[],
				this._callOptions,
				innerOptions => node =>
					node.hasEffectsWhenAssignedAtPath(
						path,
						innerOptions.addAssignedReturnExpressionAtPath(path, this)
					),
				options
			)
		);
	}

	hasEffectsWhenCalledAtPath (path: string[], callOptions: CallOptions, options: ExecutionPathOptions) {
		return (
			!options.hasReturnExpressionBeenCalledAtPath(path, this) &&
			this.callee.someReturnExpressionWhenCalledAtPath(
				[],
				this._callOptions,
				innerOptions => node =>
					node.hasEffectsWhenCalledAtPath(
						path,
						callOptions,
						innerOptions.addCalledReturnExpressionAtPath(path, this)
					),
				options
			)
		);
	}

	initialiseNode () {
		this._callOptions = CallOptions.create({
			withNew: false,
			args: this.arguments,
			caller: this
		});
	}

	someReturnExpressionWhenCalledAtPath (
		path: string[],
		callOptions: CallOptions,
		predicateFunction,
		options: ExecutionPathOptions
	) {
		return this.callee.someReturnExpressionWhenCalledAtPath(
			[],
			this._callOptions,
			innerOptions => node =>
				node.someReturnExpressionWhenCalledAtPath(
					path,
					callOptions,
					predicateFunction,
					innerOptions
				),
			options
		);
	}
}
