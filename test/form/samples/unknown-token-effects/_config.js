module.exports = {
	description: 'does not tree-shake unknown tokens',
	options: {
		acorn: {
			plugins: { doTestExpressions: true }
		},
		acornInjectPlugins: [
			acorn => {
				acorn.plugins.doTestExpressions = function doTestExpressions(instance) {
					instance.extend(
						'parseExprAtom',
						superF =>
							function parseExprAtom(...args) {
								if (this.type === acorn.tokTypes._do) {
									this.eat(acorn.tokTypes._do);
									const node = this.startNode();
									node.body = this.parseBlock();
									return this.finishNode(node, 'DoExpression');
								}
								return Reflect.apply(superF, this, args);
							}
					);
				};
				return acorn;
			}
		]
	}
};
