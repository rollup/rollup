import Node from '../Node.js';
import isProgramLevel from '../utils/isProgramLevel.js';
import callHasEffects from './shared/callHasEffects.js';

export default class TaggedTemplateExpression extends Node {
	bind () {
		if ( this.tag.type === 'Identifier' ) {
			const declaration = this.scope.findDeclaration( this.tag.name );

			if ( declaration.isNamespace ) {
				this.module.error({
					code: 'CANNOT_CALL_NAMESPACE',
					message: `Cannot call a namespace ('${this.tag.name}')`
				}, this.start );
			}

			if ( this.tag.name === 'eval' && declaration.isGlobal ) {
				this.module.warn({
					code: 'EVAL',
					message: `Use of eval is strongly discouraged, as it poses security risks and may cause issues with minification`,
					url: 'https://github.com/rollup/rollup/wiki/Troubleshooting#avoiding-eval'
				}, this.start );
			}
		}

		super.bind();
	}

	hasEffects () {
		return this.quasi.hasEffects() || callHasEffects( this.scope, this.tag, false );
	}

	initialiseNode () {
		if ( isProgramLevel( this ) ) {
			this.module.bundle.dependentExpressions.push( this );
		}
	}

	isUsedByBundle () {
		return this.hasEffects();
	}
}
