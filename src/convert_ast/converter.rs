use napi::bindgen_prelude::*;
use swc_common::Span;
use swc_ecma_ast::{ArrowExpr, BindingIdent, BlockStmt, BlockStmtOrExpr, Bool, Callee, CallExpr, Decl, ExportDecl, ExportDefaultExpr, ExportNamedSpecifier, ExportSpecifier, Expr, ExprOrSpread, ExprStmt, Ident, ImportDecl, ImportDefaultSpecifier, ImportNamedSpecifier, ImportSpecifier, Lit, MemberExpr, MemberProp, Module, ModuleDecl, ModuleExportName, ModuleItem, NamedExport, Number, Null, Pat, PrivateName, Program, Stmt, Str, VarDecl, VarDeclarator, VarDeclKind, ImportStarAsSpecifier, ExportAll, BinExpr, BinaryOp, ArrayPat, ObjectPat, ObjectPatProp, AssignPatProp, ArrayLit, CondExpr, FnDecl, ClassDecl, ClassMember, ReturnStmt, ObjectLit, PropOrSpread, Prop, KeyValueProp, PropName, GetterProp, AssignExpr, AssignOp, PatOrExpr, NewExpr, FnExpr, ParenExpr, Param, ThrowStmt, ExportDefaultDecl, DefaultDecl, AssignPat, AwaitExpr, LabeledStmt, BreakStmt, TryStmt, CatchClause, OptChainExpr, OptChainBase, OptCall, Super, ClassExpr, Class, WhileStmt, ContinueStmt, DoWhileStmt, DebuggerStmt, EmptyStmt, ForInStmt, ForHead, ForOfStmt, ForStmt, VarDeclOrExpr, IfStmt, Regex, BigInt};
use crate::convert_ast::converter::analyze_code::find_first_occurrence_outside_comment;

mod analyze_code;

pub struct AstConverter<'a> {
    buffer: Vec<u8>,
    code: &'a [u8],
    chain_state: ChainState,
}

enum ChainState {
    Chained,
    None,
}

impl<'a> AstConverter<'a> {
    pub fn new(code: &'a [u8]) -> Self {
        Self {
            // TODO Lukas This is just a wild guess and should be refined with a large block of minified code
            buffer: Vec::with_capacity(20 * code.len()),
            code,
            chain_state: ChainState::None,
        }
    }

    pub fn convert_ast_to_buffer(mut self, node: &Program) -> Buffer {
        self.convert_program(node);
        self.buffer.shrink_to_fit();
        self.buffer.into()
    }


    // === helpers
    fn add_type_and_positions(&mut self, node_type: &[u8; 4], span: &Span) {
        // type
        self.buffer.extend_from_slice(node_type);
        // start
        self.buffer.extend_from_slice(&(span.lo.0 - 1).to_ne_bytes());
        // end
        self.buffer.extend_from_slice(&(span.hi.0 - 1).to_ne_bytes());
    }

    fn convert_item_list<T, F>(&mut self, item_list: &[T], convert_item: F)
        where F: Fn(&mut AstConverter, &T)
    {
        // store number of items in first position
        self.buffer.extend_from_slice(&(item_list.len() as u32).to_ne_bytes());
        let mut reference_position = self.buffer.len();
        // make room for the reference positions of the items
        self.buffer.resize(self.buffer.len() + item_list.len() * 4, 0);
        for item in item_list {
            let insert_position = (self.buffer.len() as u32) >> 2;
            self.buffer[reference_position..reference_position + 4].copy_from_slice(&insert_position.to_ne_bytes());
            reference_position += 4;
            convert_item(self, item);
        }
    }

    // TODO Lukas deduplicate strings and see if we can easily compare atoms
    fn convert_string(&mut self, string: &str) {
        let length = string.len();
        let additional_length = ((length + 3) & !3) - length;
        self.buffer.extend_from_slice(&(length as u32).to_ne_bytes());
        self.buffer.extend_from_slice(string.as_bytes());
        self.buffer.resize(self.buffer.len() + additional_length, 0);
    }

    fn convert_boolean(&mut self, boolean: bool) {
        self.buffer.extend_from_slice(&(if boolean { 1u32 } else { 0u32 }).to_ne_bytes());
    }

    fn reserve_reference_positions(&mut self, item_count: usize) -> usize {
        let reference_position = self.buffer.len();
        self.buffer.resize(reference_position + (item_count << 2), 0);
        reference_position
    }

    fn update_reference_position(&mut self, reference_position: usize) {
        let insert_position = (self.buffer.len() as u32) >> 2;
        self.buffer[reference_position..reference_position + 4].copy_from_slice(&insert_position.to_ne_bytes());
    }

    // === enums
    fn convert_program(&mut self, node: &Program) {
        match node {
            Program::Module(module) => self.convert_module_program(module),
            _ => {
                dbg!(node);
                unimplemented!("Cannot convert AST");
            }
        }
    }

    fn convert_module_item(&mut self, module_item: &ModuleItem) {
        match module_item {
            ModuleItem::Stmt(statement) => self.convert_statement(statement),
            ModuleItem::ModuleDecl(module_declaration) => {
                self.convert_module_declaration(module_declaration);
            }
        }
    }

    fn convert_statement(&mut self, statement: &Stmt) {
        match statement {
            Stmt::Break(break_statement) => self.convert_break_statement(break_statement),
            Stmt::Block(block_statement) => self.convert_block_statement(block_statement),
            Stmt::Continue(continue_statement) => self.convert_continue_statement(continue_statement),
            Stmt::Decl(declaration) => self.convert_declaration(declaration),
            Stmt::Debugger(debugger_statement) => self.convert_debugger_statement(debugger_statement),
            Stmt::DoWhile(do_while_statement) => self.convert_do_while_statement(do_while_statement),
            Stmt::Empty(empty_statement) => self.convert_empty_statement(empty_statement),
            Stmt::Expr(expression_statement) => self.convert_expression_statement(expression_statement),
            Stmt::For(for_statement) => self.convert_for_statement(for_statement),
            Stmt::ForIn(for_in_statement) => self.convert_for_in_statement(for_in_statement),
            Stmt::ForOf(for_of_statement) => self.convert_for_of_statement(for_of_statement),
            Stmt::If(if_statement) => self.convert_if_statement(if_statement),
            Stmt::Labeled(labeled_statement) => self.convert_labeled_statement(labeled_statement),
            Stmt::Return(return_statement) => self.convert_return_statement(return_statement),
            Stmt::Throw(throw_statement) => self.convert_throw_statement(throw_statement),
            Stmt::Try(try_statement) => self.convert_try_statement(try_statement),
            Stmt::While(while_statement) => self.convert_while_statement(while_statement),
            _ => {
                dbg!(statement);
                todo!("Cannot convert Statement");
            }
        }
    }

