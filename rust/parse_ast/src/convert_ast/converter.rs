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
  MemberExpr, MemberProp, MetaPropExpr, MetaPropKind, MethodKind, MethodProp, ModuleDecl,
  ModuleExportName, ModuleItem, NamedExport, NewExpr, Null, Number, ObjectLit, ObjectPat,
  ObjectPatProp, OptCall, OptChainBase, OptChainExpr, ParamOrTsParamProp, ParenExpr, Pat,
  PatOrExpr, PrivateMethod, PrivateName, PrivateProp, Program, Prop, PropName, PropOrSpread, Regex,
  RestPat, ReturnStmt, SeqExpr, SetterProp, SpreadElement, StaticBlock, Stmt, Str, Super,
  SuperProp, SuperPropExpr, SwitchCase, SwitchStmt, TaggedTpl, ThisExpr, ThrowStmt, Tpl,
  TplElement, TryStmt, UnaryExpr, UnaryOp, UpdateExpr, UpdateOp, VarDecl, VarDeclKind,
  VarDeclOrExpr, VarDeclarator, WhileStmt, YieldExpr,
};

use crate::convert_ast::annotations::{AnnotationKind, AnnotationWithType};
use crate::convert_ast::converter::analyze_code::find_first_occurrence_outside_comment;
use crate::convert_ast::converter::node_types::*;
use crate::convert_ast::converter::string_constants::*;
use crate::convert_ast::converter::utf16_positions::{
  ConvertedAnnotation, Utf8ToUtf16ByteIndexConverterAndAnnotationHandler,
};

mod analyze_code;
mod string_constants;
mod utf16_positions;

pub mod node_types;

pub struct AstConverter<'a> {
  buffer: Vec<u8>,
  code: &'a [u8],
  index_converter: Utf8ToUtf16ByteIndexConverterAndAnnotationHandler<'a>,
}

impl<'a> AstConverter<'a> {
  pub fn new(code: &'a str, annotations: &'a Vec<AnnotationWithType>) -> Self {
    Self {
      // This is just a wild guess and should be revisited from time to time
      buffer: Vec::with_capacity(20 * code.len()),
      code: code.as_bytes(),
      index_converter: Utf8ToUtf16ByteIndexConverterAndAnnotationHandler::new(code, annotations),
    }
  }

  pub fn convert_ast_to_buffer(mut self, node: &Program) -> Vec<u8> {
    self.convert_program(node);
    self.buffer.shrink_to_fit();
    self.buffer
  }

  // === helpers
  fn add_type_and_positions(&mut self, node_type: &[u8; 4], span: &Span) {
    // type
    self.buffer.extend_from_slice(node_type);
    // start
    self
      .buffer
      .extend_from_slice(&(self.index_converter.convert(span.lo.0 - 1, false)).to_ne_bytes());
    // end
    self
      .buffer
      .extend_from_slice(&(self.index_converter.convert(span.hi.0 - 1, false)).to_ne_bytes());
  }

  fn add_type_and_explicit_start(&mut self, node_type: &[u8; 4], start: u32) -> usize {
    // type
    self.buffer.extend_from_slice(node_type);
    // start
    self
      .buffer
      .extend_from_slice(&(self.index_converter.convert(start, false)).to_ne_bytes());
    // end
    let end_position = self.buffer.len();
    self.buffer.resize(end_position + 4, 0);
    end_position
  }

  fn add_explicit_end(&mut self, end_position: usize, end: u32) {
    self.buffer[end_position..end_position + 4]
      .copy_from_slice(&(self.index_converter.convert(end, false)).to_ne_bytes());
  }

  fn add_type_and_start(&mut self, node_type: &[u8; 4], span: &Span) -> usize {
    self.add_type_and_start_and_handle_annotations(node_type, span, false)
  }

  fn add_type_and_start_and_handle_annotations(
    &mut self,
    node_type: &[u8; 4],
    span: &Span,
    keep_annotations: bool,
  ) -> usize {
    // type
    self.buffer.extend_from_slice(node_type);
    // start
    let start = self
      .index_converter
      .convert(span.lo.0 - 1, keep_annotations);
    self.buffer.extend_from_slice(&start.to_ne_bytes());
    // end
    let end_position = self.buffer.len();
    self.buffer.resize(end_position + 4, 0);
    end_position
  }

