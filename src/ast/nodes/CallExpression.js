import getLocation from '../../utils/getLocation.js';
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
					loc: getLocation( this.module.code, this.start )
				});
			}

			if ( this.callee.name === 'eval' && declaration.isGlobal ) {
				this.module.bundle.onwarn( `Use of \`eval\` (in ${this.module.id}) is strongly discouraged, as it poses security risks and may cause issues with minification. See https://github.com/rollup/rollup/wiki/Troubleshooting#avoiding-eval for more details` );
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
