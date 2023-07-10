use napi::bindgen_prelude::*;
use swc_common::Span;
use swc_ecma_ast::{ArrowExpr, BindingIdent, BlockStmt, BlockStmtOrExpr, Bool, Callee, CallExpr, Decl, ExportDecl, ExportDefaultExpr, ExportNamedSpecifier, ExportSpecifier, Expr, ExprOrSpread, ExprStmt, Ident, ImportDecl, ImportDefaultSpecifier, ImportNamedSpecifier, ImportSpecifier, Lit, MemberExpr, MemberProp, Module, ModuleDecl, ModuleExportName, ModuleItem, NamedExport, Number, Null, Pat, PrivateName, Program, Stmt, Str, VarDecl, VarDeclarator, VarDeclKind, ImportStarAsSpecifier, ExportAll, BinExpr, BinaryOp, ArrayPat, ObjectPat, ObjectPatProp, AssignPatProp, ArrayLit, CondExpr, FnDecl, ClassDecl, ClassMember, ReturnStmt, ObjectLit, PropOrSpread, Prop, KeyValueProp, PropName, GetterProp, AssignExpr, AssignOp, PatOrExpr, NewExpr, FnExpr, ParenExpr, Param, ThrowStmt, ExportDefaultDecl, DefaultDecl};
use crate::convert_ast::converter::analyze_code::find_first_occurrence_outside_comment;

mod analyze_code;

pub struct AstConverter<'a> {
    buffer: Vec<u8>,
    code: &'a [u8],
}