    fn convert_expression(&mut self, expression: &Expr) {
        match expression {
            Expr::Array(array_literal) => self.convert_array_literal(array_literal),
            Expr::Arrow(arrow_expression) => self.convert_arrow_expression(arrow_expression),
            Expr::Assign(assignment_expression) => self.convert_assignment_expression(assignment_expression),
            Expr::Await(await_expression) => self.convert_await_expression(await_expression),
            Expr::Bin(binary_expression) => self.convert_binary_expression(binary_expression),
            Expr::Call(call_expression) => self.convert_call_expression(call_expression, false),
            Expr::Class(class_expression) => self.convert_class_expression(class_expression, &TYPE_CLASS_EXPRESSION),
            Expr::Cond(conditional_expression) => self.convert_conditional_expression(conditional_expression),
            Expr::Fn(function_expression) => self.convert_function_expression(function_expression, &TYPE_FUNCTION_EXPRESSION),
            Expr::Ident(identifier) => self.convert_identifier(identifier),
            Expr::Lit(literal) => self.convert_literal(literal),
            Expr::Member(member_expression) => self.convert_member_expression(member_expression, false),
            Expr::New(new_expression) => self.convert_new_expression(new_expression),
            Expr::Object(object_literal) => self.convert_object_literal(object_literal),
            Expr::OptChain(optional_chain_expression) => self.convert_optional_chain_expression(optional_chain_expression),
            Expr::Paren(parenthesized_expression) => self.convert_parenthesized_expression(parenthesized_expression),
            _ => {
                dbg!(expression);
                todo!("Cannot convert Expression");
            }
        }
    }

    fn convert_literal(&mut self, literal: &Lit) {
        match literal {
            Lit::BigInt(bigint_literal) => self.convert_literal_bigint(bigint_literal),
            Lit::Bool(boolean_literal) => self.convert_literal_boolean(boolean_literal),
            Lit::Null(null_literal) => self.convert_literal_null(null_literal),
            Lit::Num(number_literal) => self.convert_literal_number(number_literal),
            Lit::Regex(regex_literal) => self.convert_literal_regex(regex_literal),
            Lit::Str(string_literal) => self.convert_literal_string(string_literal),
            _ => {
                dbg!(literal);
                todo!("Cannot convert Literal");
            }
        }
    }

    fn convert_module_declaration(&mut self, module_declaration: &ModuleDecl) {
        match module_declaration {
            ModuleDecl::ExportDecl(export_declaration) => self.convert_export_declaration(export_declaration),
            ModuleDecl::ExportNamed(export_named) => self.convert_export_named_declaration(export_named),
            ModuleDecl::Import(import_declaration) => self.convert_import_declaration(import_declaration),
            ModuleDecl::ExportDefaultExpr(export_default_expression) => {
                self.convert_export_default_expression(export_default_expression)
            }
            ModuleDecl::ExportAll(export_all) => self.convert_export_all(export_all),
            ModuleDecl::ExportDefaultDecl(export_default_declaration) => {
                self.convert_export_default_declaration(export_default_declaration)
            }
            _ => {
                dbg!(module_declaration);
                todo!("Cannot convert ModuleDeclaration");
            }
        }
    }

    fn convert_declaration(&mut self, declaration: &Decl) {
        match declaration {
            Decl::Var(variable_declaration) => self.convert_variable_declaration(variable_declaration),
            Decl::Fn(function_declaration) => self.convert_function_declaration(function_declaration),
            Decl::Class(class_declaration) => self.convert_class_declaration(class_declaration),
            _ => {
                dbg!(declaration);
                todo!("Cannot convert Declaration");
            }
        }
    }

    fn convert_pattern(&mut self, pattern: &Pat) {
        match pattern {
            Pat::Array(array_pattern) => self.convert_array_pattern(array_pattern),
            Pat::Assign(assignment_pattern) => self.convert_assignment_pattern(assignment_pattern),
            Pat::Expr(expression) => self.convert_expression(expression),
            Pat::Ident(binding_identifier) => self.convert_binding_identifier(binding_identifier),
            Pat::Object(object) => self.convert_object_pattern(object),
            _ => {
                dbg!(pattern);
                todo!("Cannot convert Pattern");
            }
        }
    }

    fn convert_binding_identifier(&mut self, binding_identifier: &BindingIdent) {
        self.convert_identifier(&binding_identifier.id);
    }

    fn convert_export_specifier(&mut self, export_specifier: &ExportSpecifier) {
        match export_specifier {
            ExportSpecifier::Named(export_named_specifier) => self.convert_export_named_specifier(export_named_specifier),
            _ => {
                dbg!(export_specifier);
                todo!("Cannot convert ExportSpecifier");
            }
        }
    }

    fn convert_module_export_name(&mut self, module_export_name: &ModuleExportName) {
        match module_export_name {
            ModuleExportName::Ident(identifier) => self.convert_identifier(identifier),
            _ => {
                dbg!(module_export_name);
                todo!("Cannot convert ModuleExportName");
            }
        }
    }

    fn convert_import_specifier(&mut self, import_specifier: &ImportSpecifier) {
        match import_specifier {
            ImportSpecifier::Named(import_named_specifier) => self.convert_import_named_specifier(import_named_specifier),
            ImportSpecifier::Default(import_default_specifier) => self.convert_import_default_specifier(import_default_specifier),
            ImportSpecifier::Namespace(import_namespace_specifier) => self.convert_import_namespace_specifier(import_namespace_specifier),
        }
    }

    fn convert_object_pattern_property(&mut self, object_pattern_property: &ObjectPatProp) {
        match object_pattern_property {
            ObjectPatProp::Assign(assignment_pattern_property) => self.convert_assignment_pattern_property(assignment_pattern_property),
            _ => {
                dbg!(object_pattern_property);
                todo!("Cannot convert ObjectPatternProperty");
            }
        }
    }

    fn convert_class_member(&self, class_member: &ClassMember) {
        match class_member {
            _ => {
                dbg!(class_member);
                todo!("Cannot convert ClassMember");
            }
        }
    }

    fn convert_property_or_spread(&mut self, property_or_spread: &PropOrSpread) {
        match property_or_spread {
            PropOrSpread::Prop(property) => self.convert_property(&**property),
            _ => {
                dbg!(property_or_spread);
                todo!("Cannot convert PropertyOrSpread");
            }
        }
    }

    fn convert_property(&mut self, property: &Prop) {
        match property {
            Prop::KeyValue(key_value_property) => self.convert_key_value_property(key_value_property, &TYPE_KEY_VALUE_PROPERTY),
            Prop::Shorthand(identifier) => self.convert_shorthand_property(identifier),
            Prop::Getter(getter_property) => self.convert_getter_property(getter_property),
            _ => {
                dbg!(property);
                todo!("Cannot convert Property")
            }
        }
    }

    fn convert_pattern_or_expression(&mut self, pattern_or_expression: &PatOrExpr) {
        match pattern_or_expression {
            PatOrExpr::Pat(pattern) => self.convert_pattern(pattern),
            PatOrExpr::Expr(expression) => self.convert_expression(expression)
        }
    }

    fn convert_parenthesized_expression(&mut self, parenthesized_expression: &ParenExpr) {
        self.convert_expression(&parenthesized_expression.expr);
    }

    fn convert_optional_chain_base(&mut self, optional_chain_base: &OptChainBase, is_optional: bool) {
        match optional_chain_base {
            OptChainBase::Member(member_expression) => self.convert_member_expression(&member_expression, is_optional),
            OptChainBase::Call(optional_call) => self.convert_optional_call(optional_call, is_optional),
        }
    }

    fn convert_call_expression(&mut self, call_expression: &CallExpr, is_optional: bool) {
        match &call_expression.callee {
            Callee::Import(_) => self.store_import_expression(&call_expression.span, &call_expression.args),
            Callee::Expr(callee_expression) => self.store_call_expression(&call_expression.span, is_optional, &StoredCallee::Expression(&callee_expression), &call_expression.args),
            Callee::Super(callee_super) => self.store_call_expression(&call_expression.span, is_optional, &StoredCallee::Super(&callee_super), &call_expression.args),
        }
    }

