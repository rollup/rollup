import Node from '../Node.js';
import disallowIllegalReassignment from './shared/disallowIllegalReassignment.js';
import isUsedByBundle from './shared/isUsedByBundle.js';
import { NUMBER } from '../values.js';

export default class UpdateExpression extends Node {
	bind ( scope ) {
		let subject = this.argument;
		while ( this.argument.type === 'ParenthesizedExpression' ) subject = subject.expression;

		this.subject = subject;
		disallowIllegalReassignment( scope, this.argument );

		if ( subject.type === 'Identifier' ) {
			const declaration = scope.findDeclaration( subject.name );
			declaration.isReassigned = true;

			if ( declaration.possibleValues ) {
				declaration.possibleValues.add( NUMBER );
			}
		}

		super.bind( scope );
	}

	hasEffects ( scope ) {
		return isUsedByBundle( scope, this.subject );
	}

	initialise ( scope ) {
		this.module.bundle.dependentExpressions.push( this );
		super.initialise( scope );
	}

	isUsedByBundle () {
		return isUsedByBundle( this.findScope(), this.subject );
	}
}
