use swc_common::Span;
use swc_ecma_ast::{
  AssignTarget, AssignTargetPat, CallExpr, Callee, ClassMember, Decl, ExportSpecifier, Expr,
  ExprOrSpread, ForHead, ImportSpecifier, Lit, ModuleDecl, ModuleExportName, ModuleItem,
  NamedExport, ObjectPatProp, OptChainBase, ParenExpr, Pat, Program, PropName, PropOrSpread,
  SimpleAssignTarget, Stmt, VarDeclOrExpr,
};

use crate::ast_nodes::call_expression::StoredCallee;
use crate::ast_nodes::variable_declaration::VariableDeclaration;
use crate::convert_ast::annotations::{AnnotationKind, AnnotationWithType};
use crate::convert_ast::converter::ast_constants::{
  TYPE_CLASS_EXPRESSION, TYPE_FUNCTION_DECLARATION, TYPE_FUNCTION_EXPRESSION,
};
use crate::convert_ast::converter::string_constants::{
  STRING_NOSIDEEFFECTS, STRING_PURE, STRING_SOURCEMAP,
};
use crate::convert_ast::converter::utf16_positions::{
  ConvertedAnnotation, Utf8ToUtf16ByteIndexConverterAndAnnotationHandler,
};

pub(crate) mod analyze_code;
pub mod string_constants;
mod utf16_positions;

pub mod ast_constants;
mod ast_macros;

