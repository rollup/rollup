// internal
declare module 'help.md' {
	const str: string;
	export default str;
}

// external libs
declare module 'rollup-plugin-string' {
	import type { PluginImpl } from 'rollup';

	export const string: PluginImpl;
}

declare module 'is-reference' {
	import type * as estree from 'estree';

	export default function is_reference(
		node: NodeWithFieldDefinition,
		parent: NodeWithFieldDefinition
	): boolean;

	export type Node =
		| estree.ArrayExpression
		| estree.ArrayPattern
		| estree.ArrowFunctionExpression
		| estree.AssignmentExpression
		| estree.AssignmentPattern
		| estree.AssignmentProperty
		| estree.AwaitExpression
		| estree.BinaryExpression
		| estree.BlockStatement
		| estree.BreakStatement
		| estree.CatchClause
		| estree.ChainExpression
		| estree.ClassBody
		| estree.ClassDeclaration
		| estree.ClassExpression
		| estree.ConditionalExpression
		| estree.ContinueStatement
		| estree.DebuggerStatement
		| estree.DoWhileStatement
		| estree.EmptyStatement
		| estree.ExportAllDeclaration
		| estree.ExportDefaultDeclaration
		| estree.ExportNamedDeclaration
		| estree.ExportSpecifier
		| estree.ExpressionStatement
		| estree.ForInStatement
		| estree.ForOfStatement
		| estree.ForStatement
		| estree.FunctionDeclaration
		| estree.FunctionExpression
		| estree.IfStatement
		| estree.Identifier
		| estree.ImportDeclaration
		| estree.ImportDefaultSpecifier
		| estree.ImportExpression
		| estree.ImportNamespaceSpecifier
		| estree.ImportSpecifier
		| estree.LabeledStatement
		| estree.LogicalExpression
		| estree.MemberExpression
		| estree.MetaProperty
		| estree.MethodDefinition
		| estree.NewExpression
		| estree.ObjectExpression
		| estree.ObjectPattern
		| estree.Program
		| estree.Property
		| estree.RegExpLiteral
		| estree.RestElement
		| estree.ReturnStatement
		| estree.SequenceExpression
		| estree.SimpleCallExpression
		| estree.SimpleLiteral
		| estree.SpreadElement
		| estree.Super
		| estree.SwitchCase
		| estree.SwitchStatement
		| estree.TaggedTemplateExpression
		| estree.TemplateElement
		| estree.TemplateLiteral
		| estree.ThisExpression
		| estree.ThrowStatement
		| estree.TryStatement
		| estree.UnaryExpression
		| estree.UpdateExpression
		| estree.VariableDeclaration
		| estree.VariableDeclarator
		| estree.WhileStatement
		| estree.WithStatement
		| estree.YieldExpression;

	export type NodeWithFieldDefinition =
		| Node
		| {
				computed: boolean;
				type: 'FieldDefinition';
				value: Node;
		  };
}

declare module 'get-package-type' {
	interface GetPackageType {
		sync(fileName: string): 'module' | 'commonjs';
	}
	const getPackageType: GetPackageType;
	export default getPackageType;
}