impl<'a> AstConverter<'a> {
    pub fn new(code: &'a [u8]) -> Self {
        Self {
            // TODO Lukas This is just a wild guess and should be refined with a large block of minified code
            buffer: Vec::with_capacity(20 * code.len()),
            code,
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

    // TODO Lukas instead of returning the updated value, maybe we just add in place everywhere
    fn update_reference_position(&mut self, reference_position: usize) -> usize {
        let insert_position = (self.buffer.len() as u32) >> 2;
        self.buffer[reference_position..reference_position + 4].copy_from_slice(&insert_position.to_ne_bytes());
        reference_position + 4
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
            Stmt::Expr(expression_statement) => self.convert_expression_statement(expression_statement),
            Stmt::Decl(declaration) => self.convert_declaration(declaration),
            Stmt::Return(return_statement) => self.convert_return_statement(return_statement),
            Stmt::Throw(throw_statement) => self.convert_throw_statement(throw_statement),
            _ => {
                dbg!(statement);
                todo!("Cannot convert Statement");
            }
        }
    }

    fn convert_expression(&mut self, expression: &Expr) {
        match expression {
            Expr::Lit(literal) => self.convert_literal(literal),
            Expr::Call(call_expression) => self.convert_call_expression(call_expression),
            Expr::Ident(identifier) => self.convert_identifier(identifier),
            Expr::Arrow(arrow_expression) => self.convert_arrow_expression(arrow_expression),
            Expr::Member(member_expression) => self.convert_member_expression(member_expression),
            Expr::Bin(binary_expression) => self.convert_binary_expression(binary_expression),
            Expr::Array(array_literal) => self.convert_array_literal(array_literal),
            Expr::Cond(conditional_expression) => self.convert_conditional_expression(conditional_expression),
            Expr::Object(object_literal) => self.convert_object_literal(object_literal),
            Expr::Assign(assignment_expression) => self.convert_assignment_expression(assignment_expression),
            Expr::New(new_expression) => self.convert_new_expression(new_expression),
            Expr::Fn(function_expression) => self.convert_function_expression(function_expression, &TYPE_FUNCTION_EXPRESSION),
            Expr::Paren(parenthesized_expression) => self.convert_parenthesized_expression(parenthesized_expression),
            _ => {
                dbg!(expression);
                todo!("Cannot convert Expression");
            }
        }
    }

    fn convert_literal(&mut self, literal: &Lit) {
        match literal {
            Lit::Num(number_literal) => self.convert_literal_number(number_literal),
            Lit::Str(string_literal) => self.convert_literal_string(string_literal),
            Lit::Bool(boolean_literal) => self.convert_literal_boolean(boolean_literal),
            Lit::Null(null_literal) => self.convert_literal_null(null_literal),
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
            },
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
            Pat::Ident(binding_identifier) => self.convert_binding_identifier(binding_identifier),
            Pat::Array(array_pattern) => self.convert_array_pattern(array_pattern),
            Pat::Object(object) => self.convert_object_pattern(object),
            Pat::Expr(expression) => self.convert_expression(expression),
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

    // TODO Lukas find out when memory is reserved for the buffer
    fn convert_callee(&mut self, callee: &Callee) {
        match callee {
            Callee::Expr(expr) => self.convert_expression(expr),
            _ => {
                dbg!(callee);
                todo!("Cannot convert Callee");
            }
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
            Prop::KeyValue(key_value_property) => self.convert_key_value_property(key_value_property),
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

    fn convert_export_declaration(&mut self, export_declaration: &ExportDecl) {
        self.add_type_and_positions(&TYPE_EXPORT_DECLARATION, &export_declaration.span);
        // declaration
        self.convert_declaration(&export_declaration.decl);
    }

    fn convert_export_named_declaration(&mut self, export_named_declaration: &NamedExport) {
        self.add_type_and_positions(&TYPE_NAMED_EXPORT, &export_named_declaration.span);
        // reserve for src
        let reference_position = self.reserve_reference_positions(1);
        // specifiers
        self.convert_item_list(&export_named_declaration.specifiers, |ast_converter, specifier| ast_converter.convert_export_specifier(specifier));
        // src
        export_named_declaration.src.as_ref().map(|src| {
            self.update_reference_position(reference_position);
            self.convert_literal_string(&*src);
        });
    }

    fn convert_literal_number(&mut self, literal: &Number) {
        self.add_type_and_positions(&TYPE_NUMBER, &literal.span);
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
        self.add_type_and_positions(&TYPE_STRING, &literal.span);
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
        self.add_type_and_positions(&TYPE_EXPORT_NAMED_SPECIFIER, &export_named_specifier.span);
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
        // reserve for src
        let reference_position = self.reserve_reference_positions(1);
        // specifiers
        self.convert_item_list(&import_declaration.specifiers, |ast_converter, import_specifier| ast_converter.convert_import_specifier(import_specifier));
        // src
        self.update_reference_position(reference_position);
        self.convert_literal_string(&*import_declaration.src);
    }

    fn convert_call_expression(&mut self, call_expression: &CallExpr) {
        match call_expression.callee {
            Callee::Import(_) => {
                self.add_type_and_positions(&TYPE_IMPORT_EXPRESSION, &call_expression.span);
                // source
                self.convert_expression(call_expression.args.first().unwrap().expr.as_ref());
            }
            _ => {
                self.add_type_and_positions(&TYPE_CALL_EXPRESSION, &call_expression.span);
                // reserve for callee
                let reference_position = self.reserve_reference_positions(1);
                // arguments
                self.convert_item_list(&call_expression.args, |ast_converter, argument| ast_converter.convert_expression_or_spread(argument));
                // callee
                self.update_reference_position(reference_position);
                self.convert_callee(&call_expression.callee);
            }
        }
    }

    fn convert_import_named_specifier(&mut self, import_named_specifier: &ImportNamedSpecifier) {
        self.add_type_and_positions(&TYPE_IMPORT_NAMED_SPECIFIER, &import_named_specifier.span);
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
        self.add_type_and_positions(&TYPE_ARROW_EXPRESSION, &arrow_expression.span);
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

    fn convert_member_expression(&mut self, member_expression: &MemberExpr) {
        self.add_type_and_positions(&TYPE_MEMBER_EXPRESSION, &member_expression.span);
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
        self.add_type_and_positions(&TYPE_BOOLEAN, &literal.span);
        // value^
        self.convert_boolean(literal.value);
    }

    fn convert_export_default_expression(&mut self, export_default_expression: &ExportDefaultExpr) {
        self.add_type_and_positions(&TYPE_EXPORT_DEFAULT_DECLARATION, &export_default_expression.span);
        // expression
        self.convert_expression(&export_default_expression.expr);
    }

    fn convert_literal_null(&mut self, literal: &Null) {
        self.add_type_and_positions(&TYPE_NULL, &literal.span);
    }

    fn convert_import_namespace_specifier(&mut self, import_namespace_specifier: &ImportStarAsSpecifier) {
        self.add_type_and_positions(&TYPE_IMPORT_NAMESPACE_SPECIFIER, &import_namespace_specifier.span);
        // local
        self.convert_identifier(&import_namespace_specifier.local);
    }

    fn convert_export_all(&mut self, export_all: &ExportAll) {
        self.add_type_and_positions(&TYPE_EXPORT_ALL, &export_all.span);
        // source
        self.convert_literal_string(&export_all.src);
    }

    fn convert_binary_expression(&mut self, binary_expression: &BinExpr) {
        self.add_type_and_positions(&TYPE_BINARY_EXPRESSION, &binary_expression.span);
        // reserve left, right
        let mut reference_position = self.reserve_reference_positions(2);
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
        reference_position = self.update_reference_position(reference_position);
        self.convert_expression(&binary_expression.left);
        // right
        self.update_reference_position(reference_position);
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
        self.add_type_and_positions(&TYPE_ARRAY_LITERAL, &array_literal.span);
        // elements
        self.convert_item_list(&array_literal.elems, |ast_converter, element| match element {
            Some(element) => ast_converter.convert_expression_or_spread(element),
            None => ast_converter.convert_boolean(false),
        });
    }

    fn convert_conditional_expression(&mut self, conditional_expression: &CondExpr) {
        self.add_type_and_positions(&TYPE_CONDITIONAL_EXPRESSION, &conditional_expression.span);
        // reserve test, consequent
        let mut reference_position = self.reserve_reference_positions(2);
        // alternate
        self.convert_expression(&conditional_expression.alt);
        // test
        reference_position = self.update_reference_position(reference_position);
        self.convert_expression(&conditional_expression.test);
        // consequent
        self.update_reference_position(reference_position);
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

    fn convert_class_declaration(&mut self, class_declaration: &ClassDecl) {
        let class = &class_declaration.class;
        self.add_type_and_positions(&TYPE_CLASS_DECLARATION, &class.span);
        // reserve body, super_class
        let mut reference_position = self.reserve_reference_positions(2);
        // id
        let id_position = self.buffer.len();
        self.convert_identifier(&class_declaration.ident);
        let body_start: [u8; 4];
        // super_class
        match class.super_class.as_ref() {
            Some(super_class) => {
                reference_position = self.update_reference_position(reference_position);
                let super_class_position = self.buffer.len();
                self.convert_expression(super_class);
                // set the end to the end of the super class if it exists
                body_start = self.buffer[super_class_position + 8..super_class_position + 12].try_into().unwrap();
            }
            None => {
                reference_position += 4;
                // set the end to the end of the id if no super class exists
                body_start = self.buffer[id_position + 8..id_position + 12].try_into().unwrap();
            }
        }
        // body
        self.update_reference_position(reference_position);
        let class_body_start = find_first_occurrence_outside_comment(self.code, b'{', u32::from_ne_bytes(body_start));
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

    fn convert_key_value_property(&mut self, key_value_property: &KeyValueProp) {
        // type
        self.buffer.extend_from_slice(&TYPE_KEY_VALUE_PROPERTY);
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

    fn convert_export_default_declaration(&mut self, export_default_declaration: &ExportDefaultDecl) {
        self.add_type_and_positions(&TYPE_EXPORT_DEFAULT_DECLARATION, &export_default_declaration.span);
        // declaration
        match &export_default_declaration.decl {
            DefaultDecl::Fn(function_expression) => {
                self.convert_function_expression(&function_expression, &TYPE_FUNCTION_DECLARATION);
            }
            _ => {
                dbg!(&export_default_declaration.decl);
                todo!("Cannot convert ExportDefaultDeclaration");
            }
        }
    }
}

// These need to reflect the order in the JavaScript decoder
const TYPE_MODULE: [u8; 4] = 0u32.to_ne_bytes();
const TYPE_EXPRESSION_STATEMENT: [u8; 4] = 1u32.to_ne_bytes();
const TYPE_NUMBER: [u8; 4] = 2u32.to_ne_bytes();
const TYPE_EXPORT_DECLARATION: [u8; 4] = 3u32.to_ne_bytes();
const TYPE_NAMED_EXPORT: [u8; 4] = 4u32.to_ne_bytes();
const TYPE_VARIABLE_DECLARATION: [u8; 4] = 5u32.to_ne_bytes();
const TYPE_VARIABLE_DECLARATOR: [u8; 4] = 6u32.to_ne_bytes();
const TYPE_IDENTIFIER: [u8; 4] = 7u32.to_ne_bytes();
const TYPE_STRING: [u8; 4] = 8u32.to_ne_bytes();
const TYPE_EXPORT_NAMED_SPECIFIER: [u8; 4] = 9u32.to_ne_bytes();
const TYPE_IMPORT_DECLARATION: [u8; 4] = 10u32.to_ne_bytes();
const TYPE_IMPORT_NAMED_SPECIFIER: [u8; 4] = 11u32.to_ne_bytes();
const TYPE_CALL_EXPRESSION: [u8; 4] = 12u32.to_ne_bytes();
const TYPE_ARROW_EXPRESSION: [u8; 4] = 13u32.to_ne_bytes();
const TYPE_BLOCK_STATEMENT: [u8; 4] = 14u32.to_ne_bytes();
const TYPE_SPREAD: [u8; 4] = 15u32.to_ne_bytes();
const TYPE_MEMBER_EXPRESSION: [u8; 4] = 16u32.to_ne_bytes();
const TYPE_PRIVATE_NAME: [u8; 4] = 17u32.to_ne_bytes();
const TYPE_IMPORT_DEFAULT_SPECIFIER: [u8; 4] = 18u32.to_ne_bytes();
const TYPE_BOOLEAN: [u8; 4] = 19u32.to_ne_bytes();
const TYPE_EXPORT_DEFAULT_DECLARATION: [u8; 4] = 20u32.to_ne_bytes();
const TYPE_NULL: [u8; 4] = 21u32.to_ne_bytes();
const TYPE_IMPORT_NAMESPACE_SPECIFIER: [u8; 4] = 22u32.to_ne_bytes();
const TYPE_EXPORT_ALL: [u8; 4] = 23u32.to_ne_bytes();
const TYPE_BINARY_EXPRESSION: [u8; 4] = 24u32.to_ne_bytes();
const TYPE_ARRAY_PATTERN: [u8; 4] = 25u32.to_ne_bytes();
const TYPE_OBJECT_PATTERN: [u8; 4] = 26u32.to_ne_bytes();
const TYPE_ASSIGNMENT_PATTERN_PROPERTY: [u8; 4] = 27u32.to_ne_bytes();
const TYPE_ARRAY_LITERAL: [u8; 4] = 28u32.to_ne_bytes();
const TYPE_IMPORT_EXPRESSION: [u8; 4] = 29u32.to_ne_bytes();
const TYPE_CONDITIONAL_EXPRESSION: [u8; 4] = 30u32.to_ne_bytes();
const TYPE_FUNCTION_DECLARATION: [u8; 4] = 31u32.to_ne_bytes();
const TYPE_CLASS_DECLARATION: [u8; 4] = 32u32.to_ne_bytes();
const TYPE_CLASS_BODY: [u8; 4] = 33u32.to_ne_bytes();
const TYPE_RETURN_STATEMENT: [u8; 4] = 34u32.to_ne_bytes();
const TYPE_OBJECT_LITERAL: [u8; 4] = 35u32.to_ne_bytes();
const TYPE_KEY_VALUE_PROPERTY: [u8; 4] = 36u32.to_ne_bytes();
const TYPE_SHORTHAND_PROPERTY: [u8; 4] = 37u32.to_ne_bytes();
const TYPE_GETTER_PROPERTY: [u8; 4] = 38u32.to_ne_bytes();
const TYPE_ASSIGNMENT_EXPRESSION: [u8; 4] = 39u32.to_ne_bytes();
const TYPE_NEW_EXPRESSION: [u8; 4] = 40u32.to_ne_bytes();
const TYPE_FUNCTION_EXPRESSION: [u8; 4] = 41u32.to_ne_bytes();
const TYPE_THROW_STATEMENT: [u8; 4] = 42u32.to_ne_bytes();

// other constants
const DECLARATION_KIND_VAR: [u8; 4] = 0u32.to_ne_bytes();
const DECLARATION_KIND_LET: [u8; 4] = 1u32.to_ne_bytes();
const DECLARATION_KIND_CONST: [u8; 4] = 2u32.to_ne_bytes();