pub struct AstConverter<'a> {
  pub buffer: Vec<u8>,
  pub code: &'a [u8],
  pub index_converter: Utf8ToUtf16ByteIndexConverterAndAnnotationHandler<'a>,
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
  pub fn add_type_and_start(
    &mut self,
    node_type: &[u8; 4],
    span: &Span,
    reserved_bytes: usize,
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
    // reserved bytes
    self.buffer.resize(end_position + reserved_bytes, 0);
    end_position
  }

  pub(crate) fn add_type_and_explicit_start(
    &mut self,
    node_type: &[u8; 4],
    start: u32,
    reserved_bytes: usize,
  ) -> usize {
    // type
    self.buffer.extend_from_slice(node_type);
    // start
    self
      .buffer
      .extend_from_slice(&self.index_converter.convert(start, false).to_ne_bytes());
    // end
    let end_position = self.buffer.len();
    // reserved bytes
    self.buffer.resize(end_position + reserved_bytes, 0);
    end_position
  }

  pub fn add_end(&mut self, end_position: usize, span: &Span) {
    self.buffer[end_position..end_position + 4].copy_from_slice(
      &self
        .index_converter
        .convert(span.hi.0 - 1, false)
        .to_ne_bytes(),
    );
  }

  pub(crate) fn add_explicit_end(&mut self, end_position: usize, end: u32) {
    self.buffer[end_position..end_position + 4]
      .copy_from_slice(&self.index_converter.convert(end, false).to_ne_bytes());
  }

  pub fn convert_item_list<T, F>(
    &mut self,
    item_list: &[T],
    reference_position: usize,
    convert_item: F,
  ) where
    F: Fn(&mut AstConverter, &T) -> bool,
  {
    // for an empty list, we leave the referenced position at zero
    if item_list.is_empty() {
      return;
    }
    self.update_reference_position(reference_position);
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

  pub fn convert_item_list_with_state<T, S, F>(
    &mut self,
    item_list: &[T],
    state: &mut S,
    reference_position: usize,
    convert_item: F,
  ) where
    F: Fn(&mut AstConverter, &T, &mut S) -> bool,
  {
    // for an empty list, we leave the referenced position at zero
    if item_list.is_empty() {
      return;
    }
    self.update_reference_position(reference_position);
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
  pub(crate) fn convert_string(&mut self, string: &str, reference_position: usize) {
    self.update_reference_position(reference_position);
    convert_string(&mut self.buffer, string);
  }

  pub fn update_reference_position(&mut self, reference_position: usize) {
    let insert_position = (self.buffer.len() as u32) >> 2;
    self.buffer[reference_position..reference_position + 4]
      .copy_from_slice(&insert_position.to_ne_bytes());
  }

  // === shared enums
  pub fn convert_call_expression(
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
        &StoredCallee::Expression(callee_expression),
        &call_expression.args,
        is_chained,
      ),
      Callee::Super(callee_super) => self.store_call_expression(
        &call_expression.span,
        is_optional,
        &StoredCallee::Super(callee_super),
        &call_expression.args,
        is_chained,
      ),
    }
  }

  pub(crate) fn convert_class_member(&mut self, class_member: &ClassMember) {
    match class_member {
      ClassMember::ClassProp(class_property) => self.convert_class_property(class_property),
      ClassMember::Constructor(constructor) => self.convert_constructor(constructor),
      ClassMember::Method(method) => self.convert_method(method),
      ClassMember::PrivateMethod(private_method) => self.convert_private_method(private_method),
      ClassMember::PrivateProp(private_property) => self.convert_private_property(private_property),
      ClassMember::StaticBlock(static_block) => self.store_static_block(static_block),
      ClassMember::TsIndexSignature(_) => {
        unimplemented!("Cannot convert ClassMember::TsIndexSignature")
      }
      ClassMember::AutoAccessor(_) => unimplemented!("Cannot convert ClassMember::AutoAccessor"),
      ClassMember::Empty(_) => {}
    }
  }

  pub(crate) fn convert_declaration(&mut self, declaration: &Decl) {
    match declaration {
      Decl::Var(variable_declaration) => {
        self.store_variable_declaration(&VariableDeclaration::Var(variable_declaration))
      }
      Decl::Fn(function_declaration) => self.convert_function(
        &function_declaration.function,
        &TYPE_FUNCTION_DECLARATION,
        Some(&function_declaration.ident),
      ),
      Decl::Class(class_declaration) => self.store_class_declaration(class_declaration),
      Decl::Using(using_declaration) => {
        self.store_variable_declaration(&VariableDeclaration::Using(using_declaration))
      }
      Decl::TsInterface(_) => unimplemented!("Cannot convert Decl::TsInterface"),
      Decl::TsTypeAlias(_) => unimplemented!("Cannot convert Decl::TsTypeAlias"),
      Decl::TsEnum(_) => unimplemented!("Cannot convert Decl::TsEnum"),
      Decl::TsModule(_) => unimplemented!("Cannot convert Decl::TsModule"),
    }
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
        export_named_declaration.src.as_deref(),
        None,
        &export_named_declaration.with,
      ),
      Some(ExportSpecifier::Default(_)) => panic!("Unexpected default export specifier"),
    }
  }

  pub(crate) fn convert_export_specifier(&mut self, export_specifier: &ExportSpecifier) {
    match export_specifier {
      ExportSpecifier::Named(export_named_specifier) => {
        self.store_export_specifier(export_named_specifier)
      }
      ExportSpecifier::Namespace(_) => unimplemented!("Cannot convert ExportSpecifier::Namespace"),
      ExportSpecifier::Default(_) => unimplemented!("Cannot convert ExportSpecifier::Default"),
    }
  }

  pub fn convert_expression(&mut self, expression: &Expr) {
    match expression {
      Expr::Array(array_literal) => {
        self.store_array_expression(array_literal);
      }
      Expr::Arrow(arrow_expression) => {
        self.store_arrow_function_expression(arrow_expression);
      }
      Expr::Assign(assignment_expression) => {
        self.store_assignment_expression(assignment_expression);
      }
      Expr::Await(await_expression) => {
        self.store_await_expression(await_expression);
      }
      Expr::Bin(binary_expression) => {
        self.store_binary_expression(binary_expression);
      }
      Expr::Call(call_expression) => {
        self.convert_call_expression(call_expression, false, false);
      }
      Expr::Class(class_expression) => {
        self.store_class_expression(class_expression, &TYPE_CLASS_EXPRESSION);
      }
      Expr::Cond(conditional_expression) => {
        self.store_conditional_expression(conditional_expression);
      }
      Expr::Fn(function_expression) => {
        self.convert_function(
          &function_expression.function,
          &TYPE_FUNCTION_EXPRESSION,
          function_expression.ident.as_ref(),
        );
      }
      Expr::Ident(identifier) => {
        self.convert_identifier(identifier);
      }
      Expr::Lit(literal) => {
        self.convert_literal(literal);
      }
      Expr::Member(member_expression) => {
        self.convert_member_expression(member_expression, false, false);
      }
      Expr::MetaProp(meta_property) => {
        self.store_meta_property(meta_property);
      }
      Expr::New(new_expression) => {
        self.store_new_expression(new_expression);
      }
      Expr::Object(object_literal) => {
        self.store_object_expression(object_literal);
      }
      Expr::OptChain(optional_chain_expression) => {
        self.store_chain_expression(optional_chain_expression, false);
      }
      Expr::Paren(parenthesized_expression) => {
        self.convert_parenthesized_expression(parenthesized_expression)
      }
      Expr::PrivateName(private_name) => {
        self.store_private_identifier(private_name);
      }
      Expr::Seq(sequence_expression) => {
        self.store_sequence_expression(sequence_expression);
      }
      Expr::SuperProp(super_property) => {
        self.convert_super_property(super_property);
      }
      Expr::TaggedTpl(tagged_template_expression) => {
        self.store_tagged_template_expression(tagged_template_expression);
      }
      Expr::This(this_expression) => {
        self.store_this_expression(this_expression);
      }
      Expr::Tpl(template_literal) => {
        self.store_template_literal(template_literal);
      }
      Expr::Unary(unary_expression) => {
        self.store_unary_expression(unary_expression);
      }
      Expr::Update(update_expression) => {
        self.store_update_expression(update_expression);
      }
      Expr::Yield(yield_expression) => {
        self.store_yield_expression(yield_expression);
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

  pub fn convert_expression_or_spread(&mut self, expression_or_spread: &ExprOrSpread) {
    match expression_or_spread.spread {
      Some(spread_span) => self.store_spread_element(&spread_span, &expression_or_spread.expr),
      None => {
        self.convert_expression(&expression_or_spread.expr);
      }
    }
  }

  pub(crate) fn convert_for_head(&mut self, for_head: &ForHead) {
    match for_head {
      ForHead::VarDecl(variable_declaration) => {
        self.store_variable_declaration(&VariableDeclaration::Var(variable_declaration))
      }
      ForHead::Pat(pattern) => {
        self.convert_pattern(pattern);
      }
      ForHead::UsingDecl(using_declaration) => {
        self.store_variable_declaration(&VariableDeclaration::Using(using_declaration))
      }
    }
  }

  pub(crate) fn convert_import_specifier(&mut self, import_specifier: &ImportSpecifier) {
    match import_specifier {
      ImportSpecifier::Named(import_named_specifier) => {
        self.store_import_specifier(import_named_specifier)
      }
      ImportSpecifier::Default(import_default_specifier) => {
        self.store_import_default_specifier(import_default_specifier)
      }
      ImportSpecifier::Namespace(import_namespace_specifier) => {
        self.store_import_namespace_specifier(import_namespace_specifier)
      }
    }
  }

  fn convert_literal(&mut self, literal: &Lit) {
    match literal {
      Lit::BigInt(bigint_literal) => self.store_literal_bigint(bigint_literal),
      Lit::Bool(boolean_literal) => {
        self.store_literal_boolean(boolean_literal);
      }
      Lit::Null(null_literal) => {
        self.store_literal_null(null_literal);
      }
      Lit::Num(number_literal) => {
        self.store_literal_number(number_literal);
      }
      Lit::Regex(regex_literal) => {
        self.store_literal_regex(regex_literal);
      }
      Lit::Str(string_literal) => {
        self.store_literal_string(string_literal);
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
      ModuleDecl::Import(import_declaration) => self.store_import_declaration(import_declaration),
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

  pub(crate) fn convert_module_export_name(&mut self, module_export_name: &ModuleExportName) {
    match module_export_name {
      ModuleExportName::Ident(identifier) => self.convert_identifier(identifier),
      ModuleExportName::Str(string_literal) => self.store_literal_string(string_literal),
    }
  }

  pub(crate) fn convert_module_item(&mut self, module_item: &ModuleItem) {
    match module_item {
      ModuleItem::Stmt(statement) => self.convert_statement(statement),
      ModuleItem::ModuleDecl(module_declaration) => {
        self.convert_module_declaration(module_declaration);
      }
    }
  }

  pub(crate) fn convert_object_pattern_property(
    &mut self,
    object_pattern_property: &ObjectPatProp,
  ) {
    match object_pattern_property {
      ObjectPatProp::Assign(assignment_pattern_property) => {
        self.convert_assignment_pattern_property(assignment_pattern_property)
      }
      ObjectPatProp::KeyValue(key_value_pattern_property) => {
        self.convert_key_value_pattern_property(key_value_pattern_property)
      }
      ObjectPatProp::Rest(rest_pattern) => self.store_rest_element(rest_pattern),
    }
  }

  pub(crate) fn convert_optional_chain_base(
    &mut self,
    optional_chain_base: &OptChainBase,
    is_optional: bool,
  ) {
    match optional_chain_base {
      OptChainBase::Member(member_expression) => {
        self.convert_member_expression(member_expression, is_optional, true)
      }
      OptChainBase::Call(optional_call) => {
        self.convert_optional_call(optional_call, is_optional, true)
      }
    }
  }

  fn convert_parenthesized_expression(&mut self, parenthesized_expression: &ParenExpr) {
    // We are doing this for the side effect of keeping annotations for call expressions
    self.index_converter.convert(
      parenthesized_expression.span.lo.0 - 1,
      matches!(
        &*parenthesized_expression.expr,
        Expr::Call(_) | Expr::New(_) | Expr::Paren(_)
      ),
    );
    self.convert_expression(&parenthesized_expression.expr);
  }

  pub fn convert_pattern(&mut self, pattern: &Pat) {
    match pattern {
      Pat::Array(array_pattern) => {
        self.store_array_pattern(array_pattern);
      }
      Pat::Assign(assignment_pattern) => {
        self.convert_assignment_pattern(assignment_pattern);
      }
      Pat::Expr(expression) => self.convert_expression(expression),
      Pat::Ident(binding_identifier) => {
        self.convert_binding_identifier(binding_identifier);
      }
      Pat::Object(object) => {
        self.store_object_pattern(object);
      }
      Pat::Rest(rest_pattern) => {
        self.store_rest_element(rest_pattern);
      }
      Pat::Invalid(_) => unimplemented!("Cannot convert Pat::Invalid"),
    }
  }

  pub fn convert_pattern_or_expression(&mut self, pattern_or_expression: &AssignTarget) {
    match pattern_or_expression {
      AssignTarget::Pat(assignment_target_pattern) => {
        self.convert_assignment_target_pattern(assignment_target_pattern);
      }
      AssignTarget::Simple(simple_assigment_target) => {
        self.convert_simple_assignment_target(simple_assigment_target);
      }
    }
  }

  fn convert_assignment_target_pattern(&mut self, assignment_target_pattern: &AssignTargetPat) {
    match assignment_target_pattern {
      AssignTargetPat::Array(array_pattern) => self.store_array_pattern(array_pattern),
      AssignTargetPat::Object(object_pattern) => self.store_object_pattern(object_pattern),
      AssignTargetPat::Invalid(_) => unimplemented!("Cannot convert AssignTargetPat::Invalid"),
    }
  }

  fn convert_simple_assignment_target(&mut self, simple_assignment_target: &SimpleAssignTarget) {
    match simple_assignment_target {
      SimpleAssignTarget::Ident(binding_identifier) => {
        self.convert_binding_identifier(binding_identifier)
      }
      SimpleAssignTarget::Member(member_expression) => {
        self.convert_member_expression(member_expression, false, false)
      }
      SimpleAssignTarget::SuperProp(super_property) => self.convert_super_property(super_property),
      SimpleAssignTarget::Paren(parenthesized_expression) => {
        self.convert_parenthesized_expression(parenthesized_expression);
      }
      SimpleAssignTarget::OptChain(optional_chain_expression) => {
        self.store_chain_expression(optional_chain_expression, false)
      }
      SimpleAssignTarget::TsAs(_) => unimplemented!("Cannot convert SimpleAssignTarget::TsAs"),
      SimpleAssignTarget::TsSatisfies(_) => {
        unimplemented!("Cannot convert SimpleAssignTarget::TsSatisfies")
      }
      SimpleAssignTarget::TsNonNull(_) => {
        unimplemented!("Cannot convert SimpleAssignTarget::TsNonNull")
      }
      SimpleAssignTarget::TsTypeAssertion(_) => {
        unimplemented!("Cannot convert SimpleAssignTarget::TsTypeAssertion")
      }
      SimpleAssignTarget::TsInstantiation(_) => {
        unimplemented!("Cannot convert SimpleAssignTarget::TsInstantiation")
      }
      SimpleAssignTarget::Invalid(_) => {
        unimplemented!("Cannot convert SimpleAssignTarget::Invalid")
      }
    }
  }

  pub(crate) fn convert_property_name(&mut self, property_name: &PropName) {
    match property_name {
      PropName::Computed(computed_property_name) => {
        self.convert_expression(computed_property_name.expr.as_ref())
      }
      PropName::Ident(ident) => {
        self.convert_identifier(ident);
      }
      PropName::Str(string) => {
        self.store_literal_string(string);
      }
      PropName::Num(number) => {
        self.store_literal_number(number);
      }
      PropName::BigInt(bigint) => {
        self.store_literal_bigint(bigint);
      }
    }
  }

  pub(crate) fn convert_property_or_spread(&mut self, property_or_spread: &PropOrSpread) {
    match property_or_spread {
      PropOrSpread::Prop(property) => self.convert_property(property),
      PropOrSpread::Spread(spread_element) => self.convert_spread_element(spread_element),
    }
  }

  pub fn convert_statement(&mut self, statement: &Stmt) {
    match statement {
      Stmt::Break(break_statement) => self.store_break_statement(break_statement),
      Stmt::Block(block_statement) => self.store_block_statement(block_statement, false),
      Stmt::Continue(continue_statement) => self.store_continue_statement(continue_statement),
      Stmt::Decl(declaration) => self.convert_declaration(declaration),
      Stmt::Debugger(debugger_statement) => self.store_debugger_statement(debugger_statement),
      Stmt::DoWhile(do_while_statement) => self.store_do_while_statement(do_while_statement),
      Stmt::Empty(empty_statement) => self.store_empty_statement(empty_statement),
      Stmt::Expr(expression_statement) => self.store_expression_statement(expression_statement),
      Stmt::For(for_statement) => self.store_for_statement(for_statement),
      Stmt::ForIn(for_in_statement) => self.store_for_in_statement(for_in_statement),
      Stmt::ForOf(for_of_statement) => self.store_for_of_statement(for_of_statement),
      Stmt::If(if_statement) => self.store_if_statement(if_statement),
      Stmt::Labeled(labeled_statement) => self.store_labeled_statement(labeled_statement),
      Stmt::Return(return_statement) => self.store_return_statement(return_statement),
      Stmt::Switch(switch_statement) => self.store_switch_statement(switch_statement),
      Stmt::Throw(throw_statement) => self.store_throw_statement(throw_statement),
      Stmt::Try(try_statement) => self.store_try_statement(try_statement),
      Stmt::While(while_statement) => self.store_while_statement(while_statement),
      Stmt::With(_) => unimplemented!("Cannot convert Stmt::With"),
    }
  }

  pub(crate) fn convert_variable_declaration_or_expression(
    &mut self,
    variable_declaration_or_expression: &VarDeclOrExpr,
  ) {
    match variable_declaration_or_expression {
      VarDeclOrExpr::VarDecl(variable_declaration) => {
        self.store_variable_declaration(&VariableDeclaration::Var(variable_declaration));
      }
      VarDeclOrExpr::Expr(expression) => {
        self.convert_expression(expression);
      }
    }
  }
}

pub fn convert_annotation(buffer: &mut Vec<u8>, annotation: &ConvertedAnnotation) {
  // start
  buffer.extend_from_slice(&annotation.start.to_ne_bytes());
  // end
  buffer.extend_from_slice(&annotation.end.to_ne_bytes());
  // kind
  buffer.extend_from_slice(match annotation.kind {
    AnnotationKind::Pure => &STRING_PURE,
    AnnotationKind::NoSideEffects => &STRING_NOSIDEEFFECTS,
    AnnotationKind::SourceMappingUrl => &STRING_SOURCEMAP,
  });
}

pub fn convert_string(buffer: &mut Vec<u8>, string: &str) {
  let length = string.len();
  let additional_length = ((length + 3) & !3) - length;
  buffer.extend_from_slice(&(length as u32).to_ne_bytes());
  buffer.extend_from_slice(string.as_bytes());
  buffer.resize(buffer.len() + additional_length, 0);
}

pub fn update_reference_position(buffer: &mut Vec<u8>, reference_position: usize) {
  let insert_position = (buffer.len() as u32) >> 2;
  buffer[reference_position..reference_position + 4]
    .copy_from_slice(&insert_position.to_ne_bytes());
}
