// Dynamic Import support for acorn
import { PluginsObject, TokenType } from 'acorn';

export default function wrapDynamicImportPlugin (acorn: {
	tokTypes: { [type: string]: TokenType },
	plugins: PluginsObject
}) {
	let moduleDynamicImportsReturnBinding: any[];
	acorn.tokTypes._import.startsExpr = true;
	acorn.plugins.dynamicImport = (instance: any) => {
		instance.extend('parseStatement', (nextMethod: Function) => {
			return function parseStatement (this: any, ...args: any[]) {
				const node = this.startNode();
				if (this.type === acorn.tokTypes._import) {
					const nextToken = this.input[this.pos];
					if (nextToken === acorn.tokTypes.parenL.label) {
						const expr = this.parseExpression();
						return this.parseExpressionStatement(node, expr);
					}
				}
				return nextMethod.apply(this, args);
			};
		});

		instance.extend('parseExprAtom', (nextMethod: Function) => {
			return function parseExprAtom (this: any, refDestructuringErrors: any) {
				if (this.type === acorn.tokTypes._import) {
					const node = this.startNode();
					this.next();
					if (this.type !== acorn.tokTypes.parenL) {
						this.unexpected();
					}
					if (moduleDynamicImportsReturnBinding) {
						moduleDynamicImportsReturnBinding.push(node);
					}
					return this.finishNode(node, 'Import');
				}
				return nextMethod.call(this, refDestructuringErrors);
			};
		});
	};

	// returns a function to set the dynamicImport array for getting these nodes during parsing
	return function setModuleDynamicImportsReturnBinding (_moduleDynamicImportsReturnBinding: any[]) {
		moduleDynamicImportsReturnBinding = _moduleDynamicImportsReturnBinding;
	};
}
