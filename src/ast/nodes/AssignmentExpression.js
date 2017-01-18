import Node from '../Node.js';
import disallowIllegalReassignment from './shared/disallowIllegalReassignment.js';
import isUsedByBundle from './shared/isUsedByBundle.js';
import { NUMBER, STRING } from '../values.js';

/*
enum AssignmentOperator {
    "=" | "+=" | "-=" | "*=" | "/=" | "%="
        | "<<=" | ">>=" | ">>>="
        | "|=" | "^=" | "&="
}
*/

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

		super.bind( this.scope );
	}

	hasEffects ( scope ) {
		const hasEffects = this.isUsedByBundle() || this.right.hasEffects( scope );
		return hasEffects;
	}

	initialise ( scope ) {
		this.scope = scope;
		super.initialise( scope );
	}

	isUsedByBundle () {
		return isUsedByBundle( this.scope, this.subject );
	}

	run () {
		this.module.bundle.potentialEffects.push( this );

		const rightValue = this.right.run();

		if ( this.operator === '=' ) {
			this.left.setValue( rightValue );
			return rightValue;
		}

		// TODO handle other operators
	}
}
