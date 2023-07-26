use crate::convert_ast::converter::analyze_code::find_first_occurrence_outside_comment;
use crate::convert_ast::converter::utf16_positions::Utf8ToUtf16ByteIndexConverter;
use napi::bindgen_prelude::*;
use swc::atoms::JsWord;
use swc_common::Span;
use swc_ecma_ast::{
  ArrayLit, ArrayPat, ArrowExpr, AssignExpr, AssignOp, AssignPat, AssignPatProp, AwaitExpr, BigInt,
  BinExpr, BinaryOp, BindingIdent, BlockStmt, BlockStmtOrExpr, Bool, BreakStmt, CallExpr, Callee,
  CatchClause, Class, ClassDecl, ClassExpr, ClassMember, ClassMethod, ClassProp, ComputedPropName,
  CondExpr, Constructor, ContinueStmt, DebuggerStmt, Decl, DefaultDecl, DoWhileStmt, EmptyStmt,
  ExportAll, ExportDecl, ExportDefaultDecl, ExportDefaultExpr, ExportNamedSpecifier,
  ExportSpecifier, Expr, ExprOrSpread, ExprStmt, FnExpr, ForHead, ForInStmt, ForOfStmt, ForStmt,
  Function, GetterProp, Ident, IfStmt, ImportDecl, ImportDefaultSpecifier, ImportNamedSpecifier,
  ImportSpecifier, ImportStarAsSpecifier, KeyValuePatProp, KeyValueProp, LabeledStmt, Lit,
  MemberExpr, MemberProp, MetaPropExpr, MetaPropKind, MethodKind, MethodProp, Module, ModuleDecl,
  ModuleExportName, ModuleItem, NamedExport, NewExpr, Null, Number, ObjectLit, ObjectPat,
  ObjectPatProp, OptCall, OptChainBase, OptChainExpr, ParamOrTsParamProp, ParenExpr, Pat,
  PatOrExpr, PrivateMethod, PrivateName, PrivateProp, Program, Prop, PropName, PropOrSpread, Regex,
  RestPat, ReturnStmt, SeqExpr, SetterProp, SpreadElement, StaticBlock, Stmt, Str, Super,
  SuperProp, SuperPropExpr, SwitchCase, SwitchStmt, TaggedTpl, ThisExpr, ThrowStmt, Tpl,
  TplElement, TryStmt, UnaryExpr, UnaryOp, UpdateExpr, UpdateOp, VarDecl, VarDeclKind,
  VarDeclOrExpr, VarDeclarator, WhileStmt, YieldExpr,
};

mod analyze_code;
mod utf16_positions;

pub struct AstConverter<'a> {
  buffer: Vec<u8>,
  code: &'a [u8],
  index_converter: Utf8ToUtf16ByteIndexConverter,
}

impl<'a> AstConverter<'a> {
  pub fn new(code: &'a str) -> Self {
    Self {
      // TODO Lukas This is just a wild guess and should be refined with a large
      // block of minified code
      buffer: Vec::with_capacity(20 * code.len()),
      code: code.as_bytes(),
      index_converter: Utf8ToUtf16ByteIndexConverter::new(code),
    }
  }

  pub fn convert_ast_to_buffer(mut self, node: &Program) -> Buffer {
    self.convert_program(node);
    self.buffer.shrink_to_fit();
    self.buffer.into()
  }

  // === helpers
  fn add_type_and_positions(&mut self, node_type: &[u8; 4], span: &Span) {
    self.add_type_and_explicit_positions(node_type, span.lo.0 - 1, span.hi.0 - 1);
  }

  fn add_type_and_explicit_positions(&mut self, node_type: &[u8; 4], start: u32, end: u32) {
    // type
    self.buffer.extend_from_slice(node_type);
    // start
    self
      .buffer
      .extend_from_slice(&(self.index_converter.convert(start)).to_ne_bytes());
    // end
    self
      .buffer
      .extend_from_slice(&(self.index_converter.convert(end)).to_ne_bytes());
  }

  fn add_positions(&mut self, positions_index: usize, start: u32, end: u32) {
    self.buffer[positions_index..positions_index + 4]
      .copy_from_slice(&(self.index_converter.convert(start)).to_ne_bytes());
    self.buffer[positions_index + 4..positions_index + 8]
      .copy_from_slice(&(self.index_converter.convert(end)).to_ne_bytes());
  }

  fn convert_item_list<T, F>(&mut self, item_list: &[T], convert_item: F)
  where
    F: Fn(&mut AstConverter, &T) -> bool,
  {
    // store number of items in first position
    self
      .buffer
      .extend_from_slice(&(item_list.len() as u32).to_ne_bytes());
    let mut reference_position = self.buffer.len();
    // make room for the reference positions of the items
    self
      .buffer
      .resize(self.buffer.len() + item_list.len() * 4, 0);
    for item in item_list {
      let insert_position = (self.buffer.len() as u32) >> 2;
      if convert_item(self, item) {
        self.buffer[reference_position..reference_position + 4]
          .copy_from_slice(&insert_position.to_ne_bytes());
      }
      reference_position += 4;
    }
  }

  fn convert_item_list_with_state<T, F>(
    &mut self,
    item_list: &[T],
    state: &mut bool,
    convert_item: F,
  ) where
    F: Fn(&mut AstConverter, &T, &mut bool) -> bool,
  {
    // store number of items in first position
    self
      .buffer
      .extend_from_slice(&(item_list.len() as u32).to_ne_bytes());
    let mut reference_position = self.buffer.len();
    // make room for the reference positions of the items
    self
      .buffer
      .resize(self.buffer.len() + item_list.len() * 4, 0);
    for item in item_list {
      let insert_position = (self.buffer.len() as u32) >> 2;
      if convert_item(self, item, state) {
        self.buffer[reference_position..reference_position + 4]
          .copy_from_slice(&insert_position.to_ne_bytes());
      }
      reference_position += 4;
    }
  }

  // TODO Lukas deduplicate strings and see if we can easily compare atoms
  fn convert_string(&mut self, string: &str) {
    let length = string.len();
    let additional_length = ((length + 3) & !3) - length;
    self
      .buffer
      .extend_from_slice(&(length as u32).to_ne_bytes());
    self.buffer.extend_from_slice(string.as_bytes());
    self.buffer.resize(self.buffer.len() + additional_length, 0);
  }

  fn convert_boolean(&mut self, boolean: bool) {
    self
      .buffer
      .extend_from_slice(&(if boolean { 1u32 } else { 0u32 }).to_ne_bytes());
  }

  fn reserve_reference_positions(&mut self, item_count: usize) -> usize {
    let reference_position = self.buffer.len();
    self
      .buffer
      .resize(reference_position + (item_count << 2), 0);
    reference_position
  }

