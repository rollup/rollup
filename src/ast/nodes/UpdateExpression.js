import Node from '../Node.js';
import disallowIllegalReassignment from './shared/disallowIllegalReassignment.js';
import isUsedByBundle from './shared/isUsedByBundle.js';
import { NUMBER } from '../values.js';

export default class UpdateExpression extends Node {
	bind () {
		const subject = this.argument;

		this.subject = subject;
		disallowIllegalReassignment( this.scope, this.argument );

		if ( subject.type === 'Identifier' ) {
			const declaration = this.scope.findDeclaration( subject.name );
			declaration.isReassigned = true;

			if ( declaration.possibleValues ) {
				declaration.possibleValues.add( NUMBER );
			}
		}

		super.bind();
	}

	hasEffects () {
		return isUsedByBundle( this.scope, this.subject );
	}

	initialiseNode () {
		this.module.bundle.dependentExpressions.push( this );
	}

	isUsedByBundle () {
		return isUsedByBundle( this.scope, this.subject );
	}
}
