import { locate } from 'locate-character';
import error from '../../utils/error.js';
import Node from '../Node.js';
import isProgramLevel from '../utils/isProgramLevel.js';
import callHasEffects from './shared/callHasEffects.js';

export default class CallExpression extends Node {
	bind ( scope ) {
		if ( this.callee.type === 'Identifier' ) {
			const declaration = scope.findDeclaration( this.callee.name );

			if ( declaration.isNamespace ) {
				error({
					message: `Cannot call a namespace ('${this.callee.name}')`,
					file: this.module.id,
					pos: this.start,
					loc: locate( this.module.code, this.start, { offsetLine: 1 })
				});
			}

			if ( this.callee.name === 'eval' && declaration.isGlobal ) {
				this.module.warn({
					code: 'EVAL',
					message: `Use of eval is strongly discouraged, as it poses security risks and may cause issues with minification`,
					url: 'https://github.com/rollup/rollup/wiki/Troubleshooting#avoiding-eval'
				}, this.start );
			}
		}

		super.bind( scope );
	}

	hasEffects ( scope ) {
		return callHasEffects( scope, this.callee, false );
	}

	initialise ( scope ) {
		if ( isProgramLevel( this ) ) {
			this.module.bundle.dependentExpressions.push( this );
		}
		super.initialise( scope );
	}

	isUsedByBundle () {
		return this.hasEffects( this.findScope() );
	}
}
