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

declare module 'acorn-walk' {
	type WalkerCallback<TState> = (node: acorn.Node, state: TState) => void;
	type RecursiveWalkerFn<TState> = (
		node: acorn.Node,
		state: TState,
		callback: WalkerCallback<TState>
	) => void;
	export type BaseWalker<TState> = Record<string, RecursiveWalkerFn<TState>>;
	export const base: BaseWalker<unknown>;
}

declare module 'is-reference' {
	import type * as estree from 'estree';

	export default function is_reference(
		node: NodeWithFieldDefinition,
		parent: NodeWithFieldDefinition
	): boolean;

	export type Node =
		| estree.Identifier
		| estree.SimpleLiteral
		| estree.RegExpLiteral
		| estree.Program
		| estree.FunctionDeclaration
		| estree.FunctionExpression
		| estree.ArrowFunctionExpression
		| estree.SwitchCase
		| estree.CatchClause
		| estree.VariableDeclarator
		| estree.ExpressionStatement
		| estree.BlockStatement
		| estree.EmptyStatement
		| estree.DebuggerStatement
		| estree.WithStatement
		| estree.ReturnStatement
		| estree.LabeledStatement
		| estree.BreakStatement
		| estree.ContinueStatement
		| estree.IfStatement
		| estree.SwitchStatement
		| estree.ThrowStatement
		| estree.TryStatement
		| estree.WhileStatement
		| estree.DoWhileStatement
		| estree.ForStatement
		| estree.ForInStatement
		| estree.ForOfStatement
		| estree.VariableDeclaration
		| estree.ClassDeclaration
		| estree.ThisExpression
		| estree.ArrayExpression
		| estree.ObjectExpression
		| estree.YieldExpression
		| estree.UnaryExpression
		| estree.UpdateExpression
		| estree.BinaryExpression
		| estree.AssignmentExpression
		| estree.LogicalExpression
		| estree.MemberExpression
		| estree.ConditionalExpression
		| estree.SimpleCallExpression
		| estree.NewExpression
		| estree.SequenceExpression
		| estree.TemplateLiteral
		| estree.TaggedTemplateExpression
		| estree.ClassExpression
		| estree.MetaProperty
		| estree.AwaitExpression
		| estree.ImportExpression
		| estree.ChainExpression
		| estree.Property
		| estree.AssignmentProperty
		| estree.Super
		| estree.TemplateElement
		| estree.SpreadElement
		| estree.ObjectPattern
		| estree.ArrayPattern
		| estree.RestElement
		| estree.AssignmentPattern
		| estree.ClassBody
		| estree.MethodDefinition
		| estree.ImportDeclaration
		| estree.ExportNamedDeclaration
		| estree.ExportDefaultDeclaration
		| estree.ExportAllDeclaration
		| estree.ImportSpecifier
		| estree.ImportDefaultSpecifier
		| estree.ImportNamespaceSpecifier
		| estree.ExportSpecifier;

	export type NodeWithFieldDefinition =
		| Node
		| {
				computed: boolean;
				type: 'FieldDefinition';
				value: Node;
		  };
}
