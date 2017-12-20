import FunctionNode from './shared/FunctionNode';
import Scope from '../scopes/Scope';
import MagicString from 'magic-string';

export default class FunctionDeclaration extends FunctionNode {
	type: 'FunctionDeclaration';

	initialiseChildren (parentScope: Scope) {
		this.id && this.id.initialiseAndDeclare(parentScope, 'function', this);
		this.params.forEach(param =>
			param.initialiseAndDeclare(this.scope, 'parameter')
		);
		this.body.initialiseAndReplaceScope(new Scope({ parent: this.scope }));
	}

	render (code: MagicString, es: boolean) {
		if (!this.module.bundle.treeshake || this.included) {
			super.render(code, es);
		} else {
			code.remove(
				this.leadingCommentStart || this.start,
				this.next || this.end
			);
		}
	}
}
