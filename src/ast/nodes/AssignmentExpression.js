import Node from '../Node.js';
import disallowIllegalReassignment from './shared/disallowIllegalReassignment.js';
import isUsedByBundle from './shared/isUsedByBundle.js';
import isProgramLevel from '../utils/isProgramLevel.js';
import { NUMBER, STRING } from '../values.js';

export default class AssignmentExpression extends Node {
	bind () {
		const subject = this.left;

		this.subject = subject;
		disallowIllegalReassignment( this.scope, subject );

		if ( subject.type === 'Identifier' ) {
			const declaration = this.scope.findDeclaration( subject.name );
			declaration.isReassigned = true;

			if ( declaration.possibleValues ) { // TODO this feels hacky
				if ( this.operator === '=' ) {
					declaration.possibleValues.add( this.right );
				} else if ( this.operator === '+=' ) {
					declaration.possibleValues.add( STRING ).add( NUMBER );
				} else {
					declaration.possibleValues.add( NUMBER );
				}
			}
		}

		super.bind();
	}

	hasEffects () {
		const hasEffects = this.isUsedByBundle() || this.right.hasEffects( this.scope );
		return hasEffects;
	}

	initialiseNode () {
		if ( isProgramLevel( this ) ) {
			this.module.bundle.dependentExpressions.push( this );
		}
	}

	isUsedByBundle () {
		return isUsedByBundle( this.scope, this.subject );
	}
}
