import type { ast } from './dist/rollup';

export function firstStatement(program: ast.LazyNode<ast.Program>) {
	return program.body[0];
}

export function identifierParent(identifier: ast.LazyNode<ast.Identifier>) {
	return identifier.parent;
}

export function declarationParents(declaration: ast.LazyNode<ast.VariableDeclaration>) {
	return declaration.declarations.map(declarator => declarator.parent);
}

export function nodeParent<T extends ast.AstNode>(node: ast.LazyNode<T>) {
	return node.parent;
}