    fn convert_optional_call(&mut self, optional_call: &OptCall, is_optional: bool) {
        self.store_call_expression(&optional_call.span, is_optional, &StoredCallee::Expression(&optional_call.callee), &optional_call.args);
    }

    fn convert_export_declaration(&mut self, export_declaration: &ExportDecl) {
        self.store_export_named_declaration(&export_declaration.span, &vec![], None, Some(&export_declaration.decl), &None);
    }

    fn convert_export_named_declaration(&mut self, export_named_declaration: &NamedExport) {
        match export_named_declaration.specifiers.first().unwrap() {
            ExportSpecifier::Namespace(export_namespace_specifier) => self.store_export_all_declaration(&export_named_declaration.span, export_named_declaration.src.as_ref().unwrap(),  &export_named_declaration.asserts, Some(&export_namespace_specifier.name)),
            ExportSpecifier::Named(_) => self.store_export_named_declaration(&export_named_declaration.span, &export_named_declaration.specifiers, export_named_declaration.src.as_ref().map(|source| &**source), None, &export_named_declaration.asserts),
            ExportSpecifier::Default(_) => panic!("Unexpected default export specifier"),
        }
    }

    fn convert_for_head(&mut self, for_head: &ForHead) {
        match for_head {
            ForHead::VarDecl(variable_declaration) => self.convert_variable_declaration(variable_declaration),
            ForHead::Pat(pattern) => self.convert_pattern(pattern),
            _ => {
                dbg!(for_head);
                todo!("Cannot convert ForHead")
            }
        }
    }

    fn convert_variable_declaration_or_expression(&mut self, variable_declaration_or_expression: &VarDeclOrExpr) {
        match variable_declaration_or_expression {
            VarDeclOrExpr::VarDecl(variable_declaration) => {
                self.convert_variable_declaration(variable_declaration);
            }
            VarDeclOrExpr::Expr(expression) => {
                self.convert_expression(expression);
            }
        }
    }

    fn convert_export_all(&mut self, export_all: &ExportAll) {
        self.store_export_all_declaration(&export_all.span, &export_all.src, &export_all.asserts, None);
    }

    // === nodes
    fn convert_module_program(&mut self, module: &Module) {
        // type
        self.buffer.extend_from_slice(&TYPE_MODULE);
        // we are not using the helper but code start/end by hand as acorn does this differently
        // start
        self.buffer.extend_from_slice(&0u32.to_ne_bytes());
        // end
        self.buffer.extend_from_slice(&(self.code.len() as u32).to_ne_bytes());
        // body
        self.convert_item_list(&module.body, |ast_converter, module_item| ast_converter.convert_module_item(module_item));
    }

    fn convert_expression_statement(&mut self, expression_statement: &ExprStmt) {
        self.add_type_and_positions(&TYPE_EXPRESSION_STATEMENT, &expression_statement.span);
        // expression
        self.convert_expression(&expression_statement.expr);
    }

    fn store_export_named_declaration(&mut self, span: &Span, specifiers: &Vec<ExportSpecifier>, src: Option<&Str>, declaration: Option<&Decl>, asserts: &Option<Box<ObjectLit>>) {
        self.add_type_and_positions(&TYPE_EXPORT_NAMED_DECLARATION, span);
        // reserve for declaration, src, attributes
        let reference_position = self.reserve_reference_positions(3);
        // specifiers
        self.convert_item_list(specifiers, |ast_converter, specifier| ast_converter.convert_export_specifier(specifier));
        // declaration
        declaration.map(|declaration| {
            self.update_reference_position(reference_position);
            self.convert_declaration(declaration)
        });
        // src
        src.map(|src| {
            self.update_reference_position(reference_position + 4);
            self.convert_literal_string(src)
        });
        // attributes
        self.update_reference_position(reference_position + 8);
        self.store_import_attributes(asserts);
    }

    fn convert_literal_number(&mut self, literal: &Number) {
        self.add_type_and_positions(&TYPE_LITERAL_NUMBER, &literal.span);
        // reserve for raw
        let reference_position = self.reserve_reference_positions(1);
        // value, needs to be little endian as we are reading via a DataView
        self.buffer.extend_from_slice(&literal.value.to_le_bytes());
        // raw
        literal.raw.as_ref().map(|raw| {
            self.update_reference_position(reference_position);
            self.convert_string(&*raw);
        });
    }

    fn convert_literal_string(&mut self, literal: &Str) {
        self.add_type_and_positions(&TYPE_LITERAL_STRING, &literal.span);
        // reserve for raw
        let reference_position = self.reserve_reference_positions(1);
        // value
        self.convert_string(&literal.value);
        // raw
        literal.raw.as_ref().map(|raw| {
            self.update_reference_position(reference_position);
            self.convert_string(&*raw);
        });
    }

    fn convert_variable_declaration(&mut self, variable_declaration: &VarDecl) {
        self.add_type_and_positions(&TYPE_VARIABLE_DECLARATION, &variable_declaration.span);
        self.buffer.extend_from_slice(match variable_declaration.kind {
            VarDeclKind::Var => &DECLARATION_KIND_VAR,
            VarDeclKind::Let => &DECLARATION_KIND_LET,
            VarDeclKind::Const => &DECLARATION_KIND_CONST,
        });
        self.convert_item_list(&variable_declaration.decls, |ast_converter, variable_declarator| ast_converter.convert_variable_declarator(variable_declarator));
    }

    fn convert_variable_declarator(&mut self, variable_declarator: &VarDeclarator) {
        self.add_type_and_positions(&TYPE_VARIABLE_DECLARATOR, &variable_declarator.span);
        // reserve for init
        let reference_position = self.reserve_reference_positions(1);
        // id
        self.convert_pattern(&variable_declarator.name);
        // init
        variable_declarator.init.as_ref().map(|init| {
            self.update_reference_position(reference_position);
            self.convert_expression(&init);
        });
    }

    fn convert_identifier(&mut self, identifier: &Ident) {
        self.add_type_and_positions(&TYPE_IDENTIFIER, &identifier.span);
        // name
        self.convert_string(&identifier.sym);
    }

    fn convert_export_named_specifier(&mut self, export_named_specifier: &ExportNamedSpecifier) {
        self.add_type_and_positions(&TYPE_EXPORT_SPECIFIER, &export_named_specifier.span);
        // reserve for exported
        let reference_position = self.reserve_reference_positions(1);
        // local
        self.convert_module_export_name(&export_named_specifier.orig);
        // exported
        export_named_specifier.exported.as_ref().map(|exported| {
            self.update_reference_position(reference_position);
            self.convert_module_export_name(&exported);
        });
    }

    fn convert_import_declaration(&mut self, import_declaration: &ImportDecl) {
        self.add_type_and_positions(&TYPE_IMPORT_DECLARATION, &import_declaration.span);
        // reserve for src, attributes
        let reference_position = self.reserve_reference_positions(2);
        // specifiers
        self.convert_item_list(&import_declaration.specifiers, |ast_converter, import_specifier| ast_converter.convert_import_specifier(import_specifier));
        // src
        self.update_reference_position(reference_position);
        self.convert_literal_string(&*import_declaration.src);
        // attributes
        self.update_reference_position(reference_position + 4);
        self.store_import_attributes(&import_declaration.asserts);
    }

