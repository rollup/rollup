import Node from '../Node';
import Scope from '../scopes/Scope';
import ReturnValueScope from '../scopes/ReturnValueScope';
import BlockStatement from './BlockStatement';
import Pattern from './Pattern';
import Expression from './Expression';
import CallOptions from '../CallOptions';
import ExecutionPathOptions from '../ExecutionPathOptions';

export default class ArrowFunctionExpression extends Node {
	type: 'ArrowFunctionExpression';
	body: BlockStatement | Expression;
	params: Pattern[];
	scope: ReturnValueScope;

	bindNode () {
		(<BlockStatement>this.body).bindImplicitReturnExpressionToScope
			? (<BlockStatement>this.body).bindImplicitReturnExpressionToScope()
			: this.scope.addReturnExpression(this.body);
	}

	forEachReturnExpressionWhenCalledAtPath (path: string[], callOptions: CallOptions, callback, options: ExecutionPathOptions) {
		path.length === 0 &&
			this.scope.forEachReturnExpressionWhenCalled(callOptions, callback, options);
	}

	hasEffects () {
		return false;
	}

	hasEffectsWhenAccessedAtPath (path: string[]) {
		return path.length > 1;
	}

	hasEffectsWhenAssignedAtPath (path: string[]) {
		return path.length > 1;
	}

	hasEffectsWhenCalledAtPath (path: string[], callOptions: CallOptions, options: ExecutionPathOptions): boolean {
		if (path.length > 0) {
			return true;
		}
		return (
			this.params.some(param => param.hasEffects(options)) ||
			this.body.hasEffects(options)
		);
	}

	initialiseChildren () {
		this.params.forEach(param =>
			param.initialiseAndDeclare(this.scope, 'parameter')
		);
		if (this.body.initialiseAndReplaceScope) {
			this.body.initialiseAndReplaceScope(new Scope({ parent: this.scope }));
		} else {
			this.body.initialise(this.scope);
		}
	}

	initialiseScope (parentScope: Scope) {
		this.scope = new ReturnValueScope({ parent: parentScope });
	}

	someReturnExpressionWhenCalledAtPath (path: string[], callOptions: CallOptions, predicateFunction, options: ExecutionPathOptions) {
		return (
			path.length > 0 ||
			this.scope.someReturnExpressionWhenCalled(
				callOptions,
				predicateFunction,
				options
			)
		);
	}
}