  fn update_reference_position(&mut self, reference_position: usize) {
    let insert_position = (self.buffer.len() as u32) >> 2;
    self.buffer[reference_position..reference_position + 4]
      .copy_from_slice(&insert_position.to_ne_bytes());
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
      Stmt::Block(block_statement) => self.convert_block_statement(block_statement, false),
      Stmt::Continue(continue_statement) => self.convert_continue_statement(continue_statement),
      Stmt::Decl(declaration) => self.convert_declaration(declaration),
      Stmt::Debugger(debugger_statement) => self.convert_debugger_statement(debugger_statement),
      Stmt::DoWhile(do_while_statement) => self.convert_do_while_statement(do_while_statement),
      Stmt::Empty(empty_statement) => self.convert_empty_statement(empty_statement),
      Stmt::Expr(expression_statement) => {
        self.convert_expression_statement(expression_statement, None)
      }
      Stmt::For(for_statement) => self.convert_for_statement(for_statement),
      Stmt::ForIn(for_in_statement) => self.convert_for_in_statement(for_in_statement),
      Stmt::ForOf(for_of_statement) => self.convert_for_of_statement(for_of_statement),
      Stmt::If(if_statement) => self.convert_if_statement(if_statement),
      Stmt::Labeled(labeled_statement) => self.convert_labeled_statement(labeled_statement),
      Stmt::Return(return_statement) => self.convert_return_statement(return_statement),
      Stmt::Switch(switch_statement) => self.convert_switch_statement(switch_statement),
      Stmt::Throw(throw_statement) => self.convert_throw_statement(throw_statement),
      Stmt::Try(try_statement) => self.convert_try_statement(try_statement),
      Stmt::While(while_statement) => self.convert_while_statement(while_statement),
      _ => {
        dbg!(statement);
        todo!("Cannot convert Statement");
      }
    }
  }

  fn convert_expression(&mut self, expression: &Expr) -> Span {
    match expression {
      Expr::Array(array_literal) => {
        self.convert_array_literal(array_literal);
        array_literal.span
      }
      Expr::Arrow(arrow_expression) => {
        self.convert_arrow_expression(arrow_expression);
        arrow_expression.span
      }
      Expr::Assign(assignment_expression) => {
        self.convert_assignment_expression(assignment_expression);
        assignment_expression.span
      }
      Expr::Await(await_expression) => {
        self.convert_await_expression(await_expression);
        await_expression.span
      }
      Expr::Bin(binary_expression) => {
        self.convert_binary_expression(binary_expression);
        binary_expression.span
      }
      Expr::Call(call_expression) => {
        self.convert_call_expression(call_expression, false, false);
        call_expression.span
      }
      Expr::Class(class_expression) => {
        self.convert_class_expression(class_expression, &TYPE_CLASS_EXPRESSION);
        class_expression.class.span
      }
      Expr::Cond(conditional_expression) => {
        self.convert_conditional_expression(conditional_expression);
        conditional_expression.span
      }
      Expr::Fn(function_expression) => {
        self.convert_function(
          &function_expression.function,
          &TYPE_FUNCTION_EXPRESSION,
          function_expression.ident.as_ref(),
        );
        function_expression.function.span
      }
      Expr::Ident(identifier) => {
        self.convert_identifier(identifier);
        identifier.span
      }
      Expr::Lit(literal) => self.convert_literal(literal),
      Expr::Member(member_expression) => {
        self.convert_member_expression(member_expression, false, false);
        member_expression.span
      }
      Expr::MetaProp(meta_property) => {
        self.convert_meta_property(meta_property);
        meta_property.span
      }
      Expr::New(new_expression) => {
        self.convert_new_expression(new_expression);
        new_expression.span
      }
      Expr::Object(object_literal) => {
        self.convert_object_literal(object_literal);
        object_literal.span
      }
      Expr::OptChain(optional_chain_expression) => {
        self.convert_optional_chain_expression(optional_chain_expression, false);
        optional_chain_expression.span
      }
      Expr::Paren(parenthesized_expression) => {
        self.convert_parenthesized_expression(parenthesized_expression);
        parenthesized_expression.span
      }
      Expr::Seq(sequence_expression) => {
        self.convert_sequence_expression(sequence_expression);
        sequence_expression.span
      }
      Expr::SuperProp(super_property) => {
        self.convert_super_property(super_property);
        super_property.span
      }
      Expr::TaggedTpl(tagged_template_expression) => {
        self.convert_tagged_template_expression(tagged_template_expression);
        tagged_template_expression.span
      }
      Expr::This(this_expression) => {
        self.convert_this_expression(this_expression);
        this_expression.span
      }
      Expr::Tpl(template_literal) => {
        self.convert_template_literal(template_literal);
        template_literal.span
      }
      Expr::Unary(unary_expression) => {
        self.convert_unary_expression(unary_expression);
        unary_expression.span
      }
      Expr::Update(update_expression) => {
        self.convert_update_expression(update_expression);
        update_expression.span
      }
      Expr::Yield(yield_expression) => {
        self.convert_yield_expression(yield_expression);
        yield_expression.span
      }
      _ => {
        dbg!(expression);
        todo!("Cannot convert Expression");
      }
    }
  }

  fn convert_literal(&mut self, literal: &Lit) -> Span {
    match literal {
      Lit::BigInt(bigint_literal) => {
        self.convert_literal_bigint(bigint_literal);
        bigint_literal.span
      }
      Lit::Bool(boolean_literal) => {
        self.convert_literal_boolean(boolean_literal);
        boolean_literal.span
      }
      Lit::Null(null_literal) => {
        self.convert_literal_null(null_literal);
        null_literal.span
      }
      Lit::Num(number_literal) => {
        self.convert_literal_number(number_literal);
        number_literal.span
      }
      Lit::Regex(regex_literal) => {
        self.convert_literal_regex(regex_literal);
        regex_literal.span
      }
      Lit::Str(string_literal) => {
        self.convert_literal_string(string_literal);
        string_literal.span
      }
      Lit::JSXText(_) => unimplemented!("Lit::JSXText"),
    }
  }

  fn convert_module_declaration(&mut self, module_declaration: &ModuleDecl) {
    match module_declaration {
      ModuleDecl::ExportDecl(export_declaration) => {
        self.convert_export_declaration(export_declaration)
      }
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
      Decl::Fn(function_declaration) => self.convert_function(
        &function_declaration.function,
        &TYPE_FUNCTION_DECLARATION,
        Some(&function_declaration.ident),
      ),
      Decl::Class(class_declaration) => self.convert_class_declaration(class_declaration),
      _ => {
        dbg!(declaration);
        todo!("Cannot convert Declaration");
      }
    }
  }

  fn convert_pattern(&mut self, pattern: &Pat) -> Span {
    match pattern {
      Pat::Array(array_pattern) => {
        self.convert_array_pattern(array_pattern);
        array_pattern.span
      }
      Pat::Assign(assignment_pattern) => {
        self.convert_assignment_pattern(assignment_pattern);
        assignment_pattern.span
      }
      Pat::Expr(expression) => self.convert_expression(expression),
      Pat::Ident(binding_identifier) => {
        self.convert_binding_identifier(binding_identifier);
        binding_identifier.span
      }
      Pat::Object(object) => {
        self.convert_object_pattern(object);
        object.span
      }
      Pat::Rest(rest_pattern) => {
        self.convert_rest_pattern(rest_pattern);
        rest_pattern.span
      }
      Pat::Invalid(_) => unimplemented!("Cannot convert invalid pattern"),
    }
  }

  fn convert_binding_identifier(&mut self, binding_identifier: &BindingIdent) {
    self.convert_identifier(&binding_identifier.id);
  }

  fn convert_export_specifier(&mut self, export_specifier: &ExportSpecifier) {
    match export_specifier {
      ExportSpecifier::Named(export_named_specifier) => {
        self.convert_export_named_specifier(export_named_specifier)
      }
      _ => {
        dbg!(export_specifier);
        todo!("Cannot convert ExportSpecifier");
      }
    }
  }

  fn convert_module_export_name(&mut self, module_export_name: &ModuleExportName) {
    match module_export_name {
      ModuleExportName::Ident(identifier) => self.convert_identifier(identifier),
      ModuleExportName::Str(string_literal) => self.convert_literal_string(string_literal),
    }
  }

  fn convert_import_specifier(&mut self, import_specifier: &ImportSpecifier) {
    match import_specifier {
      ImportSpecifier::Named(import_named_specifier) => {
        self.convert_import_named_specifier(import_named_specifier)
      }
      ImportSpecifier::Default(import_default_specifier) => {
        self.convert_import_default_specifier(import_default_specifier)
      }
      ImportSpecifier::Namespace(import_namespace_specifier) => {
        self.convert_import_namespace_specifier(import_namespace_specifier)
      }
    }
  }

  fn convert_object_pattern_property(&mut self, object_pattern_property: &ObjectPatProp) {
    match object_pattern_property {
      ObjectPatProp::Assign(assignment_pattern_property) => {
        self.convert_assignment_pattern_property(assignment_pattern_property)
      }
      ObjectPatProp::KeyValue(key_value_pattern_property) => {
        self.convert_key_value_pattern_property(key_value_pattern_property)
      }
      ObjectPatProp::Rest(rest_pattern) => self.convert_rest_pattern(rest_pattern),
    }
  }

  fn convert_class_member(&mut self, class_member: &ClassMember) {
    match class_member {
      ClassMember::ClassProp(class_property) => self.convert_class_property(class_property),
      ClassMember::Constructor(constructor) => self.convert_constructor(constructor),
      ClassMember::Method(method) => self.convert_method(method),
      ClassMember::PrivateMethod(private_method) => self.convert_private_method(private_method),
      ClassMember::PrivateProp(private_property) => self.convert_private_property(private_property),
      ClassMember::StaticBlock(static_block) => self.convert_static_block(static_block),
      _ => {
        dbg!(class_member);
        unimplemented!("Cannot convert ClassMember");
      }
    }
  }

  fn convert_property_or_spread(&mut self, property_or_spread: &PropOrSpread) {
    match property_or_spread {
      PropOrSpread::Prop(property) => self.convert_property(&**property),
      PropOrSpread::Spread(spread_element) => self.convert_spread_element(spread_element),
    }
  }

  fn convert_property(&mut self, property: &Prop) {
    match property {
      Prop::Getter(getter_property) => self.convert_getter_property(getter_property),
      Prop::KeyValue(key_value_property) => self.convert_key_value_property(key_value_property),
      Prop::Method(method_property) => self.convert_method_property(method_property),
      Prop::Setter(setter_property) => self.convert_setter_property(setter_property),
      Prop::Shorthand(identifier) => self.convert_shorthand_property(identifier),
      _ => {
        dbg!(property);
        todo!("Cannot convert Property")
      }
    }
  }

  // TODO Lukas replace all explicit position copying with returning a span
  fn convert_pattern_or_expression(&mut self, pattern_or_expression: &PatOrExpr) {
    match pattern_or_expression {
      PatOrExpr::Pat(pattern) => {
        self.convert_pattern(pattern);
      }
      PatOrExpr::Expr(expression) => {
        self.convert_expression(expression);
      }
    }
  }

  fn convert_parenthesized_expression(&mut self, parenthesized_expression: &ParenExpr) {
    self.convert_expression(&parenthesized_expression.expr);
  }

  fn convert_optional_chain_base(&mut self, optional_chain_base: &OptChainBase, is_optional: bool) {
    match optional_chain_base {
      OptChainBase::Member(member_expression) => {
        self.convert_member_expression(&member_expression, is_optional, true)
      }
      OptChainBase::Call(optional_call) => {
        self.convert_optional_call(optional_call, is_optional, true)
      }
    }
  }

  fn convert_call_expression(
    &mut self,
    call_expression: &CallExpr,
    is_optional: bool,
    is_chained: bool,
  ) {
    match &call_expression.callee {
      Callee::Import(_) => {
        self.store_import_expression(&call_expression.span, &call_expression.args)
      }
      Callee::Expr(callee_expression) => self.store_call_expression(
        &call_expression.span,
        is_optional,
        &StoredCallee::Expression(&callee_expression),
        &call_expression.args,
        is_chained,
      ),
      Callee::Super(callee_super) => self.store_call_expression(
        &call_expression.span,
        is_optional,
        &StoredCallee::Super(&callee_super),
        &call_expression.args,
        is_chained,
      ),
    }
  }

  fn convert_optional_call(
    &mut self,
    optional_call: &OptCall,
    is_optional: bool,
    is_chained: bool,
  ) {
    self.store_call_expression(
      &optional_call.span,
      is_optional,
      &StoredCallee::Expression(&optional_call.callee),
      &optional_call.args,
      is_chained,
    );
  }

  fn convert_export_declaration(&mut self, export_declaration: &ExportDecl) {
    self.store_export_named_declaration(
      &export_declaration.span,
      &vec![],
      None,
      Some(&export_declaration.decl),
      &None,
    );
  }

  fn convert_export_named_declaration(&mut self, export_named_declaration: &NamedExport) {
    match export_named_declaration.specifiers.first().unwrap() {
      ExportSpecifier::Namespace(export_namespace_specifier) => self.store_export_all_declaration(
        &export_named_declaration.span,
        export_named_declaration.src.as_ref().unwrap(),
        &export_named_declaration.asserts,
        Some(&export_namespace_specifier.name),
      ),
      ExportSpecifier::Named(_) => self.store_export_named_declaration(
        &export_named_declaration.span,
        &export_named_declaration.specifiers,
        export_named_declaration
          .src
          .as_ref()
          .map(|source| &**source),
        None,
        &export_named_declaration.asserts,
      ),
      ExportSpecifier::Default(_) => panic!("Unexpected default export specifier"),
    }
  }

  fn convert_for_head(&mut self, for_head: &ForHead) {
    match for_head {
      ForHead::VarDecl(variable_declaration) => {
        self.convert_variable_declaration(variable_declaration)
      }
      ForHead::Pat(pattern) => {
        self.convert_pattern(pattern);
      }
      _ => {
        dbg!(for_head);
        todo!("Cannot convert ForHead")
      }
    }
  }

  fn convert_variable_declaration_or_expression(
    &mut self,
    variable_declaration_or_expression: &VarDeclOrExpr,
  ) {
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

  fn convert_identifier(&mut self, identifier: &Ident) {
    self.store_identifier(
      identifier.span.lo.0 - 1,
      identifier.span.hi.0 - 1,
      &identifier.sym,
    );
  }

  // === nodes
  fn convert_module_program(&mut self, module: &Module) {
    self.add_type_and_explicit_positions(&TYPE_PROGRAM, 0u32, self.code.len() as u32);
    // body
    let mut keep_checking_directives = true;
    self.convert_item_list_with_state(
      &module.body,
      &mut keep_checking_directives,
      |ast_converter, module_item, state| {
        if *state {
          match &*module_item {
            ModuleItem::Stmt(Stmt::Expr(expression)) => {
              match &*expression.expr {
                Expr::Lit(Lit::Str(string)) => {
                  ast_converter.convert_expression_statement(expression, Some(&string.value));
                  return true;
                }
                _ => {}
              };
            }
            _ => {}
          };
        }
        *state = false;
        ast_converter.convert_module_item(module_item);
        true
      },
    );
  }

  fn convert_expression_statement(
    &mut self,
    expression_statement: &ExprStmt,
    directive: Option<&JsWord>,
  ) {
    self.add_type_and_positions(&TYPE_EXPRESSION_STATEMENT, &expression_statement.span);
    // reserve directive
    let reference_position = self.reserve_reference_positions(1);
    // expression
    self.convert_expression(&expression_statement.expr);
    // directive
    directive.map(|directive| {
      self.update_reference_position(reference_position);
      self.convert_string(directive);
    });
  }

  fn store_export_named_declaration(
    &mut self,
    span: &Span,
    specifiers: &Vec<ExportSpecifier>,
    src: Option<&Str>,
    declaration: Option<&Decl>,
    asserts: &Option<Box<ObjectLit>>,
  ) {
    self.add_type_and_positions(&TYPE_EXPORT_NAMED_DECLARATION, span);
    // reserve for declaration, src, attributes
    let reference_position = self.reserve_reference_positions(3);
    // specifiers
    self.convert_item_list(specifiers, |ast_converter, specifier| {
      ast_converter.convert_export_specifier(specifier);
      true
    });
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
    self
      .buffer
      .extend_from_slice(match variable_declaration.kind {
        VarDeclKind::Var => &DECLARATION_KIND_VAR,
        VarDeclKind::Let => &DECLARATION_KIND_LET,
        VarDeclKind::Const => &DECLARATION_KIND_CONST,
      });
    self.convert_item_list(
      &variable_declaration.decls,
      |ast_converter, variable_declarator| {
        ast_converter.convert_variable_declarator(variable_declarator);
        true
      },
    );
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

  fn store_identifier(&mut self, start: u32, end: u32, name: &str) {
    self.add_type_and_explicit_positions(&TYPE_IDENTIFIER, start, end);
    // name
    self.convert_string(name);
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
    self.convert_item_list(
      &import_declaration.specifiers,
      |ast_converter, import_specifier| {
        ast_converter.convert_import_specifier(import_specifier);
        true
      },
    );
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
        self.convert_item_list(&asserts.props, |ast_converter, prop| match prop {
          PropOrSpread::Prop(prop) => match &**prop {
            Prop::KeyValue(key_value_property) => {
              ast_converter.convert_import_attribute(key_value_property);
              true
            }
            _ => panic!("Non key-value property in import declaration attributes"),
          },
          PropOrSpread::Spread(_) => panic!("Spread in import declaration attributes"),
        });
      }
      None => self.buffer.resize(self.buffer.len() + 4, 0),
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
    self.convert_item_list(&arguments[1..], |ast_converter, argument| {
      ast_converter.convert_expression_or_spread(argument);
      true
    });
  }

  fn store_call_expression(
    &mut self,
    span: &Span,
    is_optional: bool,
    callee: &StoredCallee,
    arguments: &[ExprOrSpread],
    is_chained: bool,
  ) {
    self.add_type_and_positions(&TYPE_CALL_EXPRESSION, span);
    // optional
    self.convert_boolean(is_optional);
    // reserve for callee
    let reference_position = self.reserve_reference_positions(1);
    // arguments
    self.convert_item_list(arguments, |ast_converter, argument| {
      ast_converter.convert_expression_or_spread(argument);
      true
    });
    // callee
    self.update_reference_position(reference_position);
    match callee {
      StoredCallee::Expression(Expr::OptChain(optional_chain_expression)) => {
        self.convert_optional_chain_expression(optional_chain_expression, is_chained);
      }
      StoredCallee::Expression(Expr::Call(call_expression)) => {
        self.convert_call_expression(call_expression, false, is_chained);
      }
      StoredCallee::Expression(Expr::Member(member_expression)) => {
        self.convert_member_expression(member_expression, false, is_chained);
      }
      StoredCallee::Expression(callee_expression) => {
        self.convert_expression(callee_expression);
      }
      StoredCallee::Super(callee_super) => self.convert_super(callee_super),
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
        self.convert_block_statement(block_statement, true);
      }
      BlockStmtOrExpr::Expr(expression) => {
        // expression
        self.convert_boolean(true);
        // body
        self.convert_expression(expression);
      }
    }
    // params
    self.update_reference_position(reference_position);
    self.convert_item_list(&arrow_expression.params, |ast_converter, param| {
      ast_converter.convert_pattern(param);
      true
    });
  }

  fn convert_block_statement(&mut self, block_statement: &BlockStmt, check_directive: bool) {
    self.add_type_and_positions(&TYPE_BLOCK_STATEMENT, &block_statement.span);
    // body
    let mut keep_checking_directives = check_directive;
    self.convert_item_list_with_state(
      &block_statement.stmts,
      &mut keep_checking_directives,
      |ast_converter, statement, state| {
        if *state {
          match &*statement {
            Stmt::Expr(expression) => {
              match &*expression.expr {
                Expr::Lit(Lit::Str(string)) => {
                  ast_converter.convert_expression_statement(expression, Some(&string.value));
                  return true;
                }
                _ => {}
              };
            }
            _ => {}
          };
        }
        *state = false;
        ast_converter.convert_statement(statement);
        true
      },
    );
  }

  fn convert_expression_or_spread(&mut self, expression_or_spread: &ExprOrSpread) {
    match expression_or_spread.spread {
      Some(spread_span) => self.store_spread_element(&spread_span, &expression_or_spread.expr),
      None => {
        self.convert_expression(&expression_or_spread.expr);
      }
    }
  }

  fn convert_spread_element(&mut self, spread_element: &SpreadElement) {
    self.store_spread_element(&spread_element.dot3_token, &spread_element.expr);
  }

  fn store_spread_element(&mut self, dot_span: &Span, argument: &Expr) {
    self.add_type_and_positions(&TYPE_SPREAD_ELEMENT, dot_span);
    // we need to set the end position to that of the expression
    let argument_position = self.buffer.len();
    // argument
    self.convert_expression(argument);
    let expression_end: [u8; 4] = self.buffer[argument_position + 8..argument_position + 12]
      .try_into()
      .unwrap();
    self.buffer[argument_position - 4..argument_position].copy_from_slice(&expression_end);
  }

  fn store_member_expression(
    &mut self,
    span: &Span,
    is_optional: bool,
    object: &ExpressionOrSuper,
    property: MemberOrSuperProp,
    is_chained: bool,
  ) {
    self.add_type_and_positions(&TYPE_MEMBER_EXPRESSION, span);
    // optional
    self.convert_boolean(is_optional);
    // reserve object
    let reference_position = self.reserve_reference_positions(1);
    match property {
      MemberOrSuperProp::Identifier(ident) => {
        // computed
        self.convert_boolean(false);
        // property
        self.convert_identifier(&ident)
      }
      MemberOrSuperProp::Computed(computed) => {
        // computed
        self.convert_boolean(true);
        // property
        self.convert_expression(&computed.expr);
      }
      MemberOrSuperProp::PrivateName(private_name) => {
        // computed
        self.convert_boolean(false);
        // property
        self.convert_private_name(&private_name)
      }
    }
    // object
    self.update_reference_position(reference_position);
    match object {
      ExpressionOrSuper::Expression(Expr::OptChain(optional_chain_expression)) => {
        self.convert_optional_chain_expression(optional_chain_expression, is_chained);
      }
      ExpressionOrSuper::Expression(Expr::Call(call_expression)) => {
        self.convert_call_expression(call_expression, false, is_chained);
      }
      ExpressionOrSuper::Expression(Expr::Member(member_expression)) => {
        self.convert_member_expression(member_expression, false, is_chained);
      }
      ExpressionOrSuper::Expression(expression) => {
        self.convert_expression(expression);
      }
      ExpressionOrSuper::Super(super_token) => self.convert_super(&super_token),
    }
  }

  fn convert_member_expression(
    &mut self,
    member_expression: &MemberExpr,
    is_optional: bool,
    is_chained: bool,
  ) {
    self.store_member_expression(
      &member_expression.span,
      is_optional,
      &ExpressionOrSuper::Expression(&member_expression.obj),
      match &member_expression.prop {
        MemberProp::Ident(identifier) => MemberOrSuperProp::Identifier(identifier),
        MemberProp::PrivateName(private_name) => MemberOrSuperProp::PrivateName(private_name),
        MemberProp::Computed(computed) => MemberOrSuperProp::Computed(computed),
      },
      is_chained,
    );
  }

  fn convert_private_name(&mut self, private_name: &PrivateName) {
    self.add_type_and_positions(&TYPE_PRIVATE_IDENTIFIER, &private_name.span);
    // id
    self.convert_string(&private_name.id.sym);
  }

  fn convert_import_default_specifier(
    &mut self,
    import_default_specifier: &ImportDefaultSpecifier,
  ) {
    self.add_type_and_positions(
      &TYPE_IMPORT_DEFAULT_SPECIFIER,
      &import_default_specifier.span,
    );
    // local
    self.convert_identifier(&import_default_specifier.local);
  }

  fn convert_literal_boolean(&mut self, literal: &Bool) {
    self.add_type_and_positions(&TYPE_LITERAL_BOOLEAN, &literal.span);
    // value^
    self.convert_boolean(literal.value);
  }

  fn convert_export_default_expression(&mut self, export_default_expression: &ExportDefaultExpr) {
    self.store_export_default_declaration(
      &export_default_expression.span,
      StoredDefaultExportExpression::Expression(&export_default_expression.expr),
    );
  }

  fn convert_export_default_declaration(&mut self, export_default_declaration: &ExportDefaultDecl) {
    self.store_export_default_declaration(
      &export_default_declaration.span,
      match &export_default_declaration.decl {
        DefaultDecl::Class(class_expression) => {
          StoredDefaultExportExpression::Class(&class_expression)
        }
        DefaultDecl::Fn(function_expression) => {
          StoredDefaultExportExpression::Function(&function_expression)
        }
        DefaultDecl::TsInterfaceDecl(_) => {
          unimplemented!("Cannot convert ExportDefaultDeclaration with TsInterfaceDecl")
        }
      },
    );
  }

  fn store_export_default_declaration(
    &mut self,
    span: &Span,
    expression: StoredDefaultExportExpression,
  ) {
    self.add_type_and_positions(&TYPE_EXPORT_DEFAULT_DECLARATION, span);
    // expression
    match expression {
      StoredDefaultExportExpression::Expression(expression) => {
        self.convert_expression(&expression);
      }
      StoredDefaultExportExpression::Class(class_expression) => {
        self.convert_class_expression(&class_expression, &TYPE_CLASS_DECLARATION)
      }
      StoredDefaultExportExpression::Function(function_expression) => self.convert_function(
        &function_expression.function,
        &TYPE_FUNCTION_DECLARATION,
        function_expression.ident.as_ref(),
      ),
    }
  }

  fn convert_literal_null(&mut self, literal: &Null) {
    self.add_type_and_positions(&TYPE_LITERAL_NULL, &literal.span);
  }

  fn convert_import_namespace_specifier(
    &mut self,
    import_namespace_specifier: &ImportStarAsSpecifier,
  ) {
    self.add_type_and_positions(
      &TYPE_IMPORT_NAMESPACE_SPECIFIER,
      &import_namespace_specifier.span,
    );
    // local
    self.convert_identifier(&import_namespace_specifier.local);
  }

  fn store_export_all_declaration(
    &mut self,
    span: &Span,
    source: &Str,
    attributes: &Option<Box<ObjectLit>>,
    exported: Option<&ModuleExportName>,
  ) {
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
    self.add_type_and_positions(
      match binary_expression.op {
        BinaryOp::LogicalOr | BinaryOp::LogicalAnd | BinaryOp::NullishCoalescing => {
          &TYPE_LOGICAL_EXPRESSION
        }
        _ => &TYPE_BINARY_EXPRESSION,
      },
      &binary_expression.span,
    );
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
      BinaryOp::ZeroFillRShift => ">>>",
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
    self.convert_item_list(
      &array_pattern.elems,
      |ast_converter, element| match element {
        Some(element) => {
          ast_converter.convert_pattern(element);
          true
        }
        None => false,
      },
    );
  }

  fn convert_object_pattern(&mut self, object_pattern: &ObjectPat) {
    self.add_type_and_positions(&TYPE_OBJECT_PATTERN, &object_pattern.span);
    // properties
    self.convert_item_list(
      &object_pattern.props,
      |ast_converter, object_pattern_property| {
        ast_converter.convert_object_pattern_property(object_pattern_property);
        true
      },
    );
  }

  fn convert_array_literal(&mut self, array_literal: &ArrayLit) {
    self.add_type_and_positions(&TYPE_ARRAY_EXPRESSION, &array_literal.span);
    // elements
    self.convert_item_list(
      &array_literal.elems,
      |ast_converter, element| match element {
        Some(element) => {
          ast_converter.convert_expression_or_spread(element);
          true
        }
        None => false,
      },
    );
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

  fn convert_function(
    &mut self,
    function: &Function,
    node_type: &[u8; 4],
    identifier: Option<&Ident>,
  ) {
    self.store_function_node(
      node_type,
      function.span.lo.0 - 1,
      function.span.hi.0 - 1,
      function.is_async,
      function.is_generator,
      identifier,
      &function.params.iter().map(|param| &param.pat).collect(),
      function.body.as_ref().unwrap(),
    );
  }

  fn convert_class_expression(&mut self, class_expression: &ClassExpr, node_type: &[u8; 4]) {
    self.store_class_node(
      node_type,
      class_expression.ident.as_ref(),
      &class_expression.class,
    );
  }

  fn convert_class_declaration(&mut self, class_declaration: &ClassDecl) {
    self.store_class_node(
      &TYPE_CLASS_DECLARATION,
      Some(&class_declaration.ident),
      &class_declaration.class,
    );
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
      let body_start_search_bytes: [u8; 4] = self.buffer
        [super_class_position + 8..super_class_position + 12]
        .try_into()
        .unwrap();
      body_start_search = u32::from_ne_bytes(body_start_search_bytes);
    });
    // body
    self.update_reference_position(reference_position + 8);
    let class_body_start =
      find_first_occurrence_outside_comment(self.code, b'{', body_start_search);
    self.convert_class_body(&class.body, class_body_start, class.span.hi.0 - 1);
  }

  fn convert_class_body(&mut self, class_members: &Vec<ClassMember>, start: u32, end: u32) {
    self.add_type_and_explicit_positions(&TYPE_CLASS_BODY, start, end);
    // body
    self.convert_item_list(class_members, |ast_converter, class_member| {
      ast_converter.convert_class_member(class_member);
      true
    });
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

  fn convert_import_attribute(&mut self, key_value_property: &KeyValueProp) {
    // type
    self.buffer.extend_from_slice(&TYPE_IMPORT_ATTRIBUTE);
    // reserve start, end, key
    let reference_position = self.reserve_reference_positions(3);
    // value
    let value_span = self.convert_expression(&key_value_property.value);
    // key
    self.update_reference_position(reference_position + 8);
    let key_span = self.convert_property_name(&key_value_property.key);
    // start, end
    self.add_positions(reference_position, key_span.lo.0 - 1, value_span.hi.0 - 1);
  }

  fn convert_object_literal(&mut self, object_literal: &ObjectLit) {
    self.add_type_and_positions(&TYPE_OBJECT_EXPRESSION, &object_literal.span);
    // properties
    self.convert_item_list(
      &object_literal.props,
      |ast_converter, property_or_spread| {
        ast_converter.convert_property_or_spread(property_or_spread);
        true
      },
    );
  }

  fn convert_property_name(&mut self, property_name: &PropName) -> Span {
    match property_name {
      PropName::Computed(computed_property_name) => {
        self.convert_expression(computed_property_name.expr.as_ref())
      }
      PropName::Ident(ident) => {
        self.convert_identifier(ident);
        ident.span
      }
      PropName::Str(string) => {
        self.convert_literal_string(&string);
        string.span
      }
      PropName::Num(number) => {
        self.convert_literal_number(&number);
        number.span
      }
      PropName::BigInt(bigint) => {
        self.convert_literal_bigint(&bigint);
        bigint.span
      }
    }
  }

  // TODO Lukas property has many different formats that should be merged if possible
  fn store_key_value_property(&mut self, property_name: &PropName, value: PatternOrExpression) {
    // type
    self.buffer.extend_from_slice(&TYPE_PROPERTY);
    // reserve start, end
    let start_end_position = self.reserve_reference_positions(2);
    // kind
    self.buffer.extend_from_slice(&PROPERTY_KIND_INIT);
    // method
    self.convert_boolean(false);
    // computed
    self.convert_boolean(match property_name {
      PropName::Computed(_) => true,
      _ => false,
    });
    // shorthand
    self.convert_boolean(false);
    // reserve value
    let reference_position = self.reserve_reference_positions(1);
    // key
    let key_span = match property_name {
      PropName::Computed(computed_property_name) => computed_property_name.span,
      PropName::Ident(identifier) => identifier.span,
      PropName::Str(string) => string.span,
      PropName::Num(number) => number.span,
      PropName::BigInt(bigint) => bigint.span,
    };
    self.convert_property_name(property_name);
    // value
    self.update_reference_position(reference_position);
    let value_span = match value {
      PatternOrExpression::Pattern(pattern) => self.convert_pattern(pattern),
      PatternOrExpression::Expression(expression) => self.convert_expression(expression),
    };
    // start, end
    self.add_positions(start_end_position, key_span.lo.0 - 1, value_span.hi.0 - 1);
  }

  fn convert_key_value_property(&mut self, key_value_property: &KeyValueProp) {
    self.store_key_value_property(
      &key_value_property.key,
      PatternOrExpression::Expression(&key_value_property.value),
    );
  }

  fn convert_key_value_pattern_property(&mut self, key_value_pattern_property: &KeyValuePatProp) {
    self.store_key_value_property(
      &key_value_pattern_property.key,
      PatternOrExpression::Pattern(&key_value_pattern_property.value),
    );
  }

  // TODO Lukas merge with method
  fn store_getter_setter_property(
    &mut self,
    span: &Span,
    kind: &[u8; 4],
    key: &PropName,
    body: &Option<BlockStmt>,
    param: Option<&Pat>,
  ) {
    self.add_type_and_positions(&TYPE_PROPERTY, span);
    // kind
    self.buffer.extend_from_slice(kind);
    // method
    self.convert_boolean(false);
    // computed
    self.convert_boolean(match &key {
      PropName::Computed(_) => true,
      _ => false,
    });
    // shorthand
    self.convert_boolean(false);
    // reserve value
    let reference_position = self.reserve_reference_positions(1);
    // key
    let key_position = self.buffer.len();
    self.convert_property_name(key);
    let key_end = u32::from_ne_bytes(
      self.buffer[key_position + 8..key_position + 12]
        .try_into()
        .unwrap(),
    );
    // value
    let block_statement = body.as_ref().expect("Getter/setter property without body");
    self.update_reference_position(reference_position);
    let parameters = match param {
      Some(pattern) => vec![pattern],
      None => vec![],
    };
    self.store_function_node(
      &TYPE_FUNCTION_EXPRESSION,
      find_first_occurrence_outside_comment(self.code, b'(', key_end),
      block_statement.span.hi.0 - 1,
      false,
      false,
      None,
      &parameters,
      block_statement,
    );
  }

  fn convert_getter_property(&mut self, getter_property: &GetterProp) {
    self.store_getter_setter_property(
      &getter_property.span,
      &PROPERTY_KIND_GET,
      &getter_property.key,
      &getter_property.body,
      None,
    );
  }

  fn convert_setter_property(&mut self, setter_property: &SetterProp) {
    self.store_getter_setter_property(
      &setter_property.span,
      &PROPERTY_KIND_SET,
      &setter_property.key,
      &setter_property.body,
      Some(&*setter_property.param),
    );
  }

  fn convert_method_property(&mut self, method_property: &MethodProp) {
    self.add_type_and_positions(&TYPE_PROPERTY, &method_property.function.span);
    // kind
    self.buffer.extend_from_slice(&PROPERTY_KIND_INIT);
    // method
    self.convert_boolean(true);
    // computed
    self.convert_boolean(match &method_property.key {
      PropName::Computed(_) => true,
      _ => false,
    });
    // shorthand
    self.convert_boolean(false);
    // reserve value
    let reference_position = self.reserve_reference_positions(1);
    // key
    let key_position = self.buffer.len();
    self.convert_property_name(&method_property.key);
    let key_end = u32::from_ne_bytes(
      self.buffer[key_position + 8..key_position + 12]
        .try_into()
        .unwrap(),
    );
    let function_start = find_first_occurrence_outside_comment(self.code, b'(', key_end);
    // value
    self.update_reference_position(reference_position);
    let function = &method_property.function;
    self.store_function_node(
      &TYPE_FUNCTION_EXPRESSION,
      function_start,
      function.span.hi.0 - 1,
      function.is_async,
      function.is_generator,
      None,
      &function.params.iter().map(|param| &param.pat).collect(),
      function.body.as_ref().unwrap(),
    );
  }

  fn store_shorthand_property(
    &mut self,
    span: &Span,
    key: &Ident,
    assignment_value: &Option<Box<Expr>>,
  ) {
    self.add_type_and_positions(&TYPE_PROPERTY, span);
    // kind
    self.buffer.extend_from_slice(&PROPERTY_KIND_INIT);
    // method
    self.convert_boolean(false);
    // computed
    self.convert_boolean(false);
    // shorthand
    self.convert_boolean(true);
    // reserve value, which is null
    let reference_position = self.reserve_reference_positions(1);
    // key
    self.convert_identifier(key);
    // value
    assignment_value.as_ref().map(|value| {
      self.update_reference_position(reference_position);
      self.store_assignment_pattern(span, PatternOrIdentifier::Identifier(key), value)
    });
  }

  fn convert_shorthand_property(&mut self, identifier: &Ident) {
    self.store_shorthand_property(&identifier.span, identifier, &None);
  }

  fn convert_assignment_pattern_property(&mut self, assignment_pattern_property: &AssignPatProp) {
    self.store_shorthand_property(
      &assignment_pattern_property.span,
      &assignment_pattern_property.key,
      &assignment_pattern_property.value,
    );
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
      AssignOp::NullishAssign => "??=",
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
        self.convert_item_list(
          &expressions_or_spread,
          |ast_converter, expression_or_spread| {
            ast_converter.convert_expression_or_spread(expression_or_spread);
            true
          },
        );
      }
      None => {}
    }
  }

  fn store_function_node(
    &mut self,
    node_type: &[u8; 4],
    start: u32,
    end: u32,
    is_async: bool,
    is_generator: bool,
    identifier: Option<&Ident>,
    parameters: &Vec<&Pat>,
    body: &BlockStmt,
  ) {
    self.add_type_and_explicit_positions(node_type, start, end);
    // async
    self.convert_boolean(is_async);
    // generator
    self.convert_boolean(is_generator);
    // reserve id, params
    let reference_position = self.reserve_reference_positions(2);
    // body
    self.convert_block_statement(body, true);
    // id
    identifier.map(|ident| {
      self.update_reference_position(reference_position);
      self.convert_identifier(ident);
    });
    // params
    self.update_reference_position(reference_position + 4);
    self.convert_item_list(parameters, |ast_converter, param| {
      ast_converter.convert_pattern(&param);
      true
    });
  }

  fn convert_throw_statement(&mut self, throw_statement: &ThrowStmt) {
    self.add_type_and_positions(&TYPE_THROW_STATEMENT, &throw_statement.span);
    // argument
    self.convert_expression(&throw_statement.arg);
  }

  fn convert_assignment_pattern(&mut self, assignment_pattern: &AssignPat) {
    self.store_assignment_pattern(
      &assignment_pattern.span,
      PatternOrIdentifier::Pattern(&assignment_pattern.left),
      &assignment_pattern.right,
    );
  }

  fn store_assignment_pattern(&mut self, span: &Span, left: PatternOrIdentifier, right: &Expr) {
    self.add_type_and_positions(&TYPE_ASSIGNMENT_PATTERN, span);
    // reserve left
    let reference_position = self.reserve_reference_positions(1);
    // right
    self.convert_expression(right);
    // left
    self.update_reference_position(reference_position);
    match left {
      PatternOrIdentifier::Pattern(pattern) => {
        self.convert_pattern(&pattern);
      }
      PatternOrIdentifier::Identifier(identifier) => self.convert_identifier(&identifier),
    }
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
    self.convert_block_statement(&try_statement.block, false);
    // handler
    try_statement.handler.as_ref().map(|catch_clause| {
      self.update_reference_position(reference_position);
      self.convert_catch_clause(catch_clause);
    });
    // finalizer
    try_statement.finalizer.as_ref().map(|block_statement| {
      self.update_reference_position(reference_position + 4);
      self.convert_block_statement(block_statement, false);
    });
  }

  fn convert_catch_clause(&mut self, catch_clause: &CatchClause) {
    self.add_type_and_positions(&TYPE_CATCH_CLAUSE, &catch_clause.span);
    // reserve param
    let reference_position = self.reserve_reference_positions(1);
    // body
    self.convert_block_statement(&catch_clause.body, false);
    // param
    catch_clause.param.as_ref().map(|pattern| {
      self.update_reference_position(reference_position);
      self.convert_pattern(pattern);
    });
  }

  fn convert_optional_chain_expression(
    &mut self,
    optional_chain_expression: &OptChainExpr,
    is_chained: bool,
  ) {
    if is_chained {
      self.convert_optional_chain_base(
        &optional_chain_expression.base,
        optional_chain_expression.optional,
      );
    } else {
      self.add_type_and_positions(&TYPE_CHAIN_EXPRESSION, &optional_chain_expression.span);
      // expression
      self.convert_optional_chain_base(
        &optional_chain_expression.base,
        optional_chain_expression.optional,
      );
    }
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

  fn convert_meta_property(&mut self, meta_property_expression: &MetaPropExpr) {
    self.add_type_and_positions(&TYPE_META_PROPERTY, &meta_property_expression.span);
    // reserve meta
    let reference_position = self.reserve_reference_positions(1);
    match meta_property_expression.kind {
      MetaPropKind::ImportMeta => {
        // property
        self.store_identifier(
          meta_property_expression.span.hi.0 - 5,
          meta_property_expression.span.hi.0 - 1,
          "meta",
        );
        // meta
        self.update_reference_position(reference_position);
        self.store_identifier(
          meta_property_expression.span.lo.0 - 1,
          meta_property_expression.span.lo.0 + 5,
          "import",
        );
      }
      MetaPropKind::NewTarget => {
        // property
        self.store_identifier(
          meta_property_expression.span.hi.0 - 7,
          meta_property_expression.span.hi.0 - 1,
          "target",
        );
        // meta
        self.update_reference_position(reference_position);
        self.store_identifier(
          meta_property_expression.span.lo.0 - 1,
          meta_property_expression.span.lo.0 + 2,
          "new",
        );
      }
    }
  }

  fn convert_constructor(&mut self, constructor: &Constructor) {
    self.add_type_and_positions(&TYPE_METHOD_DEFINITION, &constructor.span);
    // kind
    self
      .buffer
      .extend_from_slice(&METHOD_DEFINITION_KIND_CONSTRUCTOR);
    // computed
    self.convert_boolean(false);
    // static
    self.convert_boolean(false);
    // reserve value
    let reference_position = self.reserve_reference_positions(1);
    // key
    let key_position = self.buffer.len();
    self.convert_property_name(&constructor.key);
    // value
    match &constructor.body {
      Some(block_statement) => {
        self.update_reference_position(reference_position);
        let key_end_bytes: [u8; 4] = self.buffer[key_position + 8..key_position + 12]
          .try_into()
          .unwrap();
        let function_start =
          find_first_occurrence_outside_comment(self.code, b'(', u32::from_ne_bytes(key_end_bytes));
        self.store_function_node(
          &TYPE_FUNCTION_EXPRESSION,
          function_start,
          block_statement.span.hi.0 - 1,
          false,
          false,
          None,
          &constructor
            .params
            .iter()
            .map(|param| match param {
              ParamOrTsParamProp::Param(param) => &param.pat,
              ParamOrTsParamProp::TsParamProp(_) => panic!("TsParamProp in constructor"),
            })
            .collect(),
          block_statement,
        );
      }
      None => {
        panic!("Getter property without body");
      }
    }
  }

  fn convert_method(&mut self, method: &ClassMethod) {
    self.store_method_definition(
      &method.span,
      &method.kind,
      method.is_static,
      PropOrPrivateName::PropName(&method.key),
      match method.key {
        PropName::Computed(_) => true,
        _ => false,
      },
      &method.function,
    );
  }

  fn convert_private_method(&mut self, private_method: &PrivateMethod) {
    self.store_method_definition(
      &private_method.span,
      &private_method.kind,
      private_method.is_static,
      PropOrPrivateName::PrivateName(&private_method.key),
      false,
      &private_method.function,
    );
  }

  fn store_method_definition(
    &mut self,
    span: &Span,
    kind: &MethodKind,
    is_static: bool,
    key: PropOrPrivateName,
    is_computed: bool,
    function: &Function,
  ) {
    self.add_type_and_positions(&TYPE_METHOD_DEFINITION, span);
    // kind
    self.buffer.extend_from_slice(match kind {
      MethodKind::Method => &METHOD_DEFINITION_KIND_METHOD,
      MethodKind::Getter => &METHOD_DEFINITION_KIND_GET,
      MethodKind::Setter => &METHOD_DEFINITION_KIND_SET,
    });
    // computed
    self.convert_boolean(is_computed);
    // static
    self.convert_boolean(is_static);
    // reserve value
    let reference_position = self.reserve_reference_positions(1);
    // key
    let key_position = self.buffer.len();
    match key {
      PropOrPrivateName::PropName(prop_name) => {
        self.convert_property_name(&prop_name);
      }
      PropOrPrivateName::PrivateName(private_name) => self.convert_private_name(&private_name),
    }
    let key_end_bytes: [u8; 4] = self.buffer[key_position + 8..key_position + 12]
      .try_into()
      .unwrap();
    let function_start =
      find_first_occurrence_outside_comment(self.code, b'(', u32::from_ne_bytes(key_end_bytes));
    // value
    self.update_reference_position(reference_position);
    self.store_function_node(
      &TYPE_FUNCTION_EXPRESSION,
      function_start,
      function.span.hi.0 - 1,
      function.is_async,
      function.is_generator,
      None,
      &function.params.iter().map(|param| &param.pat).collect(),
      function.body.as_ref().unwrap(),
    );
  }

  fn store_property_definition(
    &mut self,
    span: &Span,
    is_computed: bool,
    is_static: bool,
    key: PropOrPrivateName,
    value: &Option<&Expr>,
  ) {
    self.add_type_and_positions(&TYPE_PROPERTY_DEFINITION, span);
    // computed
    self.convert_boolean(is_computed);
    // static
    self.convert_boolean(is_static);
    // reserve value
    let reference_position = self.reserve_reference_positions(1);
    // key
    match key {
      PropOrPrivateName::PropName(prop_name) => {
        self.convert_property_name(&prop_name);
      }
      PropOrPrivateName::PrivateName(private_name) => self.convert_private_name(&private_name),
    }
    // value
    value.map(|expression| {
      self.update_reference_position(reference_position);
      self.convert_expression(expression);
    });
  }

  fn convert_class_property(&mut self, class_property: &ClassProp) {
    self.store_property_definition(
      &class_property.span,
      match &class_property.key {
        PropName::Computed(_) => true,
        _ => false,
      },
      class_property.is_static,
      PropOrPrivateName::PropName(&class_property.key),
      &class_property
        .value
        .as_ref()
        .map(|expression| &**expression),
    );
  }

  fn convert_private_property(&mut self, private_property: &PrivateProp) {
    self.store_property_definition(
      &private_property.span,
      false,
      private_property.is_static,
      PropOrPrivateName::PrivateName(&private_property.key),
      &private_property
        .value
        .as_ref()
        .map(|expression| &**expression),
    );
  }

  fn convert_this_expression(&mut self, this_expression: &ThisExpr) {
    self.add_type_and_positions(&TYPE_THIS_EXPRESSION, &this_expression.span);
  }

  fn convert_static_block(&mut self, static_block: &StaticBlock) {
    self.add_type_and_positions(&TYPE_STATIC_BLOCK, &static_block.span);
    // body
    self.convert_item_list(&static_block.body.stmts, |ast_converter, statement| {
      ast_converter.convert_statement(statement);
      true
    });
  }

  fn convert_super_property(&mut self, super_property: &SuperPropExpr) {
    self.store_member_expression(
      &super_property.span,
      false,
      &ExpressionOrSuper::Super(&super_property.obj),
      match &super_property.prop {
        SuperProp::Ident(identifier) => MemberOrSuperProp::Identifier(&identifier),
        SuperProp::Computed(computed_property_name) => {
          MemberOrSuperProp::Computed(&computed_property_name)
        }
      },
      false,
    );
  }

  fn convert_super(&mut self, super_token: &Super) {
    self.add_type_and_positions(&TYPE_SUPER, &super_token.span);
  }

  fn convert_rest_pattern(&mut self, rest_pattern: &RestPat) {
    self.add_type_and_explicit_positions(
      &TYPE_REST_ELEMENT,
      rest_pattern.dot3_token.lo.0 - 1,
      rest_pattern.span.hi.0 - 1,
    );
    // argument
    self.convert_pattern(&rest_pattern.arg);
  }

  fn convert_sequence_expression(&mut self, sequence_expression: &SeqExpr) {
    self.add_type_and_positions(&TYPE_SEQUENCE_EXPRESSION, &sequence_expression.span);
    // expressions
    self.convert_item_list(&sequence_expression.exprs, |ast_converter, expression| {
      ast_converter.convert_expression(expression);
      true
    });
  }

  fn convert_switch_statement(&mut self, switch_statement: &SwitchStmt) {
    self.add_type_and_positions(&TYPE_SWITCH_STATEMENT, &switch_statement.span);
    // reserve discriminant
    let reference_position = self.reserve_reference_positions(1);
    // cases
    self.convert_item_list(&switch_statement.cases, |ast_converter, switch_case| {
      ast_converter.convert_switch_case(switch_case);
      true
    });
    // discriminant
    self.update_reference_position(reference_position);
    self.convert_expression(&switch_statement.discriminant);
  }

  fn convert_switch_case(&mut self, switch_case: &SwitchCase) {
    self.add_type_and_positions(&TYPE_SWITCH_CASE, &switch_case.span);
    // reserve test
    let reference_position = self.reserve_reference_positions(1);
    // consequent
    self.convert_item_list(&switch_case.cons, |ast_converter, statement| {
      ast_converter.convert_statement(statement);
      true
    });
    // test
    switch_case.test.as_ref().map(|expression| {
      self.update_reference_position(reference_position);
      self.convert_expression(expression)
    });
  }

  fn convert_tagged_template_expression(&mut self, tagged_template: &TaggedTpl) {
    self.add_type_and_positions(&TYPE_TAGGED_TEMPLATE_EXPRESSION, &tagged_template.span);
    // reserve tag
    let reference_position = self.reserve_reference_positions(1);
    // quasi
    self.convert_template_literal(&tagged_template.tpl);
    // tag
    self.update_reference_position(reference_position);
    self.convert_expression(&tagged_template.tag);
  }

  fn convert_template_literal(&mut self, template_literal: &Tpl) {
    self.add_type_and_positions(&TYPE_TEMPLATE_LITERAL, &template_literal.span);
    // reserve expressions
    let reference_position = self.reserve_reference_positions(1);
    // quasis
    self.convert_item_list(
      &template_literal.quasis,
      |ast_converter, template_element| {
        ast_converter.convert_template_element(template_element);
        true
      },
    );
    // expressions
    self.update_reference_position(reference_position);
    self.convert_item_list(&template_literal.exprs, |ast_converter, expression| {
      ast_converter.convert_expression(expression);
      true
    });
  }

  fn convert_template_element(&mut self, template_element: &TplElement) {
    self.add_type_and_positions(&TYPE_TEMPLATE_ELEMENT, &template_element.span);
    // tail
    self.convert_boolean(template_element.tail);
    // reserve cooked
    let reference_position = self.reserve_reference_positions(1);
    // raw
    self.convert_string(&template_element.raw);
    // cooked
    template_element.cooked.as_ref().map(|cooked| {
      self.update_reference_position(reference_position);
      self.convert_string(cooked)
    });
  }

  fn convert_unary_expression(&mut self, unary_expression: &UnaryExpr) {
    self.add_type_and_positions(&TYPE_UNARY_EXPRESSION, &unary_expression.span);
    // reserve operator
    let reference_position = self.reserve_reference_positions(1);
    // argument
    self.convert_expression(&unary_expression.arg);
    // operator
    self.update_reference_position(reference_position);
    self.convert_string(match unary_expression.op {
      UnaryOp::Minus => "-",
      UnaryOp::Plus => "+",
      UnaryOp::Bang => "!",
      UnaryOp::Tilde => "~",
      UnaryOp::TypeOf => "typeof",
      UnaryOp::Void => "void",
      UnaryOp::Delete => "delete",
    });
  }

  fn convert_update_expression(&mut self, update_expression: &UpdateExpr) {
    self.add_type_and_positions(&TYPE_UPDATE_EXPRESSION, &update_expression.span);
    // prefix
    self.convert_boolean(update_expression.prefix);
    // reserve operator
    let reference_position = self.reserve_reference_positions(1);
    // argument
    self.convert_expression(&update_expression.arg);
    // operator
    self.update_reference_position(reference_position);
    self.convert_string(match update_expression.op {
      UpdateOp::PlusPlus => "++",
      UpdateOp::MinusMinus => "--",
    });
  }

  fn convert_yield_expression(&mut self, yield_expression: &YieldExpr) {
    self.add_type_and_positions(&TYPE_YIELD_EXPRESSION, &yield_expression.span);
    // delegate
    self.convert_boolean(yield_expression.delegate);
    // reserve argument
    let reference_position = self.reserve_reference_positions(1);
    // argument
    yield_expression.arg.as_ref().map(|expression| {
      self.update_reference_position(reference_position);
      self.convert_expression(expression)
    });
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
const TYPE_META_PROPERTY: [u8; 4] = 47u32.to_ne_bytes();
const TYPE_METHOD_DEFINITION: [u8; 4] = 48u32.to_ne_bytes();
const TYPE_NEW_EXPRESSION: [u8; 4] = 49u32.to_ne_bytes();
const TYPE_OBJECT_EXPRESSION: [u8; 4] = 50u32.to_ne_bytes();
const TYPE_OBJECT_PATTERN: [u8; 4] = 51u32.to_ne_bytes();
const TYPE_PRIVATE_IDENTIFIER: [u8; 4] = 52u32.to_ne_bytes();
const TYPE_PROGRAM: [u8; 4] = 53u32.to_ne_bytes();
const TYPE_PROPERTY: [u8; 4] = 54u32.to_ne_bytes();
const TYPE_PROPERTY_DEFINITION: [u8; 4] = 55u32.to_ne_bytes();
const TYPE_REST_ELEMENT: [u8; 4] = 56u32.to_ne_bytes();
const TYPE_RETURN_STATEMENT: [u8; 4] = 57u32.to_ne_bytes();
const TYPE_SEQUENCE_EXPRESSION: [u8; 4] = 58u32.to_ne_bytes();
const TYPE_SPREAD_ELEMENT: [u8; 4] = 59u32.to_ne_bytes();
const TYPE_STATIC_BLOCK: [u8; 4] = 60u32.to_ne_bytes();
const TYPE_SUPER: [u8; 4] = 61u32.to_ne_bytes();
const TYPE_SWITCH_CASE: [u8; 4] = 62u32.to_ne_bytes();
const TYPE_SWITCH_STATEMENT: [u8; 4] = 63u32.to_ne_bytes();
const TYPE_TAGGED_TEMPLATE_EXPRESSION: [u8; 4] = 64u32.to_ne_bytes();
const TYPE_TEMPLATE_ELEMENT: [u8; 4] = 65u32.to_ne_bytes();
const TYPE_TEMPLATE_LITERAL: [u8; 4] = 66u32.to_ne_bytes();
const TYPE_THIS_EXPRESSION: [u8; 4] = 67u32.to_ne_bytes();
const TYPE_THROW_STATEMENT: [u8; 4] = 68u32.to_ne_bytes();
const TYPE_TRY_STATEMENT: [u8; 4] = 69u32.to_ne_bytes();
const TYPE_UNARY_EXPRESSION: [u8; 4] = 70u32.to_ne_bytes();
const TYPE_UPDATE_EXPRESSION: [u8; 4] = 71u32.to_ne_bytes();
const TYPE_VARIABLE_DECLARATION: [u8; 4] = 72u32.to_ne_bytes();
const TYPE_VARIABLE_DECLARATOR: [u8; 4] = 73u32.to_ne_bytes();
const TYPE_WHILE_STATEMENT: [u8; 4] = 74u32.to_ne_bytes();
const TYPE_YIELD_EXPRESSION: [u8; 4] = 75u32.to_ne_bytes();

// other constants
// TODO Lukas replace various explicit string constants with type numbers
const DECLARATION_KIND_VAR: [u8; 4] = 0u32.to_ne_bytes();
const DECLARATION_KIND_LET: [u8; 4] = 1u32.to_ne_bytes();
const DECLARATION_KIND_CONST: [u8; 4] = 2u32.to_ne_bytes();

const PROPERTY_KIND_INIT: [u8; 4] = 0u32.to_ne_bytes();
const PROPERTY_KIND_GET: [u8; 4] = 1u32.to_ne_bytes();
const PROPERTY_KIND_SET: [u8; 4] = 2u32.to_ne_bytes();

const METHOD_DEFINITION_KIND_CONSTRUCTOR: [u8; 4] = 0u32.to_ne_bytes();
const METHOD_DEFINITION_KIND_METHOD: [u8; 4] = 1u32.to_ne_bytes();
const METHOD_DEFINITION_KIND_GET: [u8; 4] = 2u32.to_ne_bytes();
const METHOD_DEFINITION_KIND_SET: [u8; 4] = 3u32.to_ne_bytes();

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

enum PropOrPrivateName<'a> {
  PropName(&'a PropName),
  PrivateName(&'a PrivateName),
}

enum ExpressionOrSuper<'a> {
  Expression(&'a Expr),
  Super(&'a Super),
}

enum MemberOrSuperProp<'a> {
  Identifier(&'a Ident),
  PrivateName(&'a PrivateName),
  Computed(&'a ComputedPropName),
}

enum PatternOrIdentifier<'a> {
  Pattern(&'a Pat),
  Identifier(&'a Ident),
}

enum PatternOrExpression<'a> {
  Pattern(&'a Pat),
  Expression(&'a Expr),
}