    fn store_import_attributes(&mut self, asserts: &Option<Box<ObjectLit>>) {
        match asserts {
            Some(ref asserts) => {
                self.convert_item_list(&asserts.props, |ast_converter, prop| {
                    match prop {
                        PropOrSpread::Prop(prop) => {
                            match &**prop {
                                Prop::KeyValue(key_value_property) => ast_converter.convert_key_value_property(key_value_property, &TYPE_IMPORT_ATTRIBUTE),
                                _ => panic!("Non key-value property in import declaration attributes")
                            }
                        }
                        PropOrSpread::Spread(_) => panic!("Spread in import declaration attributes")
                    }
                });
            }
            None => self.buffer.resize(self.buffer.len() + 4, 0)
        }
    }

    fn store_import_expression(&mut self, span: &Span, arguments: &Vec<ExprOrSpread>) {
        self.add_type_and_positions(&TYPE_IMPORT_EXPRESSION, span);
        // reserve for attributes
        let reference_position = self.reserve_reference_positions(1);
        // source
        self.convert_expression(&*arguments.first().unwrap().expr);
        // attributes
        self.update_reference_position(reference_position);
        self.convert_item_list(&arguments[1..], |ast_converter, argument| ast_converter.convert_expression_or_spread(argument));
    }

    fn store_call_expression(&mut self, span: &Span, is_optional: bool, callee: &StoredCallee, arguments: &[ExprOrSpread]) {
        self.add_type_and_positions(&TYPE_CALL_EXPRESSION, span);
        // optional
        self.convert_boolean(is_optional);
        // reserve for callee
        let reference_position = self.reserve_reference_positions(1);
        // arguments
        self.convert_item_list(arguments, |ast_converter, argument| ast_converter.convert_expression_or_spread(argument));
        // callee
        self.update_reference_position(reference_position);
        match callee {
            StoredCallee::Expression(callee_expression) => self.convert_expression(callee_expression),
            StoredCallee::Super(callee_super) => {
                dbg!(callee_super);
                todo!("Cannot convert super call expression");
            }
        }
    }

    fn convert_import_named_specifier(&mut self, import_named_specifier: &ImportNamedSpecifier) {
        self.add_type_and_positions(&TYPE_IMPORT_SPECIFIER, &import_named_specifier.span);
        // reserve for imported
        let reference_position = self.reserve_reference_positions(1);
        // local
        self.convert_identifier(&import_named_specifier.local);
        // imported
        import_named_specifier.imported.as_ref().map(|imported| {
            self.update_reference_position(reference_position);
            self.convert_module_export_name(&imported);
        });
    }

    fn convert_arrow_expression(&mut self, arrow_expression: &ArrowExpr) {
        self.add_type_and_positions(&TYPE_ARROW_FUNCTION_EXPRESSION, &arrow_expression.span);
        // async
        self.convert_boolean(arrow_expression.is_async);
        // generator
        self.convert_boolean(arrow_expression.is_generator);
        // reserve for params
        let reference_position = self.reserve_reference_positions(1);
        match &*arrow_expression.body {
            BlockStmtOrExpr::BlockStmt(block_statement) => {
                // expression
                self.convert_boolean(false);
                // body
                self.convert_block_statement(block_statement)
            }
            BlockStmtOrExpr::Expr(expression) => {
                // expression
                self.convert_boolean(true);
                // body
                self.convert_expression(expression)
            }
        }
        // params
        self.update_reference_position(reference_position);
        self.convert_item_list(&arrow_expression.params, |ast_converter, param| ast_converter.convert_pattern(param));
    }

    fn convert_block_statement(&mut self, block_statement: &BlockStmt) {
        self.add_type_and_positions(&TYPE_BLOCK_STATEMENT, &block_statement.span);
        // body
        self.convert_item_list(&block_statement.stmts, |ast_converter, statement| ast_converter.convert_statement(statement));
    }


    fn convert_expression_or_spread(&mut self, expression_or_spread: &ExprOrSpread) {
        match expression_or_spread.spread {
            Some(spread_span) => {
                self.add_type_and_positions(&TYPE_SPREAD, &spread_span);
                // we need to set the end position to that of the expression
                let reference_position = self.buffer.len();
                self.convert_expression(&expression_or_spread.expr);
                let expression_end: [u8; 4] = self.buffer[reference_position + 4..reference_position + 8].try_into().unwrap();
                self.buffer[reference_position - 4..reference_position].copy_from_slice(&expression_end);
            }
            None => self.convert_expression(&expression_or_spread.expr),
        }
    }

    fn convert_member_expression(&mut self, member_expression: &MemberExpr, is_optional: bool) {
        self.add_type_and_positions(&TYPE_MEMBER_EXPRESSION, &member_expression.span);
        // optional
        self.convert_boolean(is_optional);
        // reserve object
        let reference_position = self.reserve_reference_positions(1);
        match &member_expression.prop {
            MemberProp::Ident(ident) => {
                // computed
                self.convert_boolean(false);
                // property
                self.convert_identifier(&ident)
            }
            MemberProp::Computed(computed) => {
                // computed
                self.convert_boolean(true);
                // property
                self.convert_expression(&computed.expr)
            }
            MemberProp::PrivateName(private_name) => {
                // computed
                self.convert_boolean(false);
                // property
                self.convert_private_name(&private_name)
            }
        }
        // object
        self.update_reference_position(reference_position);
        self.convert_expression(&member_expression.obj);
    }

    fn convert_private_name(&mut self, private_name: &&PrivateName) {
        self.add_type_and_positions(&TYPE_PRIVATE_NAME, &private_name.span);
        // id
        self.convert_identifier(&private_name.id);
    }

    fn convert_import_default_specifier(&mut self, import_default_specifier: &ImportDefaultSpecifier) {
        self.add_type_and_positions(&TYPE_IMPORT_DEFAULT_SPECIFIER, &import_default_specifier.span);
        // local
        self.convert_identifier(&import_default_specifier.local);
    }

    fn convert_literal_boolean(&mut self, literal: &Bool) {
        self.add_type_and_positions(&TYPE_LITERAL_BOOLEAN, &literal.span);
        // value^
        self.convert_boolean(literal.value);
    }

    fn convert_export_default_expression(&mut self, export_default_expression: &ExportDefaultExpr) {
        self.store_export_default_declaration(&export_default_expression.span, StoredDefaultExportExpression::Expression(&export_default_expression.expr));
    }

    fn convert_export_default_declaration(&mut self, export_default_declaration: &ExportDefaultDecl) {
        self.store_export_default_declaration(&export_default_declaration.span, match &export_default_declaration.decl {
            DefaultDecl::Class(class_expression) => StoredDefaultExportExpression::Class(&class_expression),
            DefaultDecl::Fn(function_expression) => StoredDefaultExportExpression::Function(&function_expression),
            DefaultDecl::TsInterfaceDecl(_) => unimplemented!("Cannot convert ExportDefaultDeclaration with TsInterfaceDecl"),
        });
    }

    fn store_export_default_declaration(&mut self, span: &Span, expression: StoredDefaultExportExpression) {
        self.add_type_and_positions(&TYPE_EXPORT_DEFAULT_DECLARATION, span);
        // expression
        match expression {
            StoredDefaultExportExpression::Expression(expression) => self.convert_expression(&expression),
            StoredDefaultExportExpression::Class(class_expression) => self.convert_class_expression(&class_expression, &TYPE_CLASS_DECLARATION),
            StoredDefaultExportExpression::Function(function_expression) => self.convert_function_expression(&function_expression, &TYPE_FUNCTION_DECLARATION),
        }
    }

    fn convert_literal_null(&mut self, literal: &Null) {
        self.add_type_and_positions(&TYPE_LITERAL_NULL, &literal.span);
    }

