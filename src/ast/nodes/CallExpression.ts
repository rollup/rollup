import CallOptions from '../CallOptions';
import ExecutionPathOptions from '../ExecutionPathOptions';
import SpreadElement from './SpreadElement';
import { isIdentifier } from './Identifier';
import { ForEachReturnExpressionCallback, SomeReturnExpressionCallback } from './shared/Expression';
import { isNamespaceVariable } from '../variables/NamespaceVariable';
import { NodeType } from './NodeType';
import { ExpressionNode, NodeBase } from './shared/Node';
import { ObjectPath } from '../values';

export default class CallExpression extends NodeBase {
	type: NodeType.CallExpression;
	callee: ExpressionNode;
	arguments: (ExpressionNode | SpreadElement)[];

	private callOptions: CallOptions;

	bind() {
		super.bind();
		if (isIdentifier(this.callee)) {
			const variable = this.scope.findVariable(this.callee.name);

			if (isNamespaceVariable(variable)) {
				this.module.error(
					{
						code: 'CANNOT_CALL_NAMESPACE',
						message: `Cannot call a namespace ('${this.callee.name}')`
					},
					this.start
				);
			}

			if (this.callee.name === 'eval') {
				this.module.warn(
					{
						code: 'EVAL',
						message: `Use of eval is strongly discouraged, as it poses security risks and may cause issues with minification`,
						url: 'https://github.com/rollup/rollup/wiki/Troubleshooting#avoiding-eval'
					},
					this.start
				);
			}
		}
	}

	forEachReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		callback: ForEachReturnExpressionCallback,
		options: ExecutionPathOptions
	) {
		this.callee.forEachReturnExpressionWhenCalledAtPath(
			[],
			this.callOptions,
			innerOptions => node =>
				node.forEachReturnExpressionWhenCalledAtPath(path, callOptions, callback, innerOptions),
			options
		);
	}

	hasEffects(options: ExecutionPathOptions): boolean {
		for (const argument of this.arguments) {
			if (argument.hasEffects(options)) return true;
		}
		return this.callee.hasEffectsWhenCalledAtPath(
			[],
			this.callOptions,
			options.getHasEffectsWhenCalledOptions()
		);
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, options: ExecutionPathOptions): boolean {
		return (
			path.length > 0 &&
			!options.hasReturnExpressionBeenAccessedAtPath(path, this) &&
			this.callee.someReturnExpressionWhenCalledAtPath(
				[],
				this.callOptions,
				innerOptions => node =>
					node.hasEffectsWhenAccessedAtPath(
						path,
						innerOptions.addAccessedReturnExpressionAtPath(path, this)
					),
				options
			)
		);
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, options: ExecutionPathOptions): boolean {
		return (
			!options.hasReturnExpressionBeenAssignedAtPath(path, this) &&
			this.callee.someReturnExpressionWhenCalledAtPath(
				[],
				this.callOptions,
				innerOptions => node =>
					node.hasEffectsWhenAssignedAtPath(
						path,
						innerOptions.addAssignedReturnExpressionAtPath(path, this)
					),
				options
			)
		);
	}

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		options: ExecutionPathOptions
	): boolean {
		return (
			!options.hasReturnExpressionBeenCalledAtPath(path, this) &&
			this.callee.someReturnExpressionWhenCalledAtPath(
				[],
				this.callOptions,
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

	initialise() {
		this.callOptions = CallOptions.create({
			withNew: false,
			args: this.arguments,
			callIdentifier: this
		});
	}

	reassignPath(path: ObjectPath, options: ExecutionPathOptions) {
		!options.hasReturnExpressionBeenAssignedAtPath(path, this) &&
			this.callee.forEachReturnExpressionWhenCalledAtPath(
				[],
				this.callOptions,
				innerOptions => node =>
					node.reassignPath(path, innerOptions.addAssignedReturnExpressionAtPath(path, this)),
				options
			);
	}

	someReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		predicateFunction: SomeReturnExpressionCallback,
		options: ExecutionPathOptions
	): boolean {
		return this.callee.someReturnExpressionWhenCalledAtPath(
			[],
			this.callOptions,
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
