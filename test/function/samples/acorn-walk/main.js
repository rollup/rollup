let found = false;

const base = {
	ExpressionStatement(node, c) {
		c(node.value, "Expression");
	},
	Expression() { },
	Identifier() { }
};

function simple(node, visitors, baseVisitor) {
	if (!baseVisitor) baseVisitor = base
		; (function c(node, override) {
			let type = override || node.type
			baseVisitor[type](node, c)
			if (visitors[type]) visitors[type](node)
		})(node)
}

simple({ type: "ExpressionStatement", value: { type: "Identifier" } }, {
	Expression(node) {
		found = true;
	}
});

assert.equal(found, true);