    fn convert_import_namespace_specifier(&mut self, import_namespace_specifier: &ImportStarAsSpecifier) {
        self.add_type_and_positions(&TYPE_IMPORT_NAMESPACE_SPECIFIER, &import_namespace_specifier.span);
        // local
        self.convert_identifier(&import_namespace_specifier.local);
    }

    fn store_export_all_declaration(&mut self, span: &Span, source: &Str, attributes: &Option<Box<ObjectLit>>, exported: Option<&ModuleExportName>) {
        self.add_type_and_positions(&TYPE_EXPORT_ALL_DECLARATION, span);
        // reserve attributes, exported
        let reference_position = self.reserve_reference_positions(2);
        // source
        self.convert_literal_string(source);
        // attributes
        self.update_reference_position(reference_position);
        self.store_import_attributes(attributes);
        // exported
        exported.map(|exported| {
            self.update_reference_position(reference_position + 4);
            self.convert_module_export_name(exported);
        });
    }

    fn convert_binary_expression(&mut self, binary_expression: &BinExpr) {
        self.add_type_and_positions(match binary_expression.op {
            BinaryOp::LogicalOr | BinaryOp::LogicalAnd | BinaryOp::NullishCoalescing => &TYPE_LOGICAL_EXPRESSION,
            _ => &TYPE_BINARY_EXPRESSION,
        }, &binary_expression.span);
        // reserve left, right
        let reference_position = self.reserve_reference_positions(2);
        // operator
        self.convert_string(match binary_expression.op {
            BinaryOp::EqEq => "==",
            BinaryOp::NotEq => "!=",
            BinaryOp::EqEqEq => "===",
            BinaryOp::NotEqEq => "!==",
            BinaryOp::Lt => "<",
            BinaryOp::LtEq => "<=",
            BinaryOp::Gt => ">",
            BinaryOp::GtEq => ">=",
            BinaryOp::LShift => "<<",
            BinaryOp::RShift => ">>",
            BinaryOp::ZeroFillRShift => "<<<",
            BinaryOp::Add => "+",
            BinaryOp::Sub => "-",
            BinaryOp::Mul => "*",
            BinaryOp::Div => "/",
            BinaryOp::Mod => "%",
            BinaryOp::BitOr => "|",
            BinaryOp::BitXor => "^",
            BinaryOp::BitAnd => "&",
            BinaryOp::LogicalOr => "||",
            BinaryOp::LogicalAnd => "&&",
            BinaryOp::In => "in",
            BinaryOp::InstanceOf => "instanceof",
            BinaryOp::Exp => "**",
            BinaryOp::NullishCoalescing => "??",
        });
        // left
        self.update_reference_position(reference_position);
        self.convert_expression(&binary_expression.left);
        // right
        self.update_reference_position(reference_position + 4);
        self.convert_expression(&binary_expression.right);
    }

    fn convert_array_pattern(&mut self, array_pattern: &ArrayPat) {
        self.add_type_and_positions(&TYPE_ARRAY_PATTERN, &array_pattern.span);
        // elements
        self.convert_item_list(&array_pattern.elems, |ast_converter, element| match element {
            Some(element) => ast_converter.convert_pattern(element),
            None => ast_converter.convert_boolean(false),
        });
    }

    fn convert_object_pattern(&mut self, object_pattern: &ObjectPat) {
        self.add_type_and_positions(&TYPE_OBJECT_PATTERN, &object_pattern.span);
        // properties
        self.convert_item_list(&object_pattern.props, |ast_converter, object_pattern_property| ast_converter.convert_object_pattern_property(object_pattern_property));
    }

    fn convert_assignment_pattern_property(&mut self, assignment_pattern_property: &AssignPatProp) {
        self.add_type_and_positions(&TYPE_ASSIGNMENT_PATTERN_PROPERTY, &assignment_pattern_property.span);
        // reserve value
        let reference_position = self.reserve_reference_positions(1);
        // key
        self.convert_identifier(&assignment_pattern_property.key);
        // value
        assignment_pattern_property.value.as_ref().map(|value| {
            self.update_reference_position(reference_position);
            self.convert_expression(&*value);
        });
    }

    fn convert_array_literal(&mut self, array_literal: &ArrayLit) {
        self.add_type_and_positions(&TYPE_ARRAY_EXPRESSION, &array_literal.span);
        // elements
        self.convert_item_list(&array_literal.elems, |ast_converter, element| match element {
            Some(element) => ast_converter.convert_expression_or_spread(element),
            None => ast_converter.convert_boolean(false),
        });
    }

    fn convert_conditional_expression(&mut self, conditional_expression: &CondExpr) {
        self.add_type_and_positions(&TYPE_CONDITIONAL_EXPRESSION, &conditional_expression.span);
        // reserve test, consequent
        let reference_position = self.reserve_reference_positions(2);
        // alternate
        self.convert_expression(&conditional_expression.alt);
        // test
        self.update_reference_position(reference_position);
        self.convert_expression(&conditional_expression.test);
        // consequent
        self.update_reference_position(reference_position + 4);
        self.convert_expression(&conditional_expression.cons);
    }

    fn convert_function_declaration(&mut self, function_declaration: &FnDecl) {
        let function = &function_declaration.function;
        self.store_function_node(
            &TYPE_FUNCTION_DECLARATION,
            function.span.lo.0,
            function.span.hi.0, function.is_async,
            function.is_generator,
            Some(&function_declaration.ident),
            &function.params,
            function.body.as_ref().unwrap(),
        );
    }

    fn convert_class_expression(&mut self, class_expression: &ClassExpr, node_type: &[u8; 4]) {
        self.store_class_node(node_type, class_expression.ident.as_ref(), &class_expression.class);
    }

    fn convert_class_declaration(&mut self, class_declaration: &ClassDecl) {
        self.store_class_node(&TYPE_CLASS_DECLARATION, Some(&class_declaration.ident), &class_declaration.class);
    }

    fn store_class_node(&mut self, node_type: &[u8; 4], identifier: Option<&Ident>, class: &Class) {
        self.add_type_and_positions(node_type, &class.span);
        // reserve id, super_class, body
        let reference_position = self.reserve_reference_positions(3);
        let mut body_start_search = class.span.lo.0 - 1;
        // id
        identifier.map(|identifier| {
            self.update_reference_position(reference_position);
            self.convert_identifier(identifier);
            body_start_search = identifier.span.hi.0 - 1;
        });
        // super_class
        class.super_class.as_ref().map(|super_class| {
            self.update_reference_position(reference_position + 4);
            let super_class_position = self.buffer.len();
            self.convert_expression(super_class);
            let body_start_search_bytes: [u8; 4] = self.buffer[super_class_position + 8..super_class_position + 12].try_into().unwrap();
            body_start_search = u32::from_ne_bytes(body_start_search_bytes);
        });
        // body
        self.update_reference_position(reference_position + 8);
        let class_body_start = find_first_occurrence_outside_comment(self.code, b'{', body_start_search);
        self.convert_class_body(&class.body, class_body_start, class.span.hi.0 - 1);
    }

    fn convert_class_body(&mut self, class_members: &Vec<ClassMember>, start: u32, end: u32) {
        // type
        self.buffer.extend_from_slice(&TYPE_CLASS_BODY);
        // start
        self.buffer.extend_from_slice(&start.to_ne_bytes());
        // end
        self.buffer.extend_from_slice(&end.to_ne_bytes());
        // body
        self.convert_item_list(class_members, |ast_converter, class_member| ast_converter.convert_class_member(class_member));
    }

