module.exports = {
	description: 'does not tree-shake unknown tokens',
	options: {
		acornInjectPlugins: Parser =>
			class extends Parser {
				parseExprAtom(refDestructuringErrors) {
					if (this.type.keyword === 'do') {
						this.eat(this.type);
						const node = this.startNode();
						node.body = this.parseBlock();
						return this.finishNode(node, 'DoExpression');
					}
					return super.parseExprAtom(refDestructuringErrors);
				}
			}
	}
};