  fn add_end(&mut self, end_position: usize, span: &Span) {
    self.buffer[end_position..end_position + 4]
      .copy_from_slice(&(self.index_converter.convert(span.hi.0 - 1, false)).to_ne_bytes());
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

  fn convert_item_list_with_state<T, S, F>(
    &mut self,
    item_list: &[T],
    state: &mut S,
    convert_item: F,
  ) where
    F: Fn(&mut AstConverter, &T, &mut S) -> bool,
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

  // TODO SWC deduplicate strings and see if we can easily compare atoms
  fn convert_string(&mut self, string: &str) {
    convert_string(&mut self.buffer, string);
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
      Program::Module(module) => {
        self.store_program(ModuleItemsOrStatements::ModuleItems(&module.body));
      }
      Program::Script(script) => {
        self.store_program(ModuleItemsOrStatements::Statements(&script.body));
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
      Stmt::With(_) => unimplemented!("Cannot convert Stmt::With"),
    }
  }

  fn convert_expression(&mut self, expression: &Expr) -> Option<(u32, u32)> {
    match expression {
      Expr::Array(array_literal) => {
        self.convert_array_literal(array_literal);
        None
      }
      Expr::Arrow(arrow_expression) => {
        self.convert_arrow_expression(arrow_expression);
        None
      }
      Expr::Assign(assignment_expression) => {
        self.convert_assignment_expression(assignment_expression);
        None
      }
      Expr::Await(await_expression) => {
        self.convert_await_expression(await_expression);
        None
      }
      Expr::Bin(binary_expression) => {
        self.convert_binary_expression(binary_expression);
        None
      }
      Expr::Call(call_expression) => {
        self.convert_call_expression(call_expression, false, false);
        None
      }
      Expr::Class(class_expression) => {
        self.convert_class_expression(class_expression, &TYPE_CLASS_EXPRESSION);
        None
      }
      Expr::Cond(conditional_expression) => {
        self.convert_conditional_expression(conditional_expression);
        None
      }
      Expr::Fn(function_expression) => {
        self.convert_function(
          &function_expression.function,
          &TYPE_FUNCTION_EXPRESSION,
          function_expression.ident.as_ref(),
        );
        None
      }
      Expr::Ident(identifier) => {
        self.convert_identifier(identifier);
        None
      }
      Expr::Lit(literal) => {
        self.convert_literal(literal);
        None
      }
      Expr::Member(member_expression) => {
        self.convert_member_expression(member_expression, false, false);
        None
      }
      Expr::MetaProp(meta_property) => {
        self.convert_meta_property(meta_property);
        None
      }
      Expr::New(new_expression) => {
        self.convert_new_expression(new_expression);
        None
      }
      Expr::Object(object_literal) => {
        self.convert_object_literal(object_literal);
        None
      }
      Expr::OptChain(optional_chain_expression) => {
        self.convert_optional_chain_expression(optional_chain_expression, false);
        None
      }
      Expr::Paren(parenthesized_expression) => {
        Some(self.convert_parenthesized_expression(parenthesized_expression))
      }
      Expr::PrivateName(private_name) => {
        self.convert_private_name(&private_name);
        None
      }
      Expr::Seq(sequence_expression) => {
        self.convert_sequence_expression(sequence_expression);
        None
      }
      Expr::SuperProp(super_property) => {
        self.convert_super_property(super_property);
        None
      }
      Expr::TaggedTpl(tagged_template_expression) => {
        self.convert_tagged_template_expression(tagged_template_expression);
        None
      }
      Expr::This(this_expression) => {
        self.convert_this_expression(this_expression);
        None
      }
      Expr::Tpl(template_literal) => {
        self.convert_template_literal(template_literal);
        None
      }
      Expr::Unary(unary_expression) => {
        self.convert_unary_expression(unary_expression);
        None
      }
      Expr::Update(update_expression) => {
        self.convert_update_expression(update_expression);
        None
      }
      Expr::Yield(yield_expression) => {
        self.convert_yield_expression(yield_expression);
        None
      }
      Expr::JSXMember(_) => unimplemented!("Cannot convert Expr::JSXMember"),
      Expr::JSXNamespacedName(_) => unimplemented!("Cannot convert Expr::JSXNamespacedName"),
      Expr::JSXEmpty(_) => unimplemented!("Cannot convert Expr::JSXEmpty"),
      Expr::JSXElement(_) => unimplemented!("Cannot convert Expr::JSXElement"),
      Expr::JSXFragment(_) => unimplemented!("Cannot convert Expr::JSXFragment"),
      Expr::TsTypeAssertion(_) => unimplemented!("Cannot convert Expr::TsTypeAssertion"),
      Expr::TsConstAssertion(_) => unimplemented!("Cannot convert Expr::TsConstAssertion"),
      Expr::TsNonNull(_) => unimplemented!("Cannot convert Expr::TsNonNull"),
      Expr::TsAs(_) => unimplemented!("Cannot convert Expr::TsAs"),
      Expr::TsInstantiation(_) => unimplemented!("Cannot convert Expr::TsInstantiation"),
      Expr::TsSatisfies(_) => unimplemented!("Cannot convert Expr::TsSatisfies"),
      Expr::Invalid(_) => unimplemented!("Cannot convert Expr::Invalid"),
    }
  }

  fn get_expression_span(&mut self, expression: &Expr) -> Span {
    match expression {
      Expr::Array(array_literal) => array_literal.span,
      Expr::Arrow(arrow_expression) => arrow_expression.span,
      Expr::Assign(assignment_expression) => assignment_expression.span,
      Expr::Await(await_expression) => await_expression.span,
      Expr::Bin(binary_expression) => binary_expression.span,
      Expr::Call(call_expression) => call_expression.span,
      Expr::Class(class_expression) => class_expression.class.span,
      Expr::Cond(conditional_expression) => conditional_expression.span,
      Expr::Fn(function_expression) => function_expression.function.span,
      Expr::Ident(identifier) => identifier.span,
      Expr::Lit(Lit::Str(literal)) => literal.span,
      Expr::Lit(Lit::Bool(literal)) => literal.span,
      Expr::Lit(Lit::Null(literal)) => literal.span,
      Expr::Lit(Lit::Num(literal)) => literal.span,
      Expr::Lit(Lit::BigInt(literal)) => literal.span,
      Expr::Lit(Lit::Regex(literal)) => literal.span,
      Expr::Member(member_expression) => member_expression.span,
      Expr::MetaProp(meta_property) => meta_property.span,
      Expr::New(new_expression) => new_expression.span,
      Expr::Object(object_literal) => object_literal.span,
      Expr::OptChain(optional_chain_expression) => optional_chain_expression.span,
      Expr::Paren(parenthesized_expression) => parenthesized_expression.span,
      Expr::PrivateName(private_name) => private_name.span,
      Expr::Seq(sequence_expression) => sequence_expression.span,
      Expr::SuperProp(super_property) => super_property.span,
      Expr::TaggedTpl(tagged_template_expression) => tagged_template_expression.span,
      Expr::This(this_expression) => this_expression.span,
      Expr::Tpl(template_literal) => template_literal.span,
      Expr::Unary(unary_expression) => unary_expression.span,
      Expr::Update(update_expression) => update_expression.span,
      Expr::Yield(yield_expression) => yield_expression.span,
      Expr::JSXMember(_) => unimplemented!("Cannot convert Expr::JSXMember"),
      Expr::JSXNamespacedName(_) => unimplemented!("Cannot convert Expr::JSXNamespacedName"),
      Expr::JSXEmpty(_) => unimplemented!("Cannot convert Expr::JSXEmpty"),
      Expr::JSXElement(_) => unimplemented!("Cannot convert Expr::JSXElement"),
      Expr::JSXFragment(_) => unimplemented!("Cannot convert Expr::JSXFragment"),
      Expr::TsTypeAssertion(_) => unimplemented!("Cannot convert Expr::TsTypeAssertion"),
      Expr::TsConstAssertion(_) => unimplemented!("Cannot convert Expr::TsConstAssertion"),
      Expr::TsNonNull(_) => unimplemented!("Cannot convert Expr::TsNonNull"),
      Expr::TsAs(_) => unimplemented!("Cannot convert Expr::TsAs"),
      Expr::TsInstantiation(_) => unimplemented!("Cannot convert Expr::TsInstantiation"),
      Expr::TsSatisfies(_) => unimplemented!("Cannot convert Expr::TsSatisfies"),
      Expr::Invalid(_) => unimplemented!("Cannot convert Expr::Invalid"),
      Expr::Lit(Lit::JSXText(_)) => unimplemented!("Cannot convert Lit::JSXText"),
    }
  }

  fn convert_literal(&mut self, literal: &Lit) {
    match literal {
      Lit::BigInt(bigint_literal) => self.convert_literal_bigint(bigint_literal),
      Lit::Bool(boolean_literal) => {
        self.convert_literal_boolean(boolean_literal);
      }
      Lit::Null(null_literal) => {
        self.convert_literal_null(null_literal);
      }
      Lit::Num(number_literal) => {
        self.convert_literal_number(number_literal);
      }
      Lit::Regex(regex_literal) => {
        self.convert_literal_regex(regex_literal);
      }
      Lit::Str(string_literal) => {
        self.convert_literal_string(string_literal);
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
      ModuleDecl::TsImportEquals(_) => unimplemented!("Cannot convert ModuleDecl::TsImportEquals"),
      ModuleDecl::TsExportAssignment(_) => {
        unimplemented!("Cannot convert ModuleDecl::TsExportAssignment")
      }
      ModuleDecl::TsNamespaceExport(_) => {
        unimplemented!("Cannot convert ModuleDecl::TsNamespaceExport")
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
      Decl::Using(_) => unimplemented!("Cannot convert Decl::Using"),
      Decl::TsInterface(_) => unimplemented!("Cannot convert Decl::TsInterface"),
      Decl::TsTypeAlias(_) => unimplemented!("Cannot convert Decl::TsTypeAlias"),
      Decl::TsEnum(_) => unimplemented!("Cannot convert Decl::TsEnum"),
      Decl::TsModule(_) => unimplemented!("Cannot convert Decl::TsModule"),
    }
  }

  fn convert_pattern(&mut self, pattern: &Pat) -> Option<(u32, u32)> {
    match pattern {
      Pat::Array(array_pattern) => {
        self.convert_array_pattern(array_pattern);
        None
      }
      Pat::Assign(assignment_pattern) => {
        self.convert_assignment_pattern(assignment_pattern);
        None
      }
      Pat::Expr(expression) => self.convert_expression(expression),
      Pat::Ident(binding_identifier) => {
        self.convert_binding_identifier(binding_identifier);
        None
      }
      Pat::Object(object) => {
        self.convert_object_pattern(object);
        None
      }
      Pat::Rest(rest_pattern) => {
        self.convert_rest_pattern(rest_pattern);
        None
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
      ExportSpecifier::Namespace(_) => unimplemented!("Cannot convert ExportSpecifier::Namespace"),
      ExportSpecifier::Default(_) => unimplemented!("Cannot convert ExportSpecifier::Default"),
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
      ClassMember::TsIndexSignature(_) => {
        unimplemented!("Cannot convert ClassMember::TsIndexSignature")
      }
      ClassMember::AutoAccessor(_) => unimplemented!("Cannot convert ClassMember::AutoAccessor"),
      ClassMember::Empty(_) => {}
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
      Prop::Assign(_) => unimplemented!("Cannot convert Prop::Assign"),
    }
  }

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

  fn convert_parenthesized_expression(
    &mut self,
    parenthesized_expression: &ParenExpr,
  ) -> (u32, u32) {
    let start = self.index_converter.convert(
      parenthesized_expression.span.lo.0 - 1,
      match &*parenthesized_expression.expr {
        Expr::Call(_) | Expr::New(_) | Expr::Paren(_) => true,
        _ => false,
      },
    );
    self.convert_expression(&parenthesized_expression.expr);
    let end = self
      .index_converter
      .convert(parenthesized_expression.span.hi.0 - 1, false);
    (start, end)
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
    match export_named_declaration.specifiers.first() {
      Some(ExportSpecifier::Namespace(export_namespace_specifier)) => self
        .store_export_all_declaration(
          &export_named_declaration.span,
          export_named_declaration.src.as_ref().unwrap(),
          &export_named_declaration.with,
          Some(&export_namespace_specifier.name),
        ),
      None | Some(ExportSpecifier::Named(_)) => self.store_export_named_declaration(
        &export_named_declaration.span,
        &export_named_declaration.specifiers,
        export_named_declaration
          .src
          .as_ref()
          .map(|source| &**source),
        None,
        &export_named_declaration.with,
      ),
      Some(ExportSpecifier::Default(_)) => panic!("Unexpected default export specifier"),
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
      ForHead::UsingDecl(_) => unimplemented!("Cannot convert ForHead::UsingDecl"),
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
    self.store_export_all_declaration(&export_all.span, &export_all.src, &export_all.with, None);
  }

  fn convert_identifier(&mut self, identifier: &Ident) {
    self.store_identifier(
      identifier.span.lo.0 - 1,
      identifier.span.hi.0 - 1,
      &identifier.sym,
    );
  }

  // === nodes
  fn store_program(&mut self, body: ModuleItemsOrStatements) {
    let end_position = self.add_type_and_explicit_start(&TYPE_PROGRAM, 0u32);
    // reserve annotations
    let reference_position = self.reserve_reference_positions(1);
    // body
    let mut keep_checking_directives = true;
    match body {
      ModuleItemsOrStatements::ModuleItems(module_items) => {
        self.convert_item_list_with_state(
          module_items,
          &mut keep_checking_directives,
          |ast_converter, module_item, can_be_directive| {
            if *can_be_directive {
              if let ModuleItem::Stmt(Stmt::Expr(expression)) = &*module_item {
                if let Expr::Lit(Lit::Str(string)) = &*expression.expr {
                  ast_converter.convert_expression_statement(expression, Some(&string.value));
                  return true;
                }
              };
            }
            *can_be_directive = false;
            ast_converter.convert_module_item(module_item);
            true
          },
        );
      }
      ModuleItemsOrStatements::Statements(statements) => {
        self.convert_item_list_with_state(
          statements,
          &mut keep_checking_directives,
          |ast_converter, statement, can_be_directive| {
            if *can_be_directive {
              if let Stmt::Expr(expression) = &*statement {
                if let Expr::Lit(Lit::Str(string)) = &*expression.expr {
                  ast_converter.convert_expression_statement(expression, Some(&string.value));
                  return true;
                }
              };
            }
            *can_be_directive = false;
            ast_converter.convert_statement(statement);
            true
          },
        );
      }
    }
    // end
    self.add_explicit_end(end_position, self.code.len() as u32);
    // annotations
    self.update_reference_position(reference_position);
    self.index_converter.invalidate_collected_annotations();
    let invalid_annotations = self.index_converter.take_invalid_annotations();
    self.convert_item_list(&invalid_annotations, |ast_converter, annotation| {
      ast_converter.convert_annotation(annotation);
      true
    });
  }

  fn convert_expression_statement(
    &mut self,
    expression_statement: &ExprStmt,
    directive: Option<&JsWord>,
  ) {
    let end_position =
      self.add_type_and_start(&TYPE_EXPRESSION_STATEMENT, &expression_statement.span);
    // reserve directive
    let reference_position = self.reserve_reference_positions(1);
    // expression
    self.convert_expression(&expression_statement.expr);
    // directive
    directive.map(|directive| {
      self.update_reference_position(reference_position);
      self.convert_string(directive);
    });
    // end
    self.add_end(end_position, &expression_statement.span);
  }

  fn store_export_named_declaration(
    &mut self,
    span: &Span,
    specifiers: &Vec<ExportSpecifier>,
    src: Option<&Str>,
    declaration: Option<&Decl>,
    with: &Option<Box<ObjectLit>>,
  ) {
    let end_position = self.add_type_and_start_and_handle_annotations(
      &TYPE_EXPORT_NAMED_DECLARATION,
      span,
      match declaration {
        Some(Decl::Fn(_)) => true,
        Some(Decl::Var(variable_declaration)) => variable_declaration.kind == VarDeclKind::Const,
        _ => false,
      },
    );
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
    self.store_import_attributes(with);
    // end
    self.add_end(end_position, span);
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
    let end_position = self.add_type_and_start_and_handle_annotations(
      &TYPE_VARIABLE_DECLARATION,
      &variable_declaration.span,
      match variable_declaration.kind {
        VarDeclKind::Const => true,
        _ => false,
      },
    );
    self
      .buffer
      .extend_from_slice(match variable_declaration.kind {
        VarDeclKind::Var => &STRING_VAR,
        VarDeclKind::Let => &STRING_LET,
        VarDeclKind::Const => &STRING_CONST,
      });
    self.convert_item_list(
      &variable_declaration.decls,
      |ast_converter, variable_declarator| {
        ast_converter.convert_variable_declarator(variable_declarator);
        true
      },
    );
    // end
    self.add_end(end_position, &variable_declaration.span);
  }

  fn convert_variable_declarator(&mut self, variable_declarator: &VarDeclarator) {
    let end_position =
      self.add_type_and_start(&TYPE_VARIABLE_DECLARATOR, &variable_declarator.span);
    let forwarded_annotations = match &variable_declarator.init {
      Some(expression) => match &**expression {
        Expr::Arrow(_) => {
          let annotations = self
            .index_converter
            .take_collected_annotations(AnnotationKind::NoSideEffects);
          Some(annotations)
        }
        _ => None,
      },
      None => None,
    };
    // reserve for init
    let reference_position = self.reserve_reference_positions(1);
    // id
    self.convert_pattern(&variable_declarator.name);
    // init
    forwarded_annotations.map(|annotations| {
      self.index_converter.add_collected_annotations(annotations);
    });
    variable_declarator.init.as_ref().map(|init| {
      self.update_reference_position(reference_position);
      self.convert_expression(&init);
    });
    // end
    self.add_end(end_position, &variable_declarator.span);
  }

  fn store_identifier(&mut self, start: u32, end: u32, name: &str) {
    let end_position = self.add_type_and_explicit_start(&TYPE_IDENTIFIER, start);
    // name
    self.convert_string(name);
    // end
    self.add_explicit_end(end_position, end);
  }

  fn convert_export_named_specifier(&mut self, export_named_specifier: &ExportNamedSpecifier) {
    let end_position =
      self.add_type_and_start(&TYPE_EXPORT_SPECIFIER, &export_named_specifier.span);
    // reserve for exported
    let reference_position = self.reserve_reference_positions(1);
    // local
    self.convert_module_export_name(&export_named_specifier.orig);
    // exported
    export_named_specifier.exported.as_ref().map(|exported| {
      self.update_reference_position(reference_position);
      self.convert_module_export_name(&exported);
    });
    // end
    self.add_end(end_position, &export_named_specifier.span);
  }

  fn convert_import_declaration(&mut self, import_declaration: &ImportDecl) {
    let end_position = self.add_type_and_start(&TYPE_IMPORT_DECLARATION, &import_declaration.span);
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
    self.store_import_attributes(&import_declaration.with);
    // end
    self.add_end(end_position, &import_declaration.span);
  }

  fn store_import_attributes(&mut self, with: &Option<Box<ObjectLit>>) {
    match with {
      Some(ref with) => {
        self.convert_item_list(&with.props, |ast_converter, prop| match prop {
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
    let end_position = self.add_type_and_start(&TYPE_IMPORT_EXPRESSION, span);
    // reserve for options
    let reference_position = self.reserve_reference_positions(1);
    // source
    self.convert_expression(&*arguments.first().unwrap().expr);
    // options
    arguments.get(1).map(|argument| {
      self.update_reference_position(reference_position);
      self.convert_expression_or_spread(argument);
    });
    // end
    self.add_end(end_position, span);
  }

  fn store_call_expression(
    &mut self,
    span: &Span,
    is_optional: bool,
    callee: &StoredCallee,
    arguments: &[ExprOrSpread],
    is_chained: bool,
  ) {
    let end_position = self.add_type_and_start(&TYPE_CALL_EXPRESSION, span);
    let annotations = self
      .index_converter
      .take_collected_annotations(AnnotationKind::Pure);
    // optional
    self.convert_boolean(is_optional);
    // reserve for callee, arguments
    let reference_position = self.reserve_reference_positions(2);
    // annotations
    self.convert_item_list(&annotations, |ast_converter, annotation| {
      ast_converter.convert_annotation(annotation);
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
    // arguments
    self.update_reference_position(reference_position + 4);
    self.convert_item_list(arguments, |ast_converter, argument| {
      ast_converter.convert_expression_or_spread(argument);
      true
    });
    // end
    self.add_end(end_position, span);
  }

  fn convert_import_named_specifier(&mut self, import_named_specifier: &ImportNamedSpecifier) {
    let end_position =
      self.add_type_and_start(&TYPE_IMPORT_SPECIFIER, &import_named_specifier.span);
    // reserve for imported, local
    let reference_position = self.reserve_reference_positions(2);
    // imported
    import_named_specifier.imported.as_ref().map(|imported| {
      self.update_reference_position(reference_position);
      self.convert_module_export_name(&imported);
    });
    // local
    self.update_reference_position(reference_position + 4);
    self.convert_identifier(&import_named_specifier.local);
    // end
    self.add_end(end_position, &import_named_specifier.span);
  }

  fn convert_arrow_expression(&mut self, arrow_expression: &ArrowExpr) {
    let end_position =
      self.add_type_and_start(&TYPE_ARROW_FUNCTION_EXPRESSION, &arrow_expression.span);
    let annotations = self
      .index_converter
      .take_collected_annotations(AnnotationKind::NoSideEffects);
    // async
    self.convert_boolean(arrow_expression.is_async);
    // generator
    self.convert_boolean(arrow_expression.is_generator);
    // expression
    self.convert_boolean(match &*arrow_expression.body {
      BlockStmtOrExpr::BlockStmt(_) => false,
      BlockStmtOrExpr::Expr(_) => true,
    });
    // reserve for params, body
    let reference_position = self.reserve_reference_positions(2);
    // annotations
    self.convert_item_list(&annotations, |ast_converter, annotation| {
      ast_converter.convert_annotation(annotation);
      true
    });
    // params
    self.update_reference_position(reference_position);
    self.convert_item_list(&arrow_expression.params, |ast_converter, param| {
      ast_converter.convert_pattern(param);
      true
    });
    // body
    self.update_reference_position(reference_position + 4);
    match &*arrow_expression.body {
      BlockStmtOrExpr::BlockStmt(block_statement) => {
        self.convert_block_statement(block_statement, true)
      }
      BlockStmtOrExpr::Expr(expression) => {
        self.convert_expression(expression);
      }
    }
    // end
    self.add_end(end_position, &arrow_expression.span);
  }

  fn convert_block_statement(&mut self, block_statement: &BlockStmt, check_directive: bool) {
    let end_position = self.add_type_and_start(&TYPE_BLOCK_STATEMENT, &block_statement.span);
    // body
    let mut keep_checking_directives = check_directive;
    self.convert_item_list_with_state(
      &block_statement.stmts,
      &mut keep_checking_directives,
      |ast_converter, statement, can_be_directive| {
        if *can_be_directive {
          if let Stmt::Expr(expression) = &*statement {
            if let Expr::Lit(Lit::Str(string)) = &*expression.expr {
              ast_converter.convert_expression_statement(expression, Some(&string.value));
              return true;
            }
          }
        }
        *can_be_directive = false;
        ast_converter.convert_statement(statement);
        true
      },
    );
    // end
    self.add_end(end_position, &block_statement.span);
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
    let end_position = self.add_type_and_start(&TYPE_SPREAD_ELEMENT, dot_span);
    // we need to set the end position to that of the expression
    let argument_position = self.buffer.len();
    // argument
    self.convert_expression(argument);
    let expression_end: [u8; 4] = self.buffer[argument_position + 8..argument_position + 12]
      .try_into()
      .unwrap();
    self.buffer[end_position..end_position + 4].copy_from_slice(&expression_end);
  }

  fn store_member_expression(
    &mut self,
    span: &Span,
    is_optional: bool,
    object: &ExpressionOrSuper,
    property: MemberOrSuperProp,
    is_chained: bool,
  ) {
    let end_position = self.add_type_and_start(&TYPE_MEMBER_EXPRESSION, span);
    // optional
    self.convert_boolean(is_optional);
    // computed
    self.convert_boolean(match property {
      MemberOrSuperProp::Computed(_) => true,
      _ => false,
    });
    // reserve property
    let reference_position = self.reserve_reference_positions(1);
    // object
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
    // property
    self.update_reference_position(reference_position);
    match property {
      MemberOrSuperProp::Identifier(ident) => self.convert_identifier(&ident),
      MemberOrSuperProp::Computed(computed) => {
        self.convert_expression(&computed.expr);
      }
      MemberOrSuperProp::PrivateName(private_name) => self.convert_private_name(&private_name),
    }
    // end
    self.add_end(end_position, span);
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
    let end_position = self.add_type_and_start(
      &TYPE_IMPORT_DEFAULT_SPECIFIER,
      &import_default_specifier.span,
    );
    // local
    self.convert_identifier(&import_default_specifier.local);
    // end
    self.add_end(end_position, &import_default_specifier.span);
  }

  fn convert_literal_boolean(&mut self, literal: &Bool) {
    self.add_type_and_positions(&TYPE_LITERAL_BOOLEAN, &literal.span);
    // value
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
    let end_position = self.add_type_and_start_and_handle_annotations(
      &TYPE_EXPORT_DEFAULT_DECLARATION,
      span,
      match expression {
        StoredDefaultExportExpression::Expression(Expr::Fn(_) | Expr::Arrow(_))
        | StoredDefaultExportExpression::Function(_) => true,
        _ => false,
      },
    );
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
    // end
    self.add_end(end_position, span);
  }

  fn convert_literal_null(&mut self, literal: &Null) {
    self.add_type_and_positions(&TYPE_LITERAL_NULL, &literal.span);
  }

  fn convert_import_namespace_specifier(
    &mut self,
    import_namespace_specifier: &ImportStarAsSpecifier,
  ) {
    let end_position = self.add_type_and_start(
      &TYPE_IMPORT_NAMESPACE_SPECIFIER,
      &import_namespace_specifier.span,
    );
    // local
    self.convert_identifier(&import_namespace_specifier.local);
    // end
    self.add_end(end_position, &import_namespace_specifier.span);
  }

  fn store_export_all_declaration(
    &mut self,
    span: &Span,
    source: &Str,
    attributes: &Option<Box<ObjectLit>>,
    exported: Option<&ModuleExportName>,
  ) {
    let end_position = self.add_type_and_start(&TYPE_EXPORT_ALL_DECLARATION, span);
    // reserve exported, source, attributes
    let reference_position = self.reserve_reference_positions(3);
    // exported
    exported.map(|exported| {
      self.update_reference_position(reference_position);
      self.convert_module_export_name(exported);
    });
    // source
    self.update_reference_position(reference_position + 4);
    self.convert_literal_string(source);
    // attributes
    self.update_reference_position(reference_position + 8);
    self.store_import_attributes(attributes);
    // end
    self.add_end(end_position, span);
  }

  fn convert_binary_expression(&mut self, binary_expression: &BinExpr) {
    let end_position = self.add_type_and_start(
      match binary_expression.op {
        BinaryOp::LogicalOr | BinaryOp::LogicalAnd | BinaryOp::NullishCoalescing => {
          &TYPE_LOGICAL_EXPRESSION
        }
        _ => &TYPE_BINARY_EXPRESSION,
      },
      &binary_expression.span,
    );
    // operator
    self.buffer.extend_from_slice(match binary_expression.op {
      BinaryOp::EqEq => &STRING_EQEQ,
      BinaryOp::NotEq => &STRING_NOTEQ,
      BinaryOp::EqEqEq => &STRING_EQEQEQ,
      BinaryOp::NotEqEq => &STRING_NOTEQEQ,
      BinaryOp::Lt => &STRING_LT,
      BinaryOp::LtEq => &STRING_LTEQ,
      BinaryOp::Gt => &STRING_GT,
      BinaryOp::GtEq => &STRING_GTEQ,
      BinaryOp::LShift => &STRING_LSHIFT,
      BinaryOp::RShift => &STRING_RSHIFT,
      BinaryOp::ZeroFillRShift => &STRING_ZEROFILLRSHIFT,
      BinaryOp::Add => &STRING_ADD,
      BinaryOp::Sub => &STRING_SUB,
      BinaryOp::Mul => &STRING_MUL,
      BinaryOp::Div => &STRING_DIV,
      BinaryOp::Mod => &STRING_MOD,
      BinaryOp::BitOr => &STRING_BITOR,
      BinaryOp::BitXor => &STRING_BITXOR,
      BinaryOp::BitAnd => &STRING_BITAND,
      BinaryOp::LogicalOr => &STRING_LOGICALOR,
      BinaryOp::LogicalAnd => &STRING_LOGICALAND,
      BinaryOp::In => &STRING_IN,
      BinaryOp::InstanceOf => &STRING_INSTANCEOF,
      BinaryOp::Exp => &STRING_EXP,
      BinaryOp::NullishCoalescing => &STRING_NULLISHCOALESCING,
    });
    // reserve right
    let reference_position = self.reserve_reference_positions(1);
    // left
    self.convert_expression(&binary_expression.left);
    // right
    self.update_reference_position(reference_position);
    self.convert_expression(&binary_expression.right);
    // end
    self.add_end(end_position, &binary_expression.span);
  }

  fn convert_array_pattern(&mut self, array_pattern: &ArrayPat) {
    let end_position = self.add_type_and_start(&TYPE_ARRAY_PATTERN, &array_pattern.span);
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
    // end
    self.add_end(end_position, &array_pattern.span);
  }

  fn convert_object_pattern(&mut self, object_pattern: &ObjectPat) {
    let end_position = self.add_type_and_start(&TYPE_OBJECT_PATTERN, &object_pattern.span);
    // properties
    self.convert_item_list(
      &object_pattern.props,
      |ast_converter, object_pattern_property| {
        ast_converter.convert_object_pattern_property(object_pattern_property);
        true
      },
    );
    // end
    self.add_end(end_position, &object_pattern.span);
  }

  fn convert_array_literal(&mut self, array_literal: &ArrayLit) {
    let end_position = self.add_type_and_start(&TYPE_ARRAY_EXPRESSION, &array_literal.span);
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
    // end
    self.add_end(end_position, &array_literal.span);
  }

  fn convert_conditional_expression(&mut self, conditional_expression: &CondExpr) {
    let end_position =
      self.add_type_and_start(&TYPE_CONDITIONAL_EXPRESSION, &conditional_expression.span);
    // reserve consequent, alternate
    let reference_position = self.reserve_reference_positions(2);
    // test
    self.convert_expression(&conditional_expression.test);
    // consequent
    self.update_reference_position(reference_position);
    self.convert_expression(&conditional_expression.cons);
    // alternate
    self.update_reference_position(reference_position + 4);
    self.convert_expression(&conditional_expression.alt);
    // end
    self.add_end(end_position, &conditional_expression.span);
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
      true,
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
    let end_position = self.add_type_and_start(node_type, &class.span);
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
      self.convert_expression(super_class);
      body_start_search = self.get_expression_span(super_class).hi.0 - 1;
    });
    // body
    self.update_reference_position(reference_position + 8);
    let class_body_start =
      find_first_occurrence_outside_comment(self.code, b'{', body_start_search);
    self.convert_class_body(&class.body, class_body_start, class.span.hi.0 - 1);
    // end
    self.add_end(end_position, &class.span);
  }

  fn convert_class_body(&mut self, class_members: &Vec<ClassMember>, start: u32, end: u32) {
    let end_position = self.add_type_and_explicit_start(&TYPE_CLASS_BODY, start);
    let class_members_filtered: Vec<&ClassMember> = class_members
      .iter()
      .filter(|class_member| match class_member {
        ClassMember::Empty(_) => false,
        _ => true,
      })
      .collect();
    // body
    self.convert_item_list(&class_members_filtered, |ast_converter, class_member| {
      ast_converter.convert_class_member(class_member);
      true
    });
    // end
    self.add_explicit_end(end_position, end);
  }

  fn convert_return_statement(&mut self, return_statement: &ReturnStmt) {
    let end_position = self.add_type_and_start(&TYPE_RETURN_STATEMENT, &return_statement.span);
    // reserve argument
    let reference_position = self.reserve_reference_positions(1);
    // argument
    return_statement.arg.as_ref().map(|argument| {
      self.update_reference_position(reference_position);
      self.convert_expression(argument)
    });
    // end
    self.add_end(end_position, &return_statement.span);
  }

  fn convert_import_attribute(&mut self, key_value_property: &KeyValueProp) {
    // type
    self.buffer.extend_from_slice(&TYPE_IMPORT_ATTRIBUTE);
    // reserve start, end, value
    let reference_position = self.reserve_reference_positions(3);
    // key
    let key_position = self.buffer.len();
    let key_boundaries = self.convert_property_name(&key_value_property.key);
    let start_bytes: [u8; 4] = match key_boundaries {
      Some((start, _)) => start.to_ne_bytes(),
      None => {
        let key_start: [u8; 4] = self.buffer[key_position + 4..key_position + 8]
          .try_into()
          .unwrap();
        key_start
      }
    };
    self.buffer[reference_position..reference_position + 4].copy_from_slice(&start_bytes);
    // value
    self.update_reference_position(reference_position + 8);
    let value_position = self.buffer.len();
    let value_boundaries = self.convert_expression(&key_value_property.value);
    let end_bytes: [u8; 4] = match value_boundaries {
      Some((_, end)) => end.to_ne_bytes(),
      None => {
        let value_end: [u8; 4] = self.buffer[value_position + 8..value_position + 12]
          .try_into()
          .unwrap();
        value_end
      }
    };
    self.buffer[reference_position + 4..reference_position + 8].copy_from_slice(&end_bytes);
  }

  fn convert_object_literal(&mut self, object_literal: &ObjectLit) {
    let end_position = self.add_type_and_start(&TYPE_OBJECT_EXPRESSION, &object_literal.span);
    // properties
    self.convert_item_list(
      &object_literal.props,
      |ast_converter, property_or_spread| {
        ast_converter.convert_property_or_spread(property_or_spread);
        true
      },
    );
    // end
    self.add_end(end_position, &object_literal.span);
  }

  fn convert_property_name(&mut self, property_name: &PropName) -> Option<(u32, u32)> {
    match property_name {
      PropName::Computed(computed_property_name) => {
        self.convert_expression(computed_property_name.expr.as_ref())
      }
      PropName::Ident(ident) => {
        self.convert_identifier(ident);
        None
      }
      PropName::Str(string) => {
        self.convert_literal_string(&string);
        None
      }
      PropName::Num(number) => {
        self.convert_literal_number(&number);
        None
      }
      PropName::BigInt(bigint) => {
        self.convert_literal_bigint(&bigint);
        None
      }
    }
  }

  fn get_property_name_span(&self, property_name: &PropName) -> Span {
    match property_name {
      PropName::Computed(computed_property_name) => computed_property_name.span,
      PropName::Ident(ident) => ident.span,
      PropName::Str(string) => string.span,
      PropName::Num(number) => number.span,
      PropName::BigInt(bigint) => bigint.span,
    }
  }

  // TODO SWC property has many different formats that should be merged if possible
  fn store_key_value_property(&mut self, property_name: &PropName, value: PatternOrExpression) {
    let end_position = self.add_type_and_explicit_start(
      &TYPE_PROPERTY,
      self.get_property_name_span(property_name).lo.0 - 1,
    );
    // kind
    self.buffer.extend_from_slice(&STRING_INIT);
    // method
    self.convert_boolean(false);
    // computed
    self.convert_boolean(match property_name {
      PropName::Computed(_) => true,
      _ => false,
    });
    // shorthand
    self.convert_boolean(false);
    // reserve key, value
    let reference_position = self.reserve_reference_positions(2);
    // key
    self.update_reference_position(reference_position);
    self.convert_property_name(property_name);
    // value
    self.update_reference_position(reference_position + 4);
    let value_position = self.buffer.len();
    let value_boundaries = match value {
      PatternOrExpression::Pattern(pattern) => self.convert_pattern(pattern),
      PatternOrExpression::Expression(expression) => self.convert_expression(expression),
    };
    // end
    let end_bytes: [u8; 4] = match value_boundaries {
      Some((_, end)) => end.to_ne_bytes(),
      None => {
        let value_end: [u8; 4] = self.buffer[value_position + 8..value_position + 12]
          .try_into()
          .unwrap();
        value_end
      }
    };
    // TODO SWC avoid copying positions around but use span getters instead
    self.buffer[end_position..end_position + 4].copy_from_slice(&end_bytes);
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

  // TODO SWC merge with method
  fn store_getter_setter_property(
    &mut self,
    span: &Span,
    kind: &[u8; 4],
    key: &PropName,
    body: &Option<BlockStmt>,
    param: Option<&Pat>,
  ) {
    let end_position = self.add_type_and_start(&TYPE_PROPERTY, span);
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
    // reserve key, value
    let reference_position = self.reserve_reference_positions(2);
    // key
    self.update_reference_position(reference_position);
    self.convert_property_name(key);
    let key_end = self.get_property_name_span(&key).hi.0 - 1;
    // value
    let block_statement = body.as_ref().expect("Getter/setter property without body");
    self.update_reference_position(reference_position + 4);
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
      false,
    );
    // end
    self.add_end(end_position, span);
  }

  fn convert_getter_property(&mut self, getter_property: &GetterProp) {
    self.store_getter_setter_property(
      &getter_property.span,
      &STRING_GET,
      &getter_property.key,
      &getter_property.body,
      None,
    );
  }

  fn convert_setter_property(&mut self, setter_property: &SetterProp) {
    self.store_getter_setter_property(
      &setter_property.span,
      &STRING_SET,
      &setter_property.key,
      &setter_property.body,
      Some(&*setter_property.param),
    );
  }

  fn convert_method_property(&mut self, method_property: &MethodProp) {
    let end_position = self.add_type_and_start(&TYPE_PROPERTY, &method_property.function.span);
    // kind
    self.buffer.extend_from_slice(&STRING_INIT);
    // method
    self.convert_boolean(true);
    // computed
    self.convert_boolean(match &method_property.key {
      PropName::Computed(_) => true,
      _ => false,
    });
    // shorthand
    self.convert_boolean(false);
    // reserve key, value
    let reference_position = self.reserve_reference_positions(2);
    // key
    self.update_reference_position(reference_position);
    self.convert_property_name(&method_property.key);
    let key_end = self.get_property_name_span(&method_property.key).hi.0 - 1;
    let function_start = find_first_occurrence_outside_comment(self.code, b'(', key_end);
    // value
    self.update_reference_position(reference_position + 4);
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
      false,
    );
    // end
    self.add_end(end_position, &method_property.function.span);
  }

  fn store_shorthand_property(
    &mut self,
    span: &Span,
    key: &Ident,
    assignment_value: &Option<Box<Expr>>,
  ) {
    let end_position = self.add_type_and_start(&TYPE_PROPERTY, span);
    // kind
    self.buffer.extend_from_slice(&STRING_INIT);
    // method
    self.convert_boolean(false);
    // computed
    self.convert_boolean(false);
    // shorthand
    self.convert_boolean(true);
    // reserve key, value
    let reference_position = self.reserve_reference_positions(2);
    // value
    match assignment_value {
      Some(value) => {
        // value
        self.update_reference_position(reference_position + 4);
        let left_position = self.store_assignment_pattern_and_get_left_position(
          span,
          PatternOrIdentifier::Identifier(key),
          value,
        );
        // key, reuse identifier to avoid converting positions out of order
        self.buffer[reference_position..reference_position + 4]
          .copy_from_slice(&left_position.to_ne_bytes());
      }
      None => {
        // key
        self.update_reference_position(reference_position);
        self.convert_identifier(key);
      }
    }
    // end
    self.add_end(end_position, span);
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
    let end_position =
      self.add_type_and_start(&TYPE_ASSIGNMENT_EXPRESSION, &assignment_expression.span);
    // operator
    self
      .buffer
      .extend_from_slice(match assignment_expression.op {
        AssignOp::Assign => &STRING_ASSIGN,
        AssignOp::AddAssign => &STRING_ADDASSIGN,
        AssignOp::SubAssign => &STRING_SUBASSIGN,
        AssignOp::MulAssign => &STRING_MULASSIGN,
        AssignOp::DivAssign => &STRING_DIVASSIGN,
        AssignOp::ModAssign => &STRING_MODASSIGN,
        AssignOp::LShiftAssign => &STRING_LSHIFTASSIGN,
        AssignOp::RShiftAssign => &STRING_RSHIFTASSIGN,
        AssignOp::ZeroFillRShiftAssign => &STRING_ZEROFILLRSHIFTASSIGN,
        AssignOp::BitOrAssign => &STRING_BITORASSIGN,
        AssignOp::BitXorAssign => &STRING_BITXORASSIGN,
        AssignOp::BitAndAssign => &STRING_BITANDASSIGN,
        AssignOp::ExpAssign => &STRING_EXPASSIGN,
        AssignOp::AndAssign => &STRING_ANDASSIGN,
        AssignOp::OrAssign => &STRING_ORASSIGN,
        AssignOp::NullishAssign => &STRING_NULLISHASSIGN,
      });
    // reserve right
    let reference_position = self.reserve_reference_positions(1);
    // left
    self.convert_pattern_or_expression(&assignment_expression.left);
    // right
    self.update_reference_position(reference_position);
    self.convert_expression(&assignment_expression.right);
    // end
    self.add_end(end_position, &assignment_expression.span);
  }

  fn convert_new_expression(&mut self, new_expression: &NewExpr) {
    let end_position = self.add_type_and_start(&TYPE_NEW_EXPRESSION, &new_expression.span);
    let annotations = self
      .index_converter
      .take_collected_annotations(AnnotationKind::Pure);
    // reserve for callee, args
    let reference_position = self.reserve_reference_positions(2);
    // annotations
    self.convert_item_list(&annotations, |ast_converter, annotation| {
      ast_converter.convert_annotation(annotation);
      true
    });
    // callee
    self.update_reference_position(reference_position);
    self.convert_expression(&new_expression.callee);
    // args
    if let Some(expressions_or_spread) = &new_expression.args {
      self.update_reference_position(reference_position + 4);
      self.convert_item_list(
        &expressions_or_spread,
        |ast_converter, expression_or_spread| {
          ast_converter.convert_expression_or_spread(expression_or_spread);
          true
        },
      );
    }
    // end
    self.add_end(end_position, &new_expression.span);
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
    observe_annotations: bool,
  ) {
    let end_position = self.add_type_and_explicit_start(node_type, start);
    // async
    self.convert_boolean(is_async);
    // generator
    self.convert_boolean(is_generator);
    // reserve id, params, body
    let reference_position = self.reserve_reference_positions(3);
    // annotations
    if observe_annotations {
      let annotations = self
        .index_converter
        .take_collected_annotations(AnnotationKind::NoSideEffects);
      self.convert_item_list(&annotations, |ast_converter, annotation| {
        ast_converter.convert_annotation(annotation);
        true
      });
    } else {
      self.buffer.extend_from_slice(&0u32.to_ne_bytes());
    }
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
    // body
    self.update_reference_position(reference_position + 8);
    self.convert_block_statement(body, true);
    // end
    self.add_explicit_end(end_position, end);
  }

  fn convert_throw_statement(&mut self, throw_statement: &ThrowStmt) {
    let end_position = self.add_type_and_start(&TYPE_THROW_STATEMENT, &throw_statement.span);
    // argument
    self.convert_expression(&throw_statement.arg);
    // end
    self.add_end(end_position, &throw_statement.span);
  }

  fn convert_assignment_pattern(&mut self, assignment_pattern: &AssignPat) {
    self.store_assignment_pattern_and_get_left_position(
      &assignment_pattern.span,
      PatternOrIdentifier::Pattern(&assignment_pattern.left),
      &assignment_pattern.right,
    );
  }

  fn store_assignment_pattern_and_get_left_position(
    &mut self,
    span: &Span,
    left: PatternOrIdentifier,
    right: &Expr,
  ) -> u32 {
    let end_position = self.add_type_and_start(&TYPE_ASSIGNMENT_PATTERN, span);
    // reserve right
    let reference_position = self.reserve_reference_positions(1);
    // left
    let left_position = (self.buffer.len() >> 2) as u32;
    match left {
      PatternOrIdentifier::Pattern(pattern) => {
        self.convert_pattern(&pattern);
      }
      PatternOrIdentifier::Identifier(identifier) => self.convert_identifier(&identifier),
    }
    // right
    self.update_reference_position(reference_position);
    self.convert_expression(right);
    // end
    self.add_end(end_position, span);
    left_position
  }

  fn convert_await_expression(&mut self, await_expression: &AwaitExpr) {
    let end_position = self.add_type_and_start(&TYPE_AWAIT_EXPRESSION, &await_expression.span);
    // argument
    self.convert_expression(&await_expression.arg);
    // end
    self.add_end(end_position, &await_expression.span);
  }

  fn convert_labeled_statement(&mut self, labeled_statement: &LabeledStmt) {
    let end_position = self.add_type_and_start(&TYPE_LABELED_STATEMENT, &labeled_statement.span);
    // reserve body
    let reference_position = self.reserve_reference_positions(1);
    // label
    self.convert_identifier(&labeled_statement.label);
    // body
    self.update_reference_position(reference_position);
    self.convert_statement(&labeled_statement.body);
    // end
    self.add_end(end_position, &labeled_statement.span);
  }

  fn convert_break_statement(&mut self, break_statement: &BreakStmt) {
    let end_position = self.add_type_and_start(&TYPE_BREAK_STATEMENT, &break_statement.span);
    // reserve label
    let reference_position = self.reserve_reference_positions(1);
    // label
    break_statement.label.as_ref().map(|label| {
      self.update_reference_position(reference_position);
      self.convert_identifier(label);
    });
    // end
    self.add_end(end_position, &break_statement.span);
  }

  fn convert_try_statement(&mut self, try_statement: &TryStmt) {
    let end_position = self.add_type_and_start(&TYPE_TRY_STATEMENT, &try_statement.span);
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
    // end
    self.add_end(end_position, &try_statement.span);
  }

  fn convert_catch_clause(&mut self, catch_clause: &CatchClause) {
    let end_position = self.add_type_and_start(&TYPE_CATCH_CLAUSE, &catch_clause.span);
    // reserve param, body
    let reference_position = self.reserve_reference_positions(2);
    // param
    catch_clause.param.as_ref().map(|pattern| {
      self.update_reference_position(reference_position);
      self.convert_pattern(pattern);
    });
    // body
    self.update_reference_position(reference_position + 4);
    self.convert_block_statement(&catch_clause.body, false);
    // end
    self.add_end(end_position, &catch_clause.span);
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
      let end_position =
        self.add_type_and_start(&TYPE_CHAIN_EXPRESSION, &optional_chain_expression.span);
      // expression
      self.convert_optional_chain_base(
        &optional_chain_expression.base,
        optional_chain_expression.optional,
      );
      // end
      self.add_end(end_position, &optional_chain_expression.span);
    }
  }

  fn convert_while_statement(&mut self, while_statement: &WhileStmt) {
    let end_position = self.add_type_and_start(&TYPE_WHILE_STATEMENT, &while_statement.span);
    // reserve body
    let reference_position = self.reserve_reference_positions(1);
    // test
    self.convert_expression(&while_statement.test);
    // body
    self.update_reference_position(reference_position);
    self.convert_statement(&while_statement.body);
    // end
    self.add_end(end_position, &while_statement.span);
  }

  fn convert_continue_statement(&mut self, continue_statement: &ContinueStmt) {
    let end_position = self.add_type_and_start(&TYPE_CONTINUE_STATEMENT, &continue_statement.span);
    // reserve label
    let reference_position = self.reserve_reference_positions(1);
    // label
    continue_statement.label.as_ref().map(|label| {
      self.update_reference_position(reference_position);
      self.convert_identifier(label);
    });
    // end
    self.add_end(end_position, &continue_statement.span);
  }

  fn convert_do_while_statement(&mut self, do_while_statement: &DoWhileStmt) {
    let end_position = self.add_type_and_start(&TYPE_DO_WHILE_STATEMENT, &do_while_statement.span);
    // reserve test
    let reference_position = self.reserve_reference_positions(1);
    // body
    self.convert_statement(&do_while_statement.body);
    // test
    self.update_reference_position(reference_position);
    self.convert_expression(&do_while_statement.test);
    // end
    self.add_end(end_position, &do_while_statement.span);
  }

  fn convert_debugger_statement(&mut self, debugger_statement: &DebuggerStmt) {
    self.add_type_and_positions(&TYPE_DEBUGGER_STATEMENT, &debugger_statement.span);
  }

  fn convert_empty_statement(&mut self, empty_statement: &EmptyStmt) {
    self.add_type_and_positions(&TYPE_EMPTY_STATEMENT, &empty_statement.span);
  }

  fn convert_for_in_statement(&mut self, for_in_statement: &ForInStmt) {
    let end_position = self.add_type_and_start(&TYPE_FOR_IN_STATEMENT, &for_in_statement.span);
    // reserve right, body
    let reference_position = self.reserve_reference_positions(2);
    // left
    self.convert_for_head(&for_in_statement.left);
    // right
    self.update_reference_position(reference_position);
    self.convert_expression(&for_in_statement.right);
    // body
    self.update_reference_position(reference_position + 4);
    self.convert_statement(&for_in_statement.body);
    // end
    self.add_end(end_position, &for_in_statement.span);
  }

  fn convert_for_of_statement(&mut self, for_of_statement: &ForOfStmt) {
    let end_position = self.add_type_and_start(&TYPE_FOR_OF_STATEMENT, &for_of_statement.span);
    // await
    self.convert_boolean(for_of_statement.is_await);
    // reserve right, body
    let reference_position = self.reserve_reference_positions(2);
    // left
    self.convert_for_head(&for_of_statement.left);
    // right
    self.update_reference_position(reference_position);
    self.convert_expression(&for_of_statement.right);
    // body
    self.update_reference_position(reference_position + 4);
    self.convert_statement(&for_of_statement.body);
    // end
    self.add_end(end_position, &for_of_statement.span);
  }

  fn convert_for_statement(&mut self, for_statement: &ForStmt) {
    let end_position = self.add_type_and_start(&TYPE_FOR_STATEMENT, &for_statement.span);
    // reserve init, test, update, body
    let reference_position = self.reserve_reference_positions(4);
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
    // body
    self.update_reference_position(reference_position + 12);
    self.convert_statement(&for_statement.body);
    // end
    self.add_end(end_position, &for_statement.span);
  }

  fn convert_if_statement(&mut self, if_statement: &IfStmt) {
    let end_position = self.add_type_and_start(&TYPE_IF_STATEMENT, &if_statement.span);
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
    // end
    self.add_end(end_position, &if_statement.span);
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
    let end_position = self.add_type_and_start(&TYPE_META_PROPERTY, &meta_property_expression.span);
    // reserve property
    let reference_position = self.reserve_reference_positions(1);
    match meta_property_expression.kind {
      MetaPropKind::ImportMeta => {
        // meta
        self.store_identifier(
          meta_property_expression.span.lo.0 - 1,
          meta_property_expression.span.lo.0 + 5,
          "import",
        );
        // property
        self.update_reference_position(reference_position);
        self.store_identifier(
          meta_property_expression.span.hi.0 - 5,
          meta_property_expression.span.hi.0 - 1,
          "meta",
        );
      }
      MetaPropKind::NewTarget => {
        // meta
        self.store_identifier(
          meta_property_expression.span.lo.0 - 1,
          meta_property_expression.span.lo.0 + 2,
          "new",
        );
        // property
        self.update_reference_position(reference_position);
        self.store_identifier(
          meta_property_expression.span.hi.0 - 7,
          meta_property_expression.span.hi.0 - 1,
          "target",
        );
      }
    }
    // end
    self.add_end(end_position, &meta_property_expression.span);
  }

  fn convert_constructor(&mut self, constructor: &Constructor) {
    let end_position = self.add_type_and_start(&TYPE_METHOD_DEFINITION, &constructor.span);
    // kind
    self.buffer.extend_from_slice(&STRING_CONSTRUCTOR);
    // computed
    self.convert_boolean(false);
    // static
    self.convert_boolean(false);
    // reserve value
    let reference_position = self.reserve_reference_positions(1);
    // key
    self.convert_property_name(&constructor.key);
    // value
    match &constructor.body {
      Some(block_statement) => {
        self.update_reference_position(reference_position);
        let key_end = self.get_property_name_span(&constructor.key).hi.0 - 1;
        let function_start = find_first_occurrence_outside_comment(self.code, b'(', key_end);
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
          false,
        );
      }
      None => {
        panic!("Getter property without body");
      }
    }
    // end
    self.add_end(end_position, &constructor.span);
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
    let end_position = self.add_type_and_start(&TYPE_METHOD_DEFINITION, span);
    // kind
    self.buffer.extend_from_slice(match kind {
      MethodKind::Method => &STRING_METHOD,
      MethodKind::Getter => &STRING_GET,
      MethodKind::Setter => &STRING_SET,
    });
    // computed
    self.convert_boolean(is_computed);
    // static
    self.convert_boolean(is_static);
    // reserve value
    let reference_position = self.reserve_reference_positions(1);
    // key
    let key_end = match key {
      PropOrPrivateName::PropName(prop_name) => {
        self.convert_property_name(&prop_name);
        self.get_property_name_span(&prop_name).hi.0 - 1
      }
      PropOrPrivateName::PrivateName(private_name) => {
        self.convert_private_name(&private_name);
        private_name.id.span.hi.0 - 1
      }
    };
    let function_start = find_first_occurrence_outside_comment(self.code, b'(', key_end);
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
      false,
    );
    // end
    self.add_end(end_position, span);
  }

  fn store_property_definition(
    &mut self,
    span: &Span,
    is_computed: bool,
    is_static: bool,
    key: PropOrPrivateName,
    value: &Option<&Expr>,
  ) {
    let end_position = self.add_type_and_start(&TYPE_PROPERTY_DEFINITION, span);
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
    // end
    self.add_end(end_position, span);
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
    let end_position = self.add_type_and_start(&TYPE_STATIC_BLOCK, &static_block.span);
    // body
    self.convert_item_list(&static_block.body.stmts, |ast_converter, statement| {
      ast_converter.convert_statement(statement);
      true
    });
    // end
    self.add_end(end_position, &static_block.span);
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
    let end_position =
      self.add_type_and_explicit_start(&TYPE_REST_ELEMENT, rest_pattern.dot3_token.lo.0 - 1);
    // argument
    self.convert_pattern(&rest_pattern.arg);
    // end
    self.add_explicit_end(end_position, rest_pattern.span.hi.0 - 1);
  }

  fn convert_sequence_expression(&mut self, sequence_expression: &SeqExpr) {
    let end_position =
      self.add_type_and_start(&TYPE_SEQUENCE_EXPRESSION, &sequence_expression.span);
    // expressions
    self.convert_item_list(&sequence_expression.exprs, |ast_converter, expression| {
      ast_converter.convert_expression(expression);
      true
    });
    // end
    self.add_end(end_position, &sequence_expression.span);
  }

  fn convert_switch_statement(&mut self, switch_statement: &SwitchStmt) {
    let end_position = self.add_type_and_start(&TYPE_SWITCH_STATEMENT, &switch_statement.span);
    // reserve cases
    let reference_position = self.reserve_reference_positions(1);
    // discriminant
    self.convert_expression(&switch_statement.discriminant);
    // cases
    self.update_reference_position(reference_position);
    self.convert_item_list(&switch_statement.cases, |ast_converter, switch_case| {
      ast_converter.convert_switch_case(switch_case);
      true
    });
    // end
    self.add_end(end_position, &switch_statement.span);
  }

  fn convert_switch_case(&mut self, switch_case: &SwitchCase) {
    let end_position = self.add_type_and_start(&TYPE_SWITCH_CASE, &switch_case.span);
    // reserve test, consequent
    let reference_position = self.reserve_reference_positions(2);
    // test
    switch_case.test.as_ref().map(|expression| {
      self.update_reference_position(reference_position);
      self.convert_expression(expression)
    });
    // consequent
    self.update_reference_position(reference_position + 4);
    self.convert_item_list(&switch_case.cons, |ast_converter, statement| {
      ast_converter.convert_statement(statement);
      true
    });
    // end
    self.add_end(end_position, &switch_case.span);
  }

  fn convert_tagged_template_expression(&mut self, tagged_template: &TaggedTpl) {
    let end_position =
      self.add_type_and_start(&TYPE_TAGGED_TEMPLATE_EXPRESSION, &tagged_template.span);
    // reserve quasi
    let reference_position = self.reserve_reference_positions(1);
    // tag
    self.convert_expression(&tagged_template.tag);
    // quasi
    self.update_reference_position(reference_position);
    self.convert_template_literal(&tagged_template.tpl);
    // end
    self.add_end(end_position, &tagged_template.span);
  }

  fn convert_template_literal(&mut self, template_literal: &Tpl) {
    let end_position = self.add_type_and_start(&TYPE_TEMPLATE_LITERAL, &template_literal.span);
    // reserve expressions
    let reference_position = self.reserve_reference_positions(1);
    // quasis, we manually do an item list here
    self
      .buffer
      .extend_from_slice(&(template_literal.quasis.len() as u32).to_ne_bytes());
    let mut next_quasi_position = self.buffer.len();
    // make room for the positions of the quasis
    self
      .buffer
      .resize(self.buffer.len() + template_literal.quasis.len() * 4, 0);
    let mut quasis = template_literal.quasis.iter();
    // convert first quasi
    let first_quasi = quasis.next().unwrap();
    let insert_position = (self.buffer.len() as u32) >> 2;
    self.convert_template_element(first_quasi);
    self.buffer[next_quasi_position..next_quasi_position + 4]
      .copy_from_slice(&insert_position.to_ne_bytes());
    next_quasi_position += 4;
    // now convert expressions, interleaved with quasis
    self.update_reference_position(reference_position);
    self
      .buffer
      .extend_from_slice(&(template_literal.exprs.len() as u32).to_ne_bytes());
    let mut next_expression_position = self.buffer.len();
    // make room for the positions of the expressions
    self
      .buffer
      .resize(self.buffer.len() + template_literal.exprs.len() * 4, 0);
    for expression in template_literal.exprs.as_slice() {
      // convert expression
      let insert_position = (self.buffer.len() as u32) >> 2;
      self.convert_expression(&expression);
      self.buffer[next_expression_position..next_expression_position + 4]
        .copy_from_slice(&insert_position.to_ne_bytes());
      next_expression_position += 4;
      // convert next quasi
      let next_quasi = quasis.next().unwrap();
      let insert_position = (self.buffer.len() as u32) >> 2;
      self.convert_template_element(next_quasi);
      self.buffer[next_quasi_position..next_quasi_position + 4]
        .copy_from_slice(&insert_position.to_ne_bytes());
      next_quasi_position += 4;
    }
    // end
    self.add_end(end_position, &template_literal.span);
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
    let end_position = self.add_type_and_start(&TYPE_UNARY_EXPRESSION, &unary_expression.span);
    // operator
    self.buffer.extend_from_slice(match unary_expression.op {
      UnaryOp::Minus => &STRING_MINUS,
      UnaryOp::Plus => &STRING_PLUS,
      UnaryOp::Bang => &STRING_BANG,
      UnaryOp::Tilde => &STRING_TILDE,
      UnaryOp::TypeOf => &STRING_TYPEOF,
      UnaryOp::Void => &STRING_VOID,
      UnaryOp::Delete => &STRING_DELETE,
    });
    // argument
    self.convert_expression(&unary_expression.arg);
    // end
    self.add_end(end_position, &unary_expression.span);
  }

  fn convert_update_expression(&mut self, update_expression: &UpdateExpr) {
    let end_position = self.add_type_and_start(&TYPE_UPDATE_EXPRESSION, &update_expression.span);
    // prefix
    self.convert_boolean(update_expression.prefix);
    // operator
    self.buffer.extend_from_slice(match update_expression.op {
      UpdateOp::PlusPlus => &STRING_PLUSPLUS,
      UpdateOp::MinusMinus => &STRING_MINUSMINUS,
    });
    // argument
    self.convert_expression(&update_expression.arg);
    // end
    self.add_end(end_position, &update_expression.span);
  }

  fn convert_yield_expression(&mut self, yield_expression: &YieldExpr) {
    let end_position = self.add_type_and_start(&TYPE_YIELD_EXPRESSION, &yield_expression.span);
    // delegate
    self.convert_boolean(yield_expression.delegate);
    // reserve argument
    let reference_position = self.reserve_reference_positions(1);
    // argument
    yield_expression.arg.as_ref().map(|expression| {
      self.update_reference_position(reference_position);
      self.convert_expression(expression)
    });
    // end
    self.add_end(end_position, &yield_expression.span);
  }

  fn convert_annotation(&mut self, annotation: &ConvertedAnnotation) {
    // start
    self
      .buffer
      .extend_from_slice(&annotation.start.to_ne_bytes());
    // end
    self.buffer.extend_from_slice(&annotation.end.to_ne_bytes());
    // kind
    self.buffer.extend_from_slice(match annotation.kind {
      AnnotationKind::Pure => &STRING_PURE,
      AnnotationKind::NoSideEffects => &STRING_NOSIDEEFFECTS,
      AnnotationKind::SourceMappingUrl => &STRING_SOURCEMAP,
    });
  }
}

pub fn convert_string(buffer: &mut Vec<u8>, string: &str) {
  let length = string.len();
  let additional_length = ((length + 3) & !3) - length;
  buffer.extend_from_slice(&(length as u32).to_ne_bytes());
  buffer.extend_from_slice(string.as_bytes());
  buffer.resize(buffer.len() + additional_length, 0);
}

enum StoredCallee<'a> {
  Expression(&'a Expr),
  Super(&'a Super),
}

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

enum ModuleItemsOrStatements<'a> {
  ModuleItems(&'a Vec<ModuleItem>),
  Statements(&'a Vec<Stmt>),
}