    fn convert_return_statement(&mut self, return_statement: &ReturnStmt) {
        self.add_type_and_positions(&TYPE_RETURN_STATEMENT, &return_statement.span);
        // reserve argument
        let reference_position = self.reserve_reference_positions(1);
        // argument
        return_statement.arg.as_ref().map(|argument| {
            self.update_reference_position(reference_position);
            self.convert_expression(argument)
        });
    }

    fn convert_object_literal(&mut self, object_literal: &ObjectLit) {
        self.add_type_and_positions(&TYPE_OBJECT_LITERAL, &object_literal.span);
        // properties
        self.convert_item_list(&object_literal.props, |ast_converter, property_or_spread| ast_converter.convert_property_or_spread(property_or_spread));
    }

    fn convert_key_value_property(&mut self, key_value_property: &KeyValueProp, node_type: &[u8; 4]) {
        // type
        self.buffer.extend_from_slice(node_type);
        // reserve start, end, key
        let reference_position = self.reserve_reference_positions(3);
        // value
        let value_position = self.buffer.len();
        self.convert_expression(&key_value_property.value);
        // key
        let key_position = self.buffer.len();
        self.update_reference_position(reference_position + 8);
        self.convert_property_name(&key_value_property.key);
        // start
        let key_start: [u8; 4] = self.buffer[key_position + 4..key_position + 8].try_into().unwrap();
        self.buffer[reference_position..reference_position + 4].copy_from_slice(&key_start);
        // end
        let value_end: [u8; 4] = self.buffer[value_position + 8..value_position + 12].try_into().unwrap();
        self.buffer[reference_position + 4..reference_position + 8].copy_from_slice(&value_end);
    }

    fn convert_property_name(&mut self, property_name: &PropName) {
        match property_name {
            PropName::Ident(ident) => self.convert_identifier(ident),
            PropName::Computed(computed_property_name) => self.convert_expression(computed_property_name.expr.as_ref()),
            _ => {
                dbg!(property_name);
                todo!("Cannot convert PropertyName");
            }
        }
    }

    fn convert_shorthand_property(&mut self, identifier: &Ident) {
        self.add_type_and_positions(&TYPE_SHORTHAND_PROPERTY, &identifier.span);
        // key/value
        self.convert_identifier(identifier);
    }

    fn convert_getter_property(&mut self, getter_property: &GetterProp) {
        self.add_type_and_positions(&TYPE_GETTER_PROPERTY, &getter_property.span);
        // reserve value
        let reference_position = self.reserve_reference_positions(1);
        // key
        let key_position = self.buffer.len();
        self.convert_property_name(&getter_property.key);
        // value
        match &getter_property.body {
            Some(block_statement) => {
                self.update_reference_position(reference_position);
                let key_end = u32::from_ne_bytes(self.buffer[key_position + 8..key_position + 12].try_into().unwrap());
                self.store_function_node(
                    &TYPE_FUNCTION_EXPRESSION,
                    find_first_occurrence_outside_comment(self.code, b'(', key_end) + 1,
                    block_statement.span.hi.0,
                    false,
                    false,
                    None,
                    &vec![],
                    block_statement,
                );
            }
            None => {
                panic!("Getter property without body");
            }
        }
    }

    fn convert_assignment_expression(&mut self, assignment_expression: &AssignExpr) {
        self.add_type_and_positions(&TYPE_ASSIGNMENT_EXPRESSION, &assignment_expression.span);
        // reserve left, right
        let reference_position = self.reserve_reference_positions(2);
        // operator
        self.convert_string(match assignment_expression.op {
            AssignOp::Assign => "=",
            AssignOp::AddAssign => "+=",
            AssignOp::SubAssign => "-=",
            AssignOp::MulAssign => "*=",
            AssignOp::DivAssign => "/=",
            AssignOp::ModAssign => "%=",
            AssignOp::LShiftAssign => "<<=",
            AssignOp::RShiftAssign => ">>=",
            AssignOp::ZeroFillRShiftAssign => ">>>=",
            AssignOp::BitOrAssign => "|=",
            AssignOp::BitXorAssign => "^=",
            AssignOp::BitAndAssign => "&=",
            AssignOp::ExpAssign => "**=",
            AssignOp::AndAssign => "&&=",
            AssignOp::OrAssign => "||=",
            AssignOp::NullishAssign => "??="
        });
        // left
        self.update_reference_position(reference_position);
        self.convert_pattern_or_expression(&assignment_expression.left);
        // right
        self.update_reference_position(reference_position + 4);
        self.convert_expression(&assignment_expression.right);
    }

    fn convert_new_expression(&mut self, new_expression: &NewExpr) {
        self.add_type_and_positions(&TYPE_NEW_EXPRESSION, &new_expression.span);
        // reserve args
        let reference_position = self.reserve_reference_positions(1);
        // callee
        self.convert_expression(&new_expression.callee);
        // args
        match &new_expression.args {
            Some(expressions_or_spread) => {
                self.update_reference_position(reference_position);
                self.convert_item_list(&expressions_or_spread, |ast_converter, expression_or_spread| ast_converter.convert_expression_or_spread(expression_or_spread));
            }
            None => {}
        }
    }

    fn convert_function_expression(&mut self, function_expression: &FnExpr, node_type: &[u8; 4]) {
        let function = &function_expression.function;
        self.store_function_node(
            node_type,
            function.span.lo.0,
            function.span.hi.0, function.is_async,
            function.is_generator,
            function_expression.ident.as_ref(),
            &function.params,
            function.body.as_ref().unwrap(),
        );
    }

    fn store_function_node(&mut self, node_type: &[u8; 4], start: u32, end: u32, is_async: bool, is_generator: bool, identifier: Option<&Ident>, parameters: &Vec<Param>, body: &BlockStmt) {
        // type
        self.buffer.extend_from_slice(node_type);
        // start
        self.buffer.extend_from_slice(&(start - 1).to_ne_bytes());
        // end
        self.buffer.extend_from_slice(&(end - 1).to_ne_bytes());
        // async
        self.convert_boolean(is_async);
        // generator
        self.convert_boolean(is_generator);
        // reserve id, params
        let reference_position = self.reserve_reference_positions(2);
        // body
        self.convert_block_statement(body);
        // id
        identifier.map(|ident| {
            self.update_reference_position(reference_position);
            self.convert_identifier(ident);
        });
        // params
        self.update_reference_position(reference_position + 4);
        self.convert_item_list(parameters, |ast_converter, param| ast_converter.convert_pattern(&param.pat));
    }

    fn convert_throw_statement(&mut self, throw_statement: &ThrowStmt) {
        self.add_type_and_positions(&TYPE_THROW_STATEMENT, &throw_statement.span);
        // argument
        self.convert_expression(&throw_statement.arg);
    }

    fn convert_assignment_pattern(&mut self, assignment_pattern: &AssignPat) {
        self.add_type_and_positions(&TYPE_ASSIGNMENT_PATTERN, &assignment_pattern.span);
        // reserve left
        let reference_position = self.reserve_reference_positions(1);
        // right
        self.convert_expression(&assignment_pattern.right);
        // left
        self.update_reference_position(reference_position);
        self.convert_pattern(&*assignment_pattern.left);
    }

    fn convert_await_expression(&mut self, await_expression: &AwaitExpr) {
        self.add_type_and_positions(&TYPE_AWAIT_EXPRESSION, &await_expression.span);
        // argument
        self.convert_expression(&await_expression.arg);
    }

