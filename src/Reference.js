export class Reference {
	constructor ( node, scope, statement ) {
		this.node = node;
		this.scope = scope;
		this.statement = statement;

		this.declaration = null; // bound later

		this.parts = [];

		let root = node;
		while ( root.type === 'MemberExpression' ) {
			this.parts.unshift( root.property );
			root = root.object;
		}

		this.name = root.name;

		this.start = node.start;
		this.end = node.start + this.name.length; // can be overridden in the case of namespace members
		this.rewritten = false;
	}
}

export class SyntheticReference {
	constructor ( name ) {
		this.name = name;
		this.parts = [];
	}
}
