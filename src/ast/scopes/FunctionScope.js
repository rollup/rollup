import ReturnValueScope from './ReturnValueScope';
import ArgumentsVariable from '../variables/ArgumentsVariable';
import ThisVariable from '../variables/ThisVariable';
import { UNKNOWN_ASSIGNMENT } from '../values';
import VirtualObjectExpression from '../nodes/shared/VirtualObjectExpression';

export default class FunctionScope extends ReturnValueScope {
	constructor ( options = {} ) {
		super( options );
		this.variables.arguments = new ArgumentsVariable( super.getParameterVariables() );
		this.variables.this = new ThisVariable();
	}

	findLexicalBoundary () {
		return this;
	}

	getOptionsWhenCalledWith ( { args, withNew }, options ) {
		return super.getOptionsWithReplacedParameters( args, options )
			.replaceVariableInit( this.variables.this, withNew ? new VirtualObjectExpression() : UNKNOWN_ASSIGNMENT )
			.setArgumentsVariables( args.map( ( parameter, index ) => super.getParameterVariables()[index] || parameter) );
	}
}