    fn convert_labeled_statement(&mut self, labeled_statement: &LabeledStmt) {
        self.add_type_and_positions(&TYPE_LABELED_STATEMENT, &labeled_statement.span);
        // reserve body
        let reference_position = self.reserve_reference_positions(1);
        // label
        self.convert_identifier(&labeled_statement.label);
        // body
        self.update_reference_position(reference_position);
        self.convert_statement(&labeled_statement.body);
    }

    fn convert_break_statement(&mut self, break_statement: &BreakStmt) {
        self.add_type_and_positions(&TYPE_BREAK_STATEMENT, &break_statement.span);
        // reserve label
        let reference_position = self.reserve_reference_positions(1);
        // label
        break_statement.label.as_ref().map(|label| {
            self.update_reference_position(reference_position);
            self.convert_identifier(label);
        });
    }

    fn convert_try_statement(&mut self, try_statement: &TryStmt) {
        self.add_type_and_positions(&TYPE_TRY_STATEMENT, &try_statement.span);
        // reserve handler, finalizer
        let reference_position = self.reserve_reference_positions(2);
        // block
        self.convert_block_statement(&try_statement.block);
        // handler
        try_statement.handler.as_ref().map(|catch_clause| {
            self.update_reference_position(reference_position);
            self.convert_catch_clause(catch_clause);
        });
        // finalizer
        try_statement.finalizer.as_ref().map(|block_statement| {
            self.update_reference_position(reference_position + 4);
            self.convert_block_statement(block_statement);
        });
    }

    fn convert_catch_clause(&mut self, catch_clause: &CatchClause) {
        self.add_type_and_positions(&TYPE_CATCH_CLAUSE, &catch_clause.span);
        // reserve param
        let reference_position = self.reserve_reference_positions(1);
        // body
        self.convert_block_statement(&catch_clause.body);
        // param
        catch_clause.param.as_ref().map(|pattern| {
            self.update_reference_position(reference_position);
            self.convert_pattern(pattern);
        });
    }

    // TODO Lukas there is a bug in the logic as nested chain expression may not be handled correctly
    fn convert_optional_chain_expression(&mut self, optional_chain_expression: &OptChainExpr) {
        match self.chain_state {
            ChainState::None => {
                self.chain_state = ChainState::Chained;
                self.add_type_and_positions(&TYPE_CHAIN_EXPRESSION, &optional_chain_expression.span);
                // expression
                self.convert_optional_chain_base(&optional_chain_expression.base, optional_chain_expression.optional);
                self.chain_state = ChainState::None;
            }
            ChainState::Chained => {
                self.convert_optional_chain_base(&optional_chain_expression.base, optional_chain_expression.optional);
            }
        };
    }

    fn convert_while_statement(&mut self, while_statement: &WhileStmt) {
        self.add_type_and_positions(&TYPE_WHILE_STATEMENT, &while_statement.span);
        // reserve test
        let reference_position = self.reserve_reference_positions(1);
        // body
        self.convert_statement(&while_statement.body);
        // test
        self.update_reference_position(reference_position);
        self.convert_expression(&while_statement.test);
    }

    fn convert_continue_statement(&mut self, continue_statement: &ContinueStmt) {
        self.add_type_and_positions(&TYPE_CONTINUE_STATEMENT, &continue_statement.span);
        // reserve label
        let reference_position = self.reserve_reference_positions(1);
        // label
        continue_statement.label.as_ref().map(|label| {
            self.update_reference_position(reference_position);
            self.convert_identifier(label);
        });
    }

    fn convert_do_while_statement(&mut self, do_while_statement: &DoWhileStmt) {
        self.add_type_and_positions(&TYPE_DO_WHILE_STATEMENT, &do_while_statement.span);
        // reserve test
        let reference_position = self.reserve_reference_positions(1);
        // body
        self.convert_statement(&do_while_statement.body);
        // test
        self.update_reference_position(reference_position);
        self.convert_expression(&do_while_statement.test);
    }

    fn convert_debugger_statement(&mut self, debugger_statement: &DebuggerStmt) {
        self.add_type_and_positions(&TYPE_DEBUGGER_STATEMENT, &debugger_statement.span);
    }

    fn convert_empty_statement(&mut self, emtpy_statement: &EmptyStmt) {
        self.add_type_and_positions(&TYPE_EMPTY_STATEMENT, &emtpy_statement.span);
    }

    fn convert_for_in_statement(&mut self, for_in_statement: &ForInStmt) {
        self.add_type_and_positions(&TYPE_FOR_IN_STATEMENT, &for_in_statement.span);
        // reserve left, right
        let reference_position = self.reserve_reference_positions(2);
        // body
        self.convert_statement(&for_in_statement.body);
        // left
        self.update_reference_position(reference_position);
        self.convert_for_head(&for_in_statement.left);
        // right
        self.update_reference_position(reference_position + 4);
        self.convert_expression(&for_in_statement.right);
    }

    fn convert_for_of_statement(&mut self, for_of_statement: &ForOfStmt) {
        self.add_type_and_positions(&TYPE_FOR_OF_STATEMENT, &for_of_statement.span);
        // await
        self.convert_boolean(for_of_statement.is_await);
        // reserve left, right
        let reference_position = self.reserve_reference_positions(2);
        // body
        self.convert_statement(&for_of_statement.body);
        // left
        self.update_reference_position(reference_position);
        self.convert_for_head(&for_of_statement.left);
        // right
        self.update_reference_position(reference_position + 4);
        self.convert_expression(&for_of_statement.right);
    }

    fn convert_for_statement(&mut self, for_statement: &ForStmt) {
        self.add_type_and_positions(&TYPE_FOR_STATEMENT, &for_statement.span);
        // reserve init, test, update
        let reference_position = self.reserve_reference_positions(3);
        // body
        self.convert_statement(&for_statement.body);
        // init
        for_statement.init.as_ref().map(|init| {
            self.update_reference_position(reference_position);
            self.convert_variable_declaration_or_expression(init);
        });
        // test
        for_statement.test.as_ref().map(|test| {
            self.update_reference_position(reference_position + 4);
            self.convert_expression(test);
        });
        // update
        for_statement.update.as_ref().map(|update| {
            self.update_reference_position(reference_position + 8);
            self.convert_expression(update);
        });
    }

    fn convert_if_statement(&mut self, if_statement: &IfStmt) {
        self.add_type_and_positions(&TYPE_IF_STATEMENT, &if_statement.span);
        // reserve consequent, alternate
        let reference_position = self.reserve_reference_positions(2);
        // test
        self.convert_expression(&if_statement.test);
        // consequent
        self.update_reference_position(reference_position);
        self.convert_statement(&if_statement.cons);
        // alternate
        if_statement.alt.as_ref().map(|alt| {
            self.update_reference_position(reference_position + 4);
            self.convert_statement(alt);
        });
    }

    fn convert_literal_regex(&mut self, regex: &Regex) {
        self.add_type_and_positions(&TYPE_LITERAL_REGEXP, &regex.span);
        // reserve pattern
        let reference_position = self.reserve_reference_positions(1);
        // flags
        self.convert_string(&regex.flags);
        // pattern
        self.update_reference_position(reference_position);
        self.convert_string(&regex.exp);
    }

    fn convert_literal_bigint(&mut self, bigint: &BigInt) {
        self.add_type_and_positions(&TYPE_LITERAL_BIGINT, &bigint.span);
        // reserve value
        let reference_position = self.reserve_reference_positions(1);
        // raw
        self.convert_string(bigint.raw.as_ref().unwrap());
        // value
        self.update_reference_position(reference_position);
        self.convert_string(&bigint.value.to_str_radix(10));
    }
}

// These need to reflect the order in the JavaScript decoder
const TYPE_ARRAY_EXPRESSION: [u8; 4] = 0u32.to_ne_bytes();
const TYPE_ARRAY_PATTERN: [u8; 4] = 1u32.to_ne_bytes();
const TYPE_ARROW_FUNCTION_EXPRESSION: [u8; 4] = 2u32.to_ne_bytes();
const TYPE_ASSIGNMENT_EXPRESSION: [u8; 4] = 3u32.to_ne_bytes();
const TYPE_ASSIGNMENT_PATTERN: [u8; 4] = 4u32.to_ne_bytes();
const TYPE_AWAIT_EXPRESSION: [u8; 4] = 5u32.to_ne_bytes();
const TYPE_BINARY_EXPRESSION: [u8; 4] = 6u32.to_ne_bytes();
const TYPE_BLOCK_STATEMENT: [u8; 4] = 7u32.to_ne_bytes();
const TYPE_BREAK_STATEMENT: [u8; 4] = 8u32.to_ne_bytes();
const TYPE_CALL_EXPRESSION: [u8; 4] = 9u32.to_ne_bytes();
const TYPE_CATCH_CLAUSE: [u8; 4] = 10u32.to_ne_bytes();
const TYPE_CHAIN_EXPRESSION: [u8; 4] = 11u32.to_ne_bytes();
const TYPE_CLASS_BODY: [u8; 4] = 12u32.to_ne_bytes();
const TYPE_CLASS_DECLARATION: [u8; 4] = 13u32.to_ne_bytes();
const TYPE_CLASS_EXPRESSION: [u8; 4] = 14u32.to_ne_bytes();
const TYPE_CONDITIONAL_EXPRESSION: [u8; 4] = 15u32.to_ne_bytes();
const TYPE_CONTINUE_STATEMENT: [u8; 4] = 16u32.to_ne_bytes();
const TYPE_DEBUGGER_STATEMENT: [u8; 4] = 17u32.to_ne_bytes();
const TYPE_DO_WHILE_STATEMENT: [u8; 4] = 18u32.to_ne_bytes();
const TYPE_EMPTY_STATEMENT: [u8; 4] = 19u32.to_ne_bytes();
const TYPE_EXPORT_ALL_DECLARATION: [u8; 4] = 20u32.to_ne_bytes();
const TYPE_EXPORT_DEFAULT_DECLARATION: [u8; 4] = 21u32.to_ne_bytes();
const TYPE_EXPORT_NAMED_DECLARATION: [u8; 4] = 22u32.to_ne_bytes();
const TYPE_EXPORT_SPECIFIER: [u8; 4] = 23u32.to_ne_bytes();
const TYPE_EXPRESSION_STATEMENT: [u8; 4] = 24u32.to_ne_bytes();
const TYPE_FOR_IN_STATEMENT: [u8; 4] = 25u32.to_ne_bytes();
const TYPE_FOR_OF_STATEMENT: [u8; 4] = 26u32.to_ne_bytes();
const TYPE_FOR_STATEMENT: [u8; 4] = 27u32.to_ne_bytes();
const TYPE_FUNCTION_DECLARATION: [u8; 4] = 28u32.to_ne_bytes();
const TYPE_FUNCTION_EXPRESSION: [u8; 4] = 29u32.to_ne_bytes();
const TYPE_IDENTIFIER: [u8; 4] = 30u32.to_ne_bytes();
const TYPE_IF_STATEMENT: [u8; 4] = 31u32.to_ne_bytes();
const TYPE_IMPORT_ATTRIBUTE: [u8; 4] = 32u32.to_ne_bytes();
const TYPE_IMPORT_DECLARATION: [u8; 4] = 33u32.to_ne_bytes();
const TYPE_IMPORT_DEFAULT_SPECIFIER: [u8; 4] = 34u32.to_ne_bytes();
const TYPE_IMPORT_EXPRESSION: [u8; 4] = 35u32.to_ne_bytes();
const TYPE_IMPORT_NAMESPACE_SPECIFIER: [u8; 4] = 36u32.to_ne_bytes();
const TYPE_IMPORT_SPECIFIER: [u8; 4] = 37u32.to_ne_bytes();
const TYPE_LABELED_STATEMENT: [u8; 4] = 38u32.to_ne_bytes();
const TYPE_LITERAL_STRING: [u8; 4] = 39u32.to_ne_bytes();
const TYPE_LITERAL_BOOLEAN: [u8; 4] = 40u32.to_ne_bytes();
const TYPE_LITERAL_NUMBER: [u8; 4] = 41u32.to_ne_bytes();
const TYPE_LITERAL_NULL: [u8; 4] = 42u32.to_ne_bytes();
const TYPE_LITERAL_REGEXP: [u8; 4] = 43u32.to_ne_bytes();
const TYPE_LITERAL_BIGINT: [u8; 4] = 44u32.to_ne_bytes();
const TYPE_LOGICAL_EXPRESSION: [u8; 4] = 45u32.to_ne_bytes();
const TYPE_MEMBER_EXPRESSION: [u8; 4] = 46u32.to_ne_bytes();

const TYPE_MODULE: [u8; 4] = 47u32.to_ne_bytes();
const TYPE_VARIABLE_DECLARATION: [u8; 4] = 48u32.to_ne_bytes();
const TYPE_VARIABLE_DECLARATOR: [u8; 4] = 49u32.to_ne_bytes();
const TYPE_SPREAD: [u8; 4] = 50u32.to_ne_bytes();
const TYPE_PRIVATE_NAME: [u8; 4] = 51u32.to_ne_bytes();
const TYPE_OBJECT_PATTERN: [u8; 4] = 52u32.to_ne_bytes();
const TYPE_ASSIGNMENT_PATTERN_PROPERTY: [u8; 4] = 53u32.to_ne_bytes();
const TYPE_RETURN_STATEMENT: [u8; 4] = 54u32.to_ne_bytes();
const TYPE_OBJECT_LITERAL: [u8; 4] = 55u32.to_ne_bytes();
const TYPE_KEY_VALUE_PROPERTY: [u8; 4] = 56u32.to_ne_bytes();
const TYPE_SHORTHAND_PROPERTY: [u8; 4] = 57u32.to_ne_bytes();
const TYPE_GETTER_PROPERTY: [u8; 4] = 58u32.to_ne_bytes();
const TYPE_NEW_EXPRESSION: [u8; 4] = 59u32.to_ne_bytes();
const TYPE_THROW_STATEMENT: [u8; 4] = 60u32.to_ne_bytes();
const TYPE_TRY_STATEMENT: [u8; 4] = 61u32.to_ne_bytes();
const TYPE_WHILE_STATEMENT: [u8; 4] = 62u32.to_ne_bytes();

// other constants
const DECLARATION_KIND_VAR: [u8; 4] = 0u32.to_ne_bytes();
const DECLARATION_KIND_LET: [u8; 4] = 1u32.to_ne_bytes();
const DECLARATION_KIND_CONST: [u8; 4] = 2u32.to_ne_bytes();

#[derive(Debug)]
enum StoredCallee<'a> {
    Expression(&'a Expr),
    Super(&'a Super),
}

#[derive(Debug)]
enum StoredDefaultExportExpression<'a> {
    Expression(&'a Expr),
    Class(&'a ClassExpr),
    Function(&'a FnExpr),
}
