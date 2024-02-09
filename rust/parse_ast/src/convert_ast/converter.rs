use swc_atoms::JsWord;
use swc_common::Span;
use swc_ecma_ast::{
  ArrayLit, ArrayPat, ArrowExpr, AssignExpr, AssignOp, AssignPat, AssignPatProp, AssignTarget,
  AssignTargetPat, AwaitExpr, BigInt, BinExpr, BinaryOp, BindingIdent, BlockStmt, BlockStmtOrExpr,
  Bool, BreakStmt, CallExpr, Callee, CatchClause, Class, ClassDecl, ClassExpr, ClassMember,
  ClassMethod, ClassProp, ComputedPropName, CondExpr, Constructor, ContinueStmt, DebuggerStmt,
  Decl, DefaultDecl, DoWhileStmt, EmptyStmt, ExportAll, ExportDecl, ExportDefaultDecl,
  ExportDefaultExpr, ExportNamedSpecifier, ExportSpecifier, Expr, ExprOrSpread, ExprStmt, FnExpr,
  ForHead, ForInStmt, ForOfStmt, ForStmt, Function, GetterProp, Ident, IfStmt, ImportDecl,
  ImportDefaultSpecifier, ImportNamedSpecifier, ImportSpecifier, ImportStarAsSpecifier,
  KeyValuePatProp, KeyValueProp, LabeledStmt, Lit, MemberExpr, MemberProp, MetaPropExpr,
  MetaPropKind, MethodKind, MethodProp, ModuleDecl, ModuleExportName, ModuleItem, NamedExport,
  NewExpr, Null, Number, ObjectLit, ObjectPat, ObjectPatProp, OptCall, OptChainBase, OptChainExpr,
  ParamOrTsParamProp, ParenExpr, Pat, PrivateMethod, PrivateName, PrivateProp, Program, Prop,
  PropName, PropOrSpread, Regex, RestPat, ReturnStmt, SeqExpr, SetterProp, SimpleAssignTarget,
  SpreadElement, StaticBlock, Stmt, Str, Super, SuperProp, SuperPropExpr, SwitchCase, SwitchStmt,
  TaggedTpl, ThisExpr, ThrowStmt, Tpl, TplElement, TryStmt, UnaryExpr, UnaryOp, UpdateExpr,
  UpdateOp, VarDecl, VarDeclKind, VarDeclOrExpr, VarDeclarator, WhileStmt, YieldExpr,
};

use crate::convert_ast::annotations::{AnnotationKind, AnnotationWithType};
use crate::convert_ast::converter::analyze_code::find_first_occurrence_outside_comment;
use crate::convert_ast::converter::ast_constants::*;
use crate::convert_ast::converter::string_constants::*;
use crate::convert_ast::converter::utf16_positions::{
  ConvertedAnnotation, Utf8ToUtf16ByteIndexConverterAndAnnotationHandler,
};

mod analyze_code;
mod string_constants;
mod utf16_positions;

pub mod ast_constants;

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
  fn add_type_and_start(
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

  fn add_type_and_explicit_start(
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
      .extend_from_slice(&(self.index_converter.convert(start, false)).to_ne_bytes());
    // end
    let end_position = self.buffer.len();
    // reserved bytes
    self.buffer.resize(end_position + reserved_bytes, 0);
    end_position
  }

  fn add_end(&mut self, end_position: usize, span: &Span) {
    self.buffer[end_position..end_position + 4]
      .copy_from_slice(&(self.index_converter.convert(span.hi.0 - 1, false)).to_ne_bytes());
  }

  fn add_explicit_end(&mut self, end_position: usize, end: u32) {
    self.buffer[end_position..end_position + 4]
      .copy_from_slice(&(self.index_converter.convert(end, false)).to_ne_bytes());
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

  fn update_reference_position(&mut self, reference_position: usize) {
    let insert_position = (self.buffer.len() as u32) >> 2;
    self.buffer[reference_position..reference_position + 4]
      .copy_from_slice(&insert_position.to_ne_bytes());
  }

  // === enums
  fn convert_assignment_pattern(&mut self, assignment_pattern: &AssignPat) {
    self.store_assignment_pattern_and_get_left_position(
      &assignment_pattern.span,
      PatternOrIdentifier::Pattern(&assignment_pattern.left),
      &assignment_pattern.right,
    );
  }

  fn convert_assignment_pattern_property(&mut self, assignment_pattern_property: &AssignPatProp) {
    self.store_shorthand_property(
      &assignment_pattern_property.span,
      &assignment_pattern_property.key,
      &assignment_pattern_property.value,
    );
  }

  fn convert_binding_identifier(&mut self, binding_identifier: &BindingIdent) {
    self.convert_identifier(&binding_identifier.id);
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

  fn convert_class_declaration(&mut self, class_declaration: &ClassDecl) {
    self.store_class_node(
      &TYPE_CLASS_DECLARATION,
      Some(&class_declaration.ident),
      &class_declaration.class,
    );
  }

  fn convert_class_expression(&mut self, class_expression: &ClassExpr, node_type: &[u8; 4]) {
    self.store_class_node(
      node_type,
      class_expression.ident.as_ref(),
      &class_expression.class,
    );
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

  fn convert_class_property(&mut self, class_property: &ClassProp) {
    self.store_property_definition(
      &class_property.span,
      matches!(&class_property.key, PropName::Computed(_)),
      class_property.is_static,
      PropOrPrivateName::PropName(&class_property.key),
      &class_property.value.as_deref(),
    );
  }

  fn convert_declaration(&mut self, declaration: &Decl) {
    match declaration {
      Decl::Var(variable_declaration) => self.convert_variable_declaration(variable_declaration),
      Decl::Fn(function_declaration) => self.convert_function(
        &function_declaration.function,
        &TYPE_FUNCTION_DECLARATION_INLINED_ANNOTATIONS,
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

  fn convert_export_all(&mut self, export_all: &ExportAll) {
    self.store_export_all_declaration(&export_all.span, &export_all.src, &export_all.with, None);
  }

  fn convert_export_declaration(&mut self, export_declaration: &ExportDecl) {
    self.store_export_named_declaration(
      &export_declaration.span,
      &[],
      None,
      Some(&export_declaration.decl),
      &None,
    );
  }

  fn convert_export_default_declaration(&mut self, export_default_declaration: &ExportDefaultDecl) {
    self.store_export_default_declaration(
      &export_default_declaration.span,
      match &export_default_declaration.decl {
        DefaultDecl::Class(class_expression) => {
          StoredDefaultExportExpression::Class(class_expression)
        }
        DefaultDecl::Fn(function_expression) => {
          StoredDefaultExportExpression::Function(function_expression)
        }
        DefaultDecl::TsInterfaceDecl(_) => {
          unimplemented!("Cannot convert ExportDefaultDeclaration with TsInterfaceDecl")
        }
      },
    );
  }

  fn convert_export_default_expression(&mut self, export_default_expression: &ExportDefaultExpr) {
    self.store_export_default_declaration(
      &export_default_expression.span,
      StoredDefaultExportExpression::Expression(&export_default_expression.expr),
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
        export_named_declaration.src.as_deref(),
        None,
        &export_named_declaration.with,
      ),
      Some(ExportSpecifier::Default(_)) => panic!("Unexpected default export specifier"),
    }
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
          &TYPE_FUNCTION_EXPRESSION_INLINED_ANNOTATIONS,
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
        self.convert_private_name(private_name);
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

  fn convert_expression_or_spread(&mut self, expression_or_spread: &ExprOrSpread) {
    match expression_or_spread.spread {
      Some(spread_span) => self.store_spread_element(&spread_span, &expression_or_spread.expr),
      None => {
        self.convert_expression(&expression_or_spread.expr);
      }
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

  fn convert_function(
    &mut self,
    function: &Function,
    node_type: &[u8; 4],
    identifier: Option<&Ident>,
  ) {
    let parameters: Vec<&Pat> = function.params.iter().map(|param| &param.pat).collect();
    self.store_function_node(
      node_type,
      function.span.lo.0 - 1,
      function.span.hi.0 - 1,
      function.is_async,
      function.is_generator,
      identifier,
      &parameters,
      function.body.as_ref().unwrap(),
      true,
    );
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

  fn convert_identifier(&mut self, identifier: &Ident) {
    self.store_identifier(
      identifier.span.lo.0 - 1,
      identifier.span.hi.0 - 1,
      &identifier.sym,
    );
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

  fn convert_key_value_pattern_property(&mut self, key_value_pattern_property: &KeyValuePatProp) {
    self.store_key_value_property(
      &key_value_pattern_property.key,
      PatternOrExpression::Pattern(&key_value_pattern_property.value),
    );
  }

  fn convert_key_value_property(&mut self, key_value_property: &KeyValueProp) {
    self.store_key_value_property(
      &key_value_property.key,
      PatternOrExpression::Expression(&key_value_property.value),
    );
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

  fn convert_method(&mut self, method: &ClassMethod) {
    self.store_method_definition(
      &method.span,
      &method.kind,
      method.is_static,
      PropOrPrivateName::PropName(&method.key),
      matches!(method.key, PropName::Computed(_)),
      &method.function,
    );
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

  fn convert_module_export_name(&mut self, module_export_name: &ModuleExportName) {
    match module_export_name {
      ModuleExportName::Ident(identifier) => self.convert_identifier(identifier),
      ModuleExportName::Str(string_literal) => self.convert_literal_string(string_literal),
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

  fn convert_optional_chain_base(&mut self, optional_chain_base: &OptChainBase, is_optional: bool) {
    match optional_chain_base {
      OptChainBase::Member(member_expression) => {
        self.convert_member_expression(member_expression, is_optional, true)
      }
      OptChainBase::Call(optional_call) => {
        self.convert_optional_call(optional_call, is_optional, true)
      }
    }
  }

  fn convert_parenthesized_expression(
    &mut self,
    parenthesized_expression: &ParenExpr,
  ) -> (u32, u32) {
    let start = self.index_converter.convert(
      parenthesized_expression.span.lo.0 - 1,
      matches!(
        &*parenthesized_expression.expr,
        Expr::Call(_) | Expr::New(_) | Expr::Paren(_)
      ),
    );
    self.convert_expression(&parenthesized_expression.expr);
    let end = self
      .index_converter
      .convert(parenthesized_expression.span.hi.0 - 1, false);
    (start, end)
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
      Pat::Invalid(_) => unimplemented!("Cannot convert Pat::Invalid"),
    }
  }

  fn convert_pattern_or_expression(&mut self, pattern_or_expression: &AssignTarget) {
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
      AssignTargetPat::Array(array_pattern) => self.convert_array_pattern(array_pattern),
      AssignTargetPat::Object(object_pattern) => self.convert_object_pattern(object_pattern),
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
        self.convert_optional_chain_expression(optional_chain_expression, false)
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

  fn convert_private_property(&mut self, private_property: &PrivateProp) {
    self.store_property_definition(
      &private_property.span,
      false,
      private_property.is_static,
      PropOrPrivateName::PrivateName(&private_property.key),
      &private_property.value.as_deref(),
    );
  }

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
        self.convert_literal_string(string);
        None
      }
      PropName::Num(number) => {
        self.convert_literal_number(number);
        None
      }
      PropName::BigInt(bigint) => {
        self.convert_literal_bigint(bigint);
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

  fn convert_property_or_spread(&mut self, property_or_spread: &PropOrSpread) {
    match property_or_spread {
      PropOrSpread::Prop(property) => self.convert_property(property),
      PropOrSpread::Spread(spread_element) => self.convert_spread_element(spread_element),
    }
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

  fn convert_shorthand_property(&mut self, identifier: &Ident) {
    self.store_shorthand_property(&identifier.span, identifier, &None);
  }

  fn convert_spread_element(&mut self, spread_element: &SpreadElement) {
    self.store_spread_element(&spread_element.dot3_token, &spread_element.expr);
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
      Stmt::Expr(expression_statement) => self.convert_expression_statement(expression_statement),
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

  fn convert_super_property(&mut self, super_property: &SuperPropExpr) {
    self.store_member_expression(
      &super_property.span,
      false,
      &ExpressionOrSuper::Super(&super_property.obj),
      match &super_property.prop {
        SuperProp::Ident(identifier) => MemberOrSuperProp::Identifier(identifier),
        SuperProp::Computed(computed_property_name) => {
          MemberOrSuperProp::Computed(computed_property_name)
        }
      },
      false,
    );
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

  // === nodes
  fn convert_array_literal(&mut self, array_literal: &ArrayLit) {
    let end_position = self.add_type_and_start(
      &TYPE_ARRAY_EXPRESSION_INLINED_ELEMENTS,
      &array_literal.span,
      ARRAY_EXPRESSION_RESERVED_BYTES,
      false,
    );
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

  fn convert_array_pattern(&mut self, array_pattern: &ArrayPat) {
    let end_position = self.add_type_and_start(
      &TYPE_ARRAY_PATTERN_INLINED_ELEMENTS,
      &array_pattern.span,
      ARRAY_PATTERN_RESERVED_BYTES,
      false,
    );
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

  fn convert_arrow_expression(&mut self, arrow_expression: &ArrowExpr) {
    let end_position = self.add_type_and_start(
      &TYPE_ARROW_FUNCTION_EXPRESSION_INLINED_ANNOTATIONS,
      &arrow_expression.span,
      ARROW_FUNCTION_EXPRESSION_RESERVED_BYTES,
      false,
    );
    // annotations
    let annotations = self
      .index_converter
      .take_collected_annotations(AnnotationKind::NoSideEffects);
    self.convert_item_list(&annotations, |ast_converter, annotation| {
      convert_annotation(&mut ast_converter.buffer, annotation);
      true
    });
    // flags
    let mut flags = if arrow_expression.is_async {
      ARROW_FUNCTION_EXPRESSION_ASYNC_FLAG
    } else {
      0u32
    };
    if arrow_expression.is_generator {
      flags |= ARROW_FUNCTION_EXPRESSION_GENERATOR_FLAG;
    }
    if let BlockStmtOrExpr::Expr(_) = &*arrow_expression.body {
      flags |= ARROW_FUNCTION_EXPRESSION_EXPRESSION_FLAG;
    }
    let flags_position = end_position + ARROW_FUNCTION_EXPRESSION_FLAGS_OFFSET;
    self.buffer[flags_position..flags_position + 4].copy_from_slice(&flags.to_ne_bytes());
    // params
    self.update_reference_position(end_position + ARROW_FUNCTION_EXPRESSION_PARAMS_OFFSET);
    self.convert_item_list(&arrow_expression.params, |ast_converter, param| {
      ast_converter.convert_pattern(param);
      true
    });
    // body
    self.update_reference_position(end_position + ARROW_FUNCTION_EXPRESSION_BODY_OFFSET);
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

  fn convert_assignment_expression(&mut self, assignment_expression: &AssignExpr) {
    let end_position = self.add_type_and_start(
      &TYPE_ASSIGNMENT_EXPRESSION_INLINED_LEFT,
      &assignment_expression.span,
      ASSIGNMENT_EXPRESSION_RESERVED_BYTES,
      false,
    );
    // left
    self.convert_pattern_or_expression(&assignment_expression.left);
    // operator
    let operator_position = end_position + ASSIGNMENT_EXPRESSION_OPERATOR_OFFSET;
    self.buffer[operator_position..operator_position + 4].copy_from_slice(
      match assignment_expression.op {
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
      },
    );
    // right
    self.update_reference_position(end_position + ASSIGNMENT_EXPRESSION_RIGHT_OFFSET);
    self.convert_expression(&assignment_expression.right);
    // end
    self.add_end(end_position, &assignment_expression.span);
  }

  fn store_assignment_pattern_and_get_left_position(
    &mut self,
    span: &Span,
    left: PatternOrIdentifier,
    right: &Expr,
  ) -> u32 {
    let end_position = self.add_type_and_start(
      &TYPE_ASSIGNMENT_PATTERN_INLINED_LEFT,
      span,
      ASSIGNMENT_PATTERN_RESERVED_BYTES,
      false,
    );
    // left
    let left_position = (self.buffer.len() >> 2) as u32;
    match left {
      PatternOrIdentifier::Pattern(pattern) => {
        self.convert_pattern(pattern);
      }
      PatternOrIdentifier::Identifier(identifier) => self.convert_identifier(identifier),
    }
    // right
    self.update_reference_position(end_position + ASSIGNMENT_PATTERN_RIGHT_OFFSET);
    self.convert_expression(right);
    // end
    self.add_end(end_position, span);
    left_position
  }

  fn convert_await_expression(&mut self, await_expression: &AwaitExpr) {
    let end_position = self.add_type_and_start(
      &TYPE_AWAIT_EXPRESSION_INLINED_ARGUMENT,
      &await_expression.span,
      AWAIT_EXPRESSION_RESERVED_BYTES,
      false,
    );
    // argument
    self.convert_expression(&await_expression.arg);
    // end
    self.add_end(end_position, &await_expression.span);
  }

  fn convert_binary_expression(&mut self, binary_expression: &BinExpr) {
    let end_position = self.add_type_and_start(
      match binary_expression.op {
        BinaryOp::LogicalOr | BinaryOp::LogicalAnd | BinaryOp::NullishCoalescing => {
          &TYPE_LOGICAL_EXPRESSION_INLINED_LEFT
        }
        _ => &TYPE_BINARY_EXPRESSION_INLINED_LEFT,
      },
      &binary_expression.span,
      BINARY_EXPRESSION_RESERVED_BYTES,
      false,
    );
    // left
    self.convert_expression(&binary_expression.left);
    // operator
    let operator_position = end_position + BINARY_EXPRESSION_OPERATOR_OFFSET;
    self.buffer[operator_position..operator_position + 4].copy_from_slice(
      match binary_expression.op {
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
      },
    );
    // right
    self.update_reference_position(end_position + BINARY_EXPRESSION_RIGHT_OFFSET);
    self.convert_expression(&binary_expression.right);
    // end
    self.add_end(end_position, &binary_expression.span);
  }

  fn convert_block_statement(&mut self, block_statement: &BlockStmt, check_directive: bool) {
    let end_position = self.add_type_and_start(
      &TYPE_BLOCK_STATEMENT_INLINED_BODY,
      &block_statement.span,
      BLOCK_STATEMENT_RESERVED_BYTES,
      false,
    );
    // body
    let mut keep_checking_directives = check_directive;
    self.convert_item_list_with_state(
      &block_statement.stmts,
      &mut keep_checking_directives,
      |ast_converter, statement, can_be_directive| {
        if *can_be_directive {
          if let Stmt::Expr(expression) = statement {
            if let Expr::Lit(Lit::Str(string)) = &*expression.expr {
              ast_converter.convert_directive(expression, &string.value);
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

  fn convert_break_statement(&mut self, break_statement: &BreakStmt) {
    let end_position = self.add_type_and_start(
      &TYPE_BREAK_STATEMENT,
      &break_statement.span,
      BREAK_STATEMENT_RESERVED_BYTES,
      false,
    );
    // label
    if let Some(label) = break_statement.label.as_ref() {
      self.update_reference_position(end_position + BREAK_STATEMENT_LABEL_OFFSET);
      self.convert_identifier(label);
    }
    // end
    self.add_end(end_position, &break_statement.span);
  }

  fn store_call_expression(
    &mut self,
    span: &Span,
    is_optional: bool,
    callee: &StoredCallee,
    arguments: &[ExprOrSpread],
    is_chained: bool,
  ) {
    let end_position = self.add_type_and_start(
      &TYPE_CALL_EXPRESSION_INLINED_ANNOTATIONS,
      span,
      CALL_EXPRESSION_RESERVED_BYTES,
      false,
    );
    // annotations
    let annotations = self
      .index_converter
      .take_collected_annotations(AnnotationKind::Pure);
    self.convert_item_list(&annotations, |ast_converter, annotation| {
      convert_annotation(&mut ast_converter.buffer, annotation);
      true
    });
    // flags
    let flags = if is_optional {
      CALL_EXPRESSION_OPTIONAL_FLAG
    } else {
      0u32
    };
    let flags_position = end_position + CALL_EXPRESSION_FLAGS_OFFSET;
    self.buffer[flags_position..flags_position + 4].copy_from_slice(&flags.to_ne_bytes());
    // callee
    self.update_reference_position(end_position + CALL_EXPRESSION_CALLEE_OFFSET);
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
    self.update_reference_position(end_position + CALL_EXPRESSION_ARGUMENTS_OFFSET);
    self.convert_item_list(arguments, |ast_converter, argument| {
      ast_converter.convert_expression_or_spread(argument);
      true
    });
    // end
    self.add_end(end_position, span);
  }

  fn convert_catch_clause(&mut self, catch_clause: &CatchClause) {
    let end_position = self.add_type_and_start(
      &TYPE_CATCH_CLAUSE,
      &catch_clause.span,
      CATCH_CLAUSE_RESERVED_BYTES,
      false,
    );
    // param
    if let Some(pattern) = catch_clause.param.as_ref() {
      self.update_reference_position(end_position + CATCH_CLAUSE_PARAM_OFFSET);
      self.convert_pattern(pattern);
    }
    // body
    self.update_reference_position(end_position + CATCH_CLAUSE_BODY_OFFSET);
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
      let end_position = self.add_type_and_start(
        &TYPE_CHAIN_EXPRESSION_INLINED_EXPRESSION,
        &optional_chain_expression.span,
        CHAIN_EXPRESSION_RESERVED_BYTES,
        false,
      );
      // expression
      self.convert_optional_chain_base(
        &optional_chain_expression.base,
        optional_chain_expression.optional,
      );
      // end
      self.add_end(end_position, &optional_chain_expression.span);
    }
  }

  fn convert_class_body(&mut self, class_members: &[ClassMember], start: u32, end: u32) {
    let end_position = self.add_type_and_explicit_start(
      &TYPE_CLASS_BODY_INLINED_BODY,
      start,
      CLASS_BODY_RESERVED_BYTES,
    );
    let class_members_filtered: Vec<&ClassMember> = class_members
      .iter()
      .filter(|class_member| !matches!(class_member, ClassMember::Empty(_)))
      .collect();
    // body
    self.convert_item_list(&class_members_filtered, |ast_converter, class_member| {
      ast_converter.convert_class_member(class_member);
      true
    });
    // end
    self.add_explicit_end(end_position, end);
  }

  fn store_class_node(&mut self, node_type: &[u8; 4], identifier: Option<&Ident>, class: &Class) {
    let end_position = self.add_type_and_start(
      node_type,
      &class.span,
      CLASS_DECLARATION_RESERVED_BYTES,
      false,
    );
    let mut body_start_search = class.span.lo.0 - 1;
    // id
    if let Some(identifier) = identifier {
      self.update_reference_position(end_position + CLASS_DECLARATION_ID_OFFSET);
      self.convert_identifier(identifier);
      body_start_search = identifier.span.hi.0 - 1;
    }
    // super_class
    if let Some(super_class) = class.super_class.as_ref() {
      self.update_reference_position(end_position + CLASS_DECLARATION_SUPER_CLASS_OFFSET);
      self.convert_expression(super_class);
      body_start_search = self.get_expression_span(super_class).hi.0 - 1;
    }
    // body
    self.update_reference_position(end_position + CLASS_DECLARATION_BODY_OFFSET);
    let class_body_start =
      find_first_occurrence_outside_comment(self.code, b'{', body_start_search);
    self.convert_class_body(&class.body, class_body_start, class.span.hi.0 - 1);
    // end
    self.add_end(end_position, &class.span);
  }

  fn convert_conditional_expression(&mut self, conditional_expression: &CondExpr) {
    let end_position = self.add_type_and_start(
      &TYPE_CONDITIONAL_EXPRESSION_INLINED_TEST,
      &conditional_expression.span,
      CONDITIONAL_EXPRESSION_RESERVED_BYTES,
      false,
    );
    // test
    self.convert_expression(&conditional_expression.test);
    // consequent
    self.update_reference_position(end_position + CONDITIONAL_EXPRESSION_CONSEQUENT_OFFSET);
    self.convert_expression(&conditional_expression.cons);
    // alternate
    self.update_reference_position(end_position + CONDITIONAL_EXPRESSION_ALTERNATE_OFFSET);
    self.convert_expression(&conditional_expression.alt);
    // end
    self.add_end(end_position, &conditional_expression.span);
  }

  fn convert_continue_statement(&mut self, continue_statement: &ContinueStmt) {
    let end_position = self.add_type_and_start(
      &TYPE_CONTINUE_STATEMENT,
      &continue_statement.span,
      CONTINUE_STATEMENT_RESERVED_BYTES,
      false,
    );
    // label
    if let Some(label) = continue_statement.label.as_ref() {
      self.update_reference_position(end_position + CONTINUE_STATEMENT_LABEL_OFFSET);
      self.convert_identifier(label);
    }
    // end
    self.add_end(end_position, &continue_statement.span);
  }

  fn convert_debugger_statement(&mut self, debugger_statement: &DebuggerStmt) {
    let end_position = self.add_type_and_start(
      &TYPE_DEBUGGER_STATEMENT,
      &debugger_statement.span,
      DEBUGGER_STATEMENT_RESERVED_BYTES,
      false,
    );
    self.add_end(end_position, &debugger_statement.span);
  }

  fn convert_directive(&mut self, expression_statement: &ExprStmt, directive: &JsWord) {
    let end_position = self.add_type_and_start(
      &TYPE_DIRECTIVE_INLINED_DIRECTIVE,
      &expression_statement.span,
      DIRECTIVE_RESERVED_BYTES,
      false,
    );
    // directive
    self.convert_string(directive);
    // expression
    self.update_reference_position(end_position + DIRECTIVE_EXPRESSION_OFFSET);
    self.convert_expression(&expression_statement.expr);
    // end
    self.add_end(end_position, &expression_statement.span);
  }

  fn convert_do_while_statement(&mut self, do_while_statement: &DoWhileStmt) {
    let end_position = self.add_type_and_start(
      &TYPE_DO_WHILE_STATEMENT_INLINED_BODY,
      &do_while_statement.span,
      DO_WHILE_STATEMENT_RESERVED_BYTES,
      false,
    );
    // body
    self.convert_statement(&do_while_statement.body);
    // test
    self.update_reference_position(end_position + DO_WHILE_STATEMENT_TEST_OFFSET);
    self.convert_expression(&do_while_statement.test);
    // end
    self.add_end(end_position, &do_while_statement.span);
  }

  fn convert_empty_statement(&mut self, empty_statement: &EmptyStmt) {
    let end_position = self.add_type_and_start(
      &TYPE_EMPTY_STATEMENT,
      &empty_statement.span,
      EMPTY_STATEMENT_RESERVED_BYTES,
      false,
    );
    self.add_end(end_position, &empty_statement.span)
  }

  fn store_export_all_declaration(
    &mut self,
    span: &Span,
    source: &Str,
    attributes: &Option<Box<ObjectLit>>,
    exported: Option<&ModuleExportName>,
  ) {
    let end_position = self.add_type_and_start(
      &TYPE_EXPORT_ALL_DECLARATION,
      span,
      EXPORT_ALL_DECLARATION_RESERVED_BYTES,
      false,
    );
    // exported
    if let Some(exported) = exported {
      self.update_reference_position(end_position + EXPORT_ALL_DECLARATION_EXPORTED_OFFSET);
      self.convert_module_export_name(exported);
    }
    // source
    self.update_reference_position(end_position + EXPORT_ALL_DECLARATION_SOURCE_OFFSET);
    self.convert_literal_string(source);
    // attributes
    self.update_reference_position(end_position + EXPORT_ALL_DECLARATION_ATTRIBUTES_OFFSET);
    self.store_import_attributes(attributes);
    // end
    self.add_end(end_position, span);
  }

  fn store_export_default_declaration(
    &mut self,
    span: &Span,
    expression: StoredDefaultExportExpression,
  ) {
    let end_position = self.add_type_and_start(
      &TYPE_EXPORT_DEFAULT_DECLARATION_INLINED_DECLARATION,
      span,
      EXPORT_DEFAULT_DECLARATION_RESERVED_BYTES,
      matches!(
        expression,
        StoredDefaultExportExpression::Expression(Expr::Fn(_) | Expr::Arrow(_))
          | StoredDefaultExportExpression::Function(_)
      ),
    );
    // declaration
    match expression {
      StoredDefaultExportExpression::Expression(expression) => {
        self.convert_expression(expression);
      }
      StoredDefaultExportExpression::Class(class_expression) => {
        self.convert_class_expression(class_expression, &TYPE_CLASS_DECLARATION)
      }
      StoredDefaultExportExpression::Function(function_expression) => self.convert_function(
        &function_expression.function,
        &TYPE_FUNCTION_DECLARATION_INLINED_ANNOTATIONS,
        function_expression.ident.as_ref(),
      ),
    }
    // end
    self.add_end(end_position, span);
  }

  fn store_export_named_declaration(
    &mut self,
    span: &Span,
    specifiers: &[ExportSpecifier],
    src: Option<&Str>,
    declaration: Option<&Decl>,
    with: &Option<Box<ObjectLit>>,
  ) {
    let end_position = self.add_type_and_start(
      &TYPE_EXPORT_NAMED_DECLARATION_INLINED_SPECIFIERS,
      span,
      EXPORT_NAMED_DECLARATION_RESERVED_BYTES,
      match declaration {
        Some(Decl::Fn(_)) => true,
        Some(Decl::Var(variable_declaration)) => variable_declaration.kind == VarDeclKind::Const,
        _ => false,
      },
    );
    // specifiers
    self.convert_item_list(specifiers, |ast_converter, specifier| {
      ast_converter.convert_export_specifier(specifier);
      true
    });
    // declaration
    if let Some(declaration) = declaration {
      self.update_reference_position(end_position + EXPORT_NAMED_DECLARATION_DECLARATION_OFFSET);
      self.convert_declaration(declaration);
    }
    // source
    if let Some(src) = src {
      self.update_reference_position(end_position + EXPORT_NAMED_DECLARATION_SOURCE_OFFSET);
      self.convert_literal_string(src);
    }
    // attributes
    self.update_reference_position(end_position + EXPORT_NAMED_DECLARATION_ATTRIBUTES_OFFSET);
    self.store_import_attributes(with);
    // end
    self.add_end(end_position, span);
  }

  fn convert_export_named_specifier(&mut self, export_named_specifier: &ExportNamedSpecifier) {
    let end_position = self.add_type_and_start(
      &TYPE_EXPORT_SPECIFIER_INLINED_LOCAL,
      &export_named_specifier.span,
      EXPORT_SPECIFIER_RESERVED_BYTES,
      false,
    );
    // local
    self.convert_module_export_name(&export_named_specifier.orig);
    // exported
    if let Some(exported) = export_named_specifier.exported.as_ref() {
      self.update_reference_position(end_position + EXPORT_SPECIFIER_EXPORTED_OFFSET);
      self.convert_module_export_name(exported);
    }
    // end
    self.add_end(end_position, &export_named_specifier.span);
  }

  fn convert_expression_statement(&mut self, expression_statement: &ExprStmt) {
    let end_position = self.add_type_and_start(
      &TYPE_EXPRESSION_STATEMENT_INLINED_EXPRESSION,
      &expression_statement.span,
      EXPRESSION_STATEMENT_RESERVED_BYTES,
      false,
    );
    // expression
    self.convert_expression(&expression_statement.expr);
    // end
    self.add_end(end_position, &expression_statement.span);
  }

  fn convert_for_in_statement(&mut self, for_in_statement: &ForInStmt) {
    let end_position = self.add_type_and_start(
      &TYPE_FOR_IN_STATEMENT_INLINED_LEFT,
      &for_in_statement.span,
      FOR_IN_STATEMENT_RESERVED_BYTES,
      false,
    );
    // left
    self.convert_for_head(&for_in_statement.left);
    // right
    self.update_reference_position(end_position + FOR_IN_STATEMENT_RIGHT_OFFSET);
    self.convert_expression(&for_in_statement.right);
    // body
    self.update_reference_position(end_position + FOR_IN_STATEMENT_BODY_OFFSET);
    self.convert_statement(&for_in_statement.body);
    // end
    self.add_end(end_position, &for_in_statement.span);
  }

  fn convert_for_of_statement(&mut self, for_of_statement: &ForOfStmt) {
    let end_position = self.add_type_and_start(
      &TYPE_FOR_OF_STATEMENT_INLINED_LEFT,
      &for_of_statement.span,
      FOR_OF_STATEMENT_RESERVED_BYTES,
      false,
    );
    // flags
    let flags = if for_of_statement.is_await {
      FOR_OF_STATEMENT_AWAIT_FLAG
    } else {
      0u32
    };
    let flags_position = end_position + FOR_OF_STATEMENT_FLAGS_OFFSET;
    self.buffer[flags_position..flags_position + 4].copy_from_slice(&flags.to_ne_bytes());
    // left
    self.convert_for_head(&for_of_statement.left);
    // right
    self.update_reference_position(end_position + FOR_OF_STATEMENT_RIGHT_OFFSET);
    self.convert_expression(&for_of_statement.right);
    // body
    self.update_reference_position(end_position + FOR_OF_STATEMENT_BODY_OFFSET);
    self.convert_statement(&for_of_statement.body);
    // end
    self.add_end(end_position, &for_of_statement.span);
  }

  fn convert_for_statement(&mut self, for_statement: &ForStmt) {
    let end_position = self.add_type_and_start(
      &TYPE_FOR_STATEMENT,
      &for_statement.span,
      FOR_STATEMENT_RESERVED_BYTES,
      false,
    );
    // init
    if let Some(init) = for_statement.init.as_ref() {
      self.update_reference_position(end_position + FOR_STATEMENT_INIT_OFFSET);
      self.convert_variable_declaration_or_expression(init);
    }
    // test
    if let Some(test) = for_statement.test.as_ref() {
      self.update_reference_position(end_position + FOR_STATEMENT_TEST_OFFSET);
      self.convert_expression(test);
    }
    // update
    if let Some(update) = for_statement.update.as_ref() {
      self.update_reference_position(end_position + FOR_STATEMENT_UPDATE_OFFSET);
      self.convert_expression(update);
    }
    // body
    self.update_reference_position(end_position + FOR_STATEMENT_BODY_OFFSET);
    self.convert_statement(&for_statement.body);
    // end
    self.add_end(end_position, &for_statement.span);
  }

  #[allow(clippy::too_many_arguments)]
  fn store_function_node(
    &mut self,
    node_type: &[u8; 4],
    start: u32,
    end: u32,
    is_async: bool,
    is_generator: bool,
    identifier: Option<&Ident>,
    parameters: &[&Pat],
    body: &BlockStmt,
    observe_annotations: bool,
  ) {
    let end_position =
      self.add_type_and_explicit_start(node_type, start, FUNCTION_DECLARATION_RESERVED_BYTES);
    // flags
    let mut flags = if is_async {
      FUNCTION_DECLARATION_ASYNC_FLAG
    } else {
      0u32
    };
    if is_generator {
      flags |= FUNCTION_DECLARATION_GENERATOR_FLAG;
    }
    let flags_position = end_position + FUNCTION_DECLARATION_FLAGS_OFFSET;
    self.buffer[flags_position..flags_position + 4].copy_from_slice(&flags.to_ne_bytes());
    // annotations
    if observe_annotations {
      let annotations = self
        .index_converter
        .take_collected_annotations(AnnotationKind::NoSideEffects);
      self.convert_item_list(&annotations, |ast_converter, annotation| {
        convert_annotation(&mut ast_converter.buffer, annotation);
        true
      });
    } else {
      self.buffer.extend_from_slice(&0u32.to_ne_bytes());
    }
    // id
    if let Some(ident) = identifier {
      self.update_reference_position(end_position + FUNCTION_DECLARATION_ID_OFFSET);
      self.convert_identifier(ident);
    }
    // params
    self.update_reference_position(end_position + FUNCTION_DECLARATION_PARAMS_OFFSET);
    self.convert_item_list(parameters, |ast_converter, param| {
      ast_converter.convert_pattern(param);
      true
    });
    // body
    self.update_reference_position(end_position + FUNCTION_DECLARATION_BODY_OFFSET);
    self.convert_block_statement(body, true);
    // end
    self.add_explicit_end(end_position, end);
  }

  fn store_identifier(&mut self, start: u32, end: u32, name: &str) {
    let end_position = self.add_type_and_explicit_start(
      &TYPE_IDENTIFIER_INLINED_NAME,
      start,
      IDENTIFIER_RESERVED_BYTES,
    );
    // name
    self.convert_string(name);
    // end
    self.add_explicit_end(end_position, end);
  }

  fn convert_if_statement(&mut self, if_statement: &IfStmt) {
    let end_position = self.add_type_and_start(
      &TYPE_IF_STATEMENT_INLINED_TEST,
      &if_statement.span,
      IF_STATEMENT_RESERVED_BYTES,
      false,
    );
    // test
    self.convert_expression(&if_statement.test);
    // consequent
    self.update_reference_position(end_position + IF_STATEMENT_CONSEQUENT_OFFSET);
    self.convert_statement(&if_statement.cons);
    // alternate
    if let Some(alt) = if_statement.alt.as_ref() {
      self.update_reference_position(end_position + IF_STATEMENT_ALTERNATE_OFFSET);
      self.convert_statement(alt);
    }
    // end
    self.add_end(end_position, &if_statement.span);
  }

  fn convert_import_attribute(&mut self, key_value_property: &KeyValueProp) {
    // type
    self
      .buffer
      .extend_from_slice(&TYPE_IMPORT_ATTRIBUTE_INLINED_KEY);
    let start_position = self.buffer.len();
    let end_position = start_position + 4;
    // reserved bytes
    self
      .buffer
      .resize(end_position + IMPORT_ATTRIBUTE_RESERVED_BYTES, 0);
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
    self.buffer[start_position..start_position + 4].copy_from_slice(&start_bytes);
    // value
    self.update_reference_position(end_position + IMPORT_ATTRIBUTE_VALUE_OFFSET);
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
    self.buffer[end_position..end_position + 4].copy_from_slice(&end_bytes);
  }

  fn convert_import_declaration(&mut self, import_declaration: &ImportDecl) {
    let end_position = self.add_type_and_start(
      &TYPE_IMPORT_DECLARATION_INLINED_SPECIFIERS,
      &import_declaration.span,
      IMPORT_DECLARATION_RESERVED_BYTES,
      false,
    );
    // specifiers
    self.convert_item_list(
      &import_declaration.specifiers,
      |ast_converter, import_specifier| {
        ast_converter.convert_import_specifier(import_specifier);
        true
      },
    );
    // source
    self.update_reference_position(end_position + IMPORT_DECLARATION_SOURCE_OFFSET);
    self.convert_literal_string(&import_declaration.src);
    // attributes
    self.update_reference_position(end_position + IMPORT_DECLARATION_ATTRIBUTES_OFFSET);
    self.store_import_attributes(&import_declaration.with);
    // end
    self.add_end(end_position, &import_declaration.span);
  }

  fn convert_import_default_specifier(
    &mut self,
    import_default_specifier: &ImportDefaultSpecifier,
  ) {
    let end_position = self.add_type_and_start(
      &TYPE_IMPORT_DEFAULT_SPECIFIER_INLINED_LOCAL,
      &import_default_specifier.span,
      IMPORT_DEFAULT_SPECIFIER_RESERVED_BYTES,
      false,
    );
    // local
    self.convert_identifier(&import_default_specifier.local);
    // end
    self.add_end(end_position, &import_default_specifier.span);
  }

  fn store_import_expression(&mut self, span: &Span, arguments: &[ExprOrSpread]) {
    let end_position = self.add_type_and_start(
      &TYPE_IMPORT_EXPRESSION_INLINED_SOURCE,
      span,
      IMPORT_EXPRESSION_RESERVED_BYTES,
      false,
    );
    // source
    self.convert_expression(&arguments.first().unwrap().expr);
    // options
    if let Some(argument) = arguments.get(1) {
      self.update_reference_position(end_position + IMPORT_EXPRESSION_OPTIONS_OFFSET);
      self.convert_expression_or_spread(argument);
    }
    // end
    self.add_end(end_position, span);
  }

  fn convert_import_namespace_specifier(
    &mut self,
    import_namespace_specifier: &ImportStarAsSpecifier,
  ) {
    let end_position = self.add_type_and_start(
      &TYPE_IMPORT_NAMESPACE_SPECIFIER_INLINED_LOCAL,
      &import_namespace_specifier.span,
      IMPORT_NAMESPACE_SPECIFIER_RESERVED_BYTES,
      false,
    );
    // local
    self.convert_identifier(&import_namespace_specifier.local);
    // end
    self.add_end(end_position, &import_namespace_specifier.span);
  }

  fn convert_import_named_specifier(&mut self, import_named_specifier: &ImportNamedSpecifier) {
    let end_position = self.add_type_and_start(
      &TYPE_IMPORT_SPECIFIER,
      &import_named_specifier.span,
      IMPORT_SPECIFIER_RESERVED_BYTES,
      false,
    );
    // imported
    if let Some(imported) = import_named_specifier.imported.as_ref() {
      self.update_reference_position(end_position + IMPORT_SPECIFIER_IMPORTED_OFFSET);
      self.convert_module_export_name(imported);
    }
    // local
    self.update_reference_position(end_position + IMPORT_SPECIFIER_LOCAL_OFFSET);
    self.convert_identifier(&import_named_specifier.local);
    // end
    self.add_end(end_position, &import_named_specifier.span);
  }

  fn convert_labeled_statement(&mut self, labeled_statement: &LabeledStmt) {
    let end_position = self.add_type_and_start(
      &TYPE_LABELED_STATEMENT_INLINED_LABEL,
      &labeled_statement.span,
      LABELED_STATEMENT_RESERVED_BYTES,
      false,
    );
    // label
    self.convert_identifier(&labeled_statement.label);
    // body
    self.update_reference_position(end_position + LABELED_STATEMENT_BODY_OFFSET);
    self.convert_statement(&labeled_statement.body);
    // end
    self.add_end(end_position, &labeled_statement.span);
  }

  fn convert_literal_bigint(&mut self, bigint: &BigInt) {
    let end_position = self.add_type_and_start(
      &TYPE_LITERAL_BIG_INT_INLINED_BIGINT,
      &bigint.span,
      LITERAL_BIG_INT_RESERVED_BYTES,
      false,
    );
    // bigint
    self.convert_string(&bigint.value.to_str_radix(10));
    // raw
    self.update_reference_position(end_position + LITERAL_BIG_INT_RAW_OFFSET);
    self.convert_string(bigint.raw.as_ref().unwrap());
    // end
    self.add_end(end_position, &bigint.span);
  }

  fn convert_literal_boolean(&mut self, literal: &Bool) {
    let end_position = self.add_type_and_start(
      &TYPE_LITERAL_BOOLEAN,
      &literal.span,
      LITERAL_BOOLEAN_RESERVED_BYTES,
      false,
    );
    let flags = if literal.value {
      LITERAL_BOOLEAN_VALUE_FLAG
    } else {
      0u32
    };
    let flags_position = end_position + LITERAL_BOOLEAN_FLAGS_OFFSET;
    self.buffer[flags_position..flags_position + 4].copy_from_slice(&flags.to_ne_bytes());
    self.add_end(end_position, &literal.span);
  }

  fn convert_literal_null(&mut self, literal: &Null) {
    let end_position = self.add_type_and_start(
      &TYPE_LITERAL_NULL,
      &literal.span,
      LITERAL_NULL_RESERVED_BYTES,
      false,
    );
    self.add_end(end_position, &literal.span);
  }

  fn convert_literal_number(&mut self, literal: &Number) {
    let end_position = self.add_type_and_start(
      &TYPE_LITERAL_NUMBER,
      &literal.span,
      LITERAL_NUMBER_RESERVED_BYTES,
      false,
    );
    // value, needs to be little endian as we are reading via a DataView
    let value_position = end_position + LITERAL_NUMBER_VALUE_OFFSET;
    self.buffer[value_position..value_position + 8].copy_from_slice(&literal.value.to_le_bytes());
    // raw
    if let Some(raw) = literal.raw.as_ref() {
      self.update_reference_position(end_position + LITERAL_NUMBER_RAW_OFFSET);
      self.convert_string(raw);
    }
    // end
    self.add_end(end_position, &literal.span);
  }

  fn convert_literal_regex(&mut self, regex: &Regex) {
    let end_position = self.add_type_and_start(
      &TYPE_LITERAL_REG_EXP_INLINED_FLAGS,
      &regex.span,
      LITERAL_REG_EXP_RESERVED_BYTES,
      false,
    );
    // flags
    self.convert_string(&regex.flags);
    // pattern
    self.update_reference_position(end_position + LITERAL_REG_EXP_PATTERN_OFFSET);
    self.convert_string(&regex.exp);
    // end
    self.add_end(end_position, &regex.span);
  }

  fn convert_literal_string(&mut self, literal: &Str) {
    let end_position = self.add_type_and_start(
      &TYPE_LITERAL_STRING_INLINED_VALUE,
      &literal.span,
      LITERAL_STRING_RESERVED_BYTES,
      false,
    );
    // value
    self.convert_string(&literal.value);
    // raw
    if let Some(raw) = literal.raw.as_ref() {
      self.update_reference_position(end_position + LITERAL_STRING_RAW_OFFSET);
      self.convert_string(raw);
    }
    // end
    self.add_end(end_position, &literal.span);
  }

  fn store_member_expression(
    &mut self,
    span: &Span,
    is_optional: bool,
    object: &ExpressionOrSuper,
    property: MemberOrSuperProp,
    is_chained: bool,
  ) {
    let end_position = self.add_type_and_start(
      &TYPE_MEMBER_EXPRESSION_INLINED_OBJECT,
      span,
      MEMBER_EXPRESSION_RESERVED_BYTES,
      false,
    );
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
      ExpressionOrSuper::Super(super_token) => self.convert_super(super_token),
    }
    // flags
    let mut flags = 0u32;
    if is_optional {
      flags |= MEMBER_EXPRESSION_OPTIONAL_FLAG;
    }
    if matches!(property, MemberOrSuperProp::Computed(_)) {
      flags |= MEMBER_EXPRESSION_COMPUTED_FLAG;
    }
    let flags_position = end_position + MEMBER_EXPRESSION_FLAGS_OFFSET;
    self.buffer[flags_position..flags_position + 4].copy_from_slice(&flags.to_ne_bytes());
    // property
    self.update_reference_position(end_position + MEMBER_EXPRESSION_PROPERTY_OFFSET);
    match property {
      MemberOrSuperProp::Identifier(ident) => self.convert_identifier(ident),
      MemberOrSuperProp::Computed(computed) => {
        self.convert_expression(&computed.expr);
      }
      MemberOrSuperProp::PrivateName(private_name) => self.convert_private_name(private_name),
    }
    // end
    self.add_end(end_position, span);
  }

  fn convert_meta_property(&mut self, meta_property_expression: &MetaPropExpr) {
    let end_position = self.add_type_and_start(
      &TYPE_META_PROPERTY_INLINED_META,
      &meta_property_expression.span,
      META_PROPERTY_RESERVED_BYTES,
      false,
    );
    match meta_property_expression.kind {
      MetaPropKind::ImportMeta => {
        // meta
        self.store_identifier(
          meta_property_expression.span.lo.0 - 1,
          meta_property_expression.span.lo.0 + 5,
          "import",
        );
        // property
        self.update_reference_position(end_position + META_PROPERTY_PROPERTY_OFFSET);
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
        self.update_reference_position(end_position + META_PROPERTY_PROPERTY_OFFSET);
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

  // TODO SWC can this become a store_method_definition?
  fn convert_constructor(&mut self, constructor: &Constructor) {
    let end_position = self.add_type_and_start(
      &TYPE_METHOD_DEFINITION_INLINED_KEY,
      &constructor.span,
      METHOD_DEFINITION_RESERVED_BYTES,
      false,
    );
    // key
    self.convert_property_name(&constructor.key);
    // flags, method definitions are neither static nor computed
    let flags_position = end_position + METHOD_DEFINITION_FLAGS_OFFSET;
    self.buffer[flags_position..flags_position + 4].copy_from_slice(&0u32.to_ne_bytes());
    // kind
    let kind_position = end_position + METHOD_DEFINITION_KIND_OFFSET;
    self.buffer[kind_position..kind_position + 4].copy_from_slice(&STRING_CONSTRUCTOR);
    // value
    match &constructor.body {
      Some(block_statement) => {
        self.update_reference_position(end_position + METHOD_DEFINITION_VALUE_OFFSET);
        let key_end = self.get_property_name_span(&constructor.key).hi.0 - 1;
        let function_start = find_first_occurrence_outside_comment(self.code, b'(', key_end);
        let parameters: Vec<&Pat> = constructor
          .params
          .iter()
          .map(|param| match param {
            ParamOrTsParamProp::Param(param) => &param.pat,
            ParamOrTsParamProp::TsParamProp(_) => panic!("TsParamProp in constructor"),
          })
          .collect();
        self.store_function_node(
          &TYPE_FUNCTION_EXPRESSION_INLINED_ANNOTATIONS,
          function_start,
          block_statement.span.hi.0 - 1,
          false,
          false,
          None,
          &parameters,
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

  fn store_method_definition(
    &mut self,
    span: &Span,
    kind: &MethodKind,
    is_static: bool,
    key: PropOrPrivateName,
    is_computed: bool,
    function: &Function,
  ) {
    let end_position = self.add_type_and_start(
      &TYPE_METHOD_DEFINITION_INLINED_KEY,
      span,
      METHOD_DEFINITION_RESERVED_BYTES,
      false,
    );
    // key
    let key_end = match key {
      PropOrPrivateName::PropName(prop_name) => {
        self.convert_property_name(prop_name);
        self.get_property_name_span(prop_name).hi.0 - 1
      }
      PropOrPrivateName::PrivateName(private_name) => {
        self.convert_private_name(private_name);
        private_name.id.span.hi.0 - 1
      }
    };
    let function_start = find_first_occurrence_outside_comment(self.code, b'(', key_end);
    // flags
    let mut flags = if is_static {
      METHOD_DEFINITION_STATIC_FLAG
    } else {
      0u32
    };
    if is_computed {
      flags |= METHOD_DEFINITION_COMPUTED_FLAG;
    }
    let flags_position = end_position + METHOD_DEFINITION_FLAGS_OFFSET;
    self.buffer[flags_position..flags_position + 4].copy_from_slice(&flags.to_ne_bytes());
    // kind
    let kind_position = end_position + METHOD_DEFINITION_KIND_OFFSET;
    self.buffer[kind_position..kind_position + 4].copy_from_slice(match kind {
      MethodKind::Method => &STRING_METHOD,
      MethodKind::Getter => &STRING_GET,
      MethodKind::Setter => &STRING_SET,
    });
    // value
    self.update_reference_position(end_position + METHOD_DEFINITION_VALUE_OFFSET);
    let parameters: Vec<&Pat> = function.params.iter().map(|param| &param.pat).collect();
    self.store_function_node(
      &TYPE_FUNCTION_EXPRESSION_INLINED_ANNOTATIONS,
      function_start,
      function.span.hi.0 - 1,
      function.is_async,
      function.is_generator,
      None,
      &parameters,
      function.body.as_ref().unwrap(),
      false,
    );
    // end
    self.add_end(end_position, span);
  }

  fn convert_new_expression(&mut self, new_expression: &NewExpr) {
    let end_position = self.add_type_and_start(
      &TYPE_NEW_EXPRESSION_INLINED_ANNOTATIONS,
      &new_expression.span,
      NEW_EXPRESSION_RESERVED_BYTES,
      false,
    );
    let annotations = self
      .index_converter
      .take_collected_annotations(AnnotationKind::Pure);
    // annotations
    self.convert_item_list(&annotations, |ast_converter, annotation| {
      convert_annotation(&mut ast_converter.buffer, annotation);
      true
    });
    // callee
    self.update_reference_position(end_position + NEW_EXPRESSION_CALLEE_OFFSET);
    self.convert_expression(&new_expression.callee);
    // arguments
    self.update_reference_position(end_position + NEW_EXPRESSION_ARGUMENTS_OFFSET);
    self.convert_item_list(
      match &new_expression.args {
        Some(arguments) => arguments,
        None => &[],
      },
      |ast_converter, expression_or_spread| {
        ast_converter.convert_expression_or_spread(expression_or_spread);
        true
      },
    );
    // end
    self.add_end(end_position, &new_expression.span);
  }

  fn convert_object_literal(&mut self, object_literal: &ObjectLit) {
    let end_position = self.add_type_and_start(
      &TYPE_OBJECT_EXPRESSION_INLINED_PROPERTIES,
      &object_literal.span,
      OBJECT_EXPRESSION_RESERVED_BYTES,
      false,
    );
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

  fn convert_object_pattern(&mut self, object_pattern: &ObjectPat) {
    let end_position = self.add_type_and_start(
      &TYPE_OBJECT_PATTERN_INLINED_PROPERTIES,
      &object_pattern.span,
      OBJECT_PATTERN_RESERVED_BYTES,
      false,
    );
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

  fn convert_private_name(&mut self, private_name: &PrivateName) {
    let end_position = self.add_type_and_start(
      &TYPE_PRIVATE_IDENTIFIER_INLINED_NAME,
      &private_name.span,
      PRIVATE_IDENTIFIER_RESERVED_BYTES,
      false,
    );
    // id
    self.convert_string(&private_name.id.sym);
    // end
    self.add_end(end_position, &private_name.span);
  }

  fn store_program(&mut self, body: ModuleItemsOrStatements) {
    let end_position =
      self.add_type_and_explicit_start(&TYPE_PROGRAM_INLINED_BODY, 0u32, PROGRAM_RESERVED_BYTES);
    // body
    let mut keep_checking_directives = true;
    match body {
      ModuleItemsOrStatements::ModuleItems(module_items) => {
        self.convert_item_list_with_state(
          module_items,
          &mut keep_checking_directives,
          |ast_converter, module_item, can_be_directive| {
            if *can_be_directive {
              if let ModuleItem::Stmt(Stmt::Expr(expression)) = module_item {
                if let Expr::Lit(Lit::Str(string)) = &*expression.expr {
                  ast_converter.convert_directive(expression, &string.value);
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
              if let Stmt::Expr(expression) = statement {
                if let Expr::Lit(Lit::Str(string)) = &*expression.expr {
                  ast_converter.convert_directive(expression, &string.value);
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
    // annotations, these need to come after end so that trailing comments are
    // included
    self.update_reference_position(end_position + PROGRAM_ANNOTATIONS_OFFSET);
    self.index_converter.invalidate_collected_annotations();
    let invalid_annotations = self.index_converter.take_invalid_annotations();
    self.convert_item_list(&invalid_annotations, |ast_converter, annotation| {
      convert_annotation(&mut ast_converter.buffer, annotation);
      true
    });
  }

  // TODO SWC property has many different formats that should be merged if possible
  fn store_key_value_property(&mut self, property_name: &PropName, value: PatternOrExpression) {
    let end_position = self.add_type_and_explicit_start(
      &TYPE_PROPERTY,
      self.get_property_name_span(property_name).lo.0 - 1,
      PROPERTY_RESERVED_BYTES,
    );
    // key
    self.update_reference_position(end_position + PROPERTY_KEY_OFFSET);
    self.convert_property_name(property_name);
    // flags, method and shorthand are always false
    let flags = if matches!(property_name, PropName::Computed(_)) {
      PROPERTY_COMPUTED_FLAG
    } else {
      0u32
    };
    let flags_position = end_position + PROPERTY_FLAGS_OFFSET;
    self.buffer[flags_position..flags_position + 4].copy_from_slice(&flags.to_ne_bytes());
    // kind
    let kind_position = end_position + PROPERTY_KIND_OFFSET;
    self.buffer[kind_position..kind_position + 4].copy_from_slice(&STRING_INIT);
    // value
    self.update_reference_position(end_position + PROPERTY_VALUE_OFFSET);
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

  // TODO SWC merge with method
  fn store_getter_setter_property(
    &mut self,
    span: &Span,
    kind: &[u8; 4],
    key: &PropName,
    body: &Option<BlockStmt>,
    param: Option<&Pat>,
  ) {
    let end_position =
      self.add_type_and_start(&TYPE_PROPERTY, span, PROPERTY_RESERVED_BYTES, false);
    // key
    self.update_reference_position(end_position + PROPERTY_KEY_OFFSET);
    self.convert_property_name(key);
    let key_end = self.get_property_name_span(key).hi.0 - 1;
    // flags, method and shorthand are always false
    let flags = if matches!(key, PropName::Computed(_)) {
      PROPERTY_COMPUTED_FLAG
    } else {
      0u32
    };
    let flags_position = end_position + PROPERTY_FLAGS_OFFSET;
    self.buffer[flags_position..flags_position + 4].copy_from_slice(&flags.to_ne_bytes());
    // kind
    let kind_position = end_position + PROPERTY_KIND_OFFSET;
    self.buffer[kind_position..kind_position + 4].copy_from_slice(kind);
    // value
    let block_statement = body.as_ref().expect("Getter/setter property without body");
    self.update_reference_position(end_position + PROPERTY_VALUE_OFFSET);
    let parameters = match param {
      Some(pattern) => vec![pattern],
      None => vec![],
    };
    self.store_function_node(
      &TYPE_FUNCTION_EXPRESSION_INLINED_ANNOTATIONS,
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

  fn convert_method_property(&mut self, method_property: &MethodProp) {
    let end_position = self.add_type_and_start(
      &TYPE_PROPERTY,
      &method_property.function.span,
      PROPERTY_RESERVED_BYTES,
      false,
    );
    // key
    self.update_reference_position(end_position + PROPERTY_KEY_OFFSET);
    self.convert_property_name(&method_property.key);
    let key_end = self.get_property_name_span(&method_property.key).hi.0 - 1;
    let function_start = find_first_occurrence_outside_comment(self.code, b'(', key_end);
    // flags, shorthand is always false
    let mut flags = PROPERTY_METHOD_FLAG;
    if matches!(&method_property.key, PropName::Computed(_)) {
      flags |= PROPERTY_COMPUTED_FLAG
    };
    let flags_position = end_position + PROPERTY_FLAGS_OFFSET;
    self.buffer[flags_position..flags_position + 4].copy_from_slice(&flags.to_ne_bytes());
    // kind
    let kind_position = end_position + PROPERTY_KIND_OFFSET;
    self.buffer[kind_position..kind_position + 4].copy_from_slice(&STRING_INIT);
    // value
    self.update_reference_position(end_position + PROPERTY_VALUE_OFFSET);
    let function = &method_property.function;
    let parameters: Vec<&Pat> = function.params.iter().map(|param| &param.pat).collect();
    self.store_function_node(
      &TYPE_FUNCTION_EXPRESSION_INLINED_ANNOTATIONS,
      function_start,
      function.span.hi.0 - 1,
      function.is_async,
      function.is_generator,
      None,
      &parameters,
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
    let end_position =
      self.add_type_and_start(&TYPE_PROPERTY, span, PROPERTY_RESERVED_BYTES, false);
    match assignment_value {
      Some(value) => {
        // value
        self.update_reference_position(end_position + PROPERTY_VALUE_OFFSET);
        let left_position = self.store_assignment_pattern_and_get_left_position(
          span,
          PatternOrIdentifier::Identifier(key),
          value,
        );
        // key, reuse identifier to avoid converting positions out of order
        let key_position = end_position + PROPERTY_KEY_OFFSET;
        self.buffer[key_position..key_position + 4].copy_from_slice(&left_position.to_ne_bytes());
      }
      None => {
        // value
        self.update_reference_position(end_position + PROPERTY_VALUE_OFFSET);
        self.convert_identifier(key);
      }
    }
    // flags
    let flags_position = end_position + PROPERTY_FLAGS_OFFSET;
    self.buffer[flags_position..flags_position + 4]
      .copy_from_slice(&PROPERTY_SHORTHAND_FLAG.to_ne_bytes());
    // kind
    let kind_position = end_position + PROPERTY_KIND_OFFSET;
    self.buffer[kind_position..kind_position + 4].copy_from_slice(&STRING_INIT);
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
    let end_position = self.add_type_and_start(
      &TYPE_PROPERTY_DEFINITION_INLINED_KEY,
      span,
      PROPERTY_DEFINITION_RESERVED_BYTES,
      false,
    );
    // key
    match key {
      PropOrPrivateName::PropName(prop_name) => {
        self.convert_property_name(prop_name);
      }
      PropOrPrivateName::PrivateName(private_name) => self.convert_private_name(private_name),
    }
    // flags
    let mut flags = if is_static {
      PROPERTY_DEFINITION_STATIC_FLAG
    } else {
      0u32
    };
    if is_computed {
      flags |= PROPERTY_DEFINITION_COMPUTED_FLAG;
    }
    let flags_position = end_position + PROPERTY_DEFINITION_FLAGS_OFFSET;
    self.buffer[flags_position..flags_position + 4].copy_from_slice(&flags.to_ne_bytes());
    // value
    value.map(|expression| {
      self.update_reference_position(end_position + PROPERTY_DEFINITION_VALUE_OFFSET);
      self.convert_expression(expression);
    });
    // end
    self.add_end(end_position, span);
  }

  fn convert_rest_pattern(&mut self, rest_pattern: &RestPat) {
    let end_position = self.add_type_and_explicit_start(
      &TYPE_REST_ELEMENT_INLINED_ARGUMENT,
      rest_pattern.dot3_token.lo.0 - 1,
      REST_ELEMENT_RESERVED_BYTES,
    );
    // argument
    self.convert_pattern(&rest_pattern.arg);
    // end
    self.add_explicit_end(end_position, rest_pattern.span.hi.0 - 1);
  }

  fn convert_return_statement(&mut self, return_statement: &ReturnStmt) {
    let end_position = self.add_type_and_start(
      &TYPE_RETURN_STATEMENT,
      &return_statement.span,
      RETURN_STATEMENT_RESERVED_BYTES,
      false,
    );
    // argument
    return_statement.arg.as_ref().map(|argument| {
      self.update_reference_position(end_position + RETURN_STATEMENT_ARGUMENT_OFFSET);
      self.convert_expression(argument)
    });
    // end
    self.add_end(end_position, &return_statement.span);
  }

  fn convert_sequence_expression(&mut self, sequence_expression: &SeqExpr) {
    let end_position = self.add_type_and_start(
      &TYPE_SEQUENCE_EXPRESSION_INLINED_EXPRESSIONS,
      &sequence_expression.span,
      SEQUENCE_EXPRESSION_RESERVED_BYTES,
      false,
    );
    // expressions
    self.convert_item_list(&sequence_expression.exprs, |ast_converter, expression| {
      ast_converter.convert_expression(expression);
      true
    });
    // end
    self.add_end(end_position, &sequence_expression.span);
  }

  fn store_spread_element(&mut self, dot_span: &Span, argument: &Expr) {
    let end_position = self.add_type_and_start(
      &TYPE_SPREAD_ELEMENT_INLINED_ARGUMENT,
      dot_span,
      SPREAD_ELEMENT_RESERVED_BYTES,
      false,
    );
    // we need to set the end position to that of the expression
    let argument_position = self.buffer.len();
    // argument
    self.convert_expression(argument);
    let expression_end: [u8; 4] = self.buffer[argument_position + 8..argument_position + 12]
      .try_into()
      .unwrap();
    self.buffer[end_position..end_position + 4].copy_from_slice(&expression_end);
  }

  fn convert_static_block(&mut self, static_block: &StaticBlock) {
    let end_position = self.add_type_and_start(
      &TYPE_STATIC_BLOCK_INLINED_BODY,
      &static_block.span,
      STATIC_BLOCK_RESERVED_BYTES,
      false,
    );
    // body
    self.convert_item_list(&static_block.body.stmts, |ast_converter, statement| {
      ast_converter.convert_statement(statement);
      true
    });
    // end
    self.add_end(end_position, &static_block.span);
  }

  fn convert_super(&mut self, super_token: &Super) {
    let end_position = self.add_type_and_start(
      &TYPE_SUPER_ELEMENT,
      &super_token.span,
      SUPER_ELEMENT_RESERVED_BYTES,
      false,
    );
    // end
    self.add_end(end_position, &super_token.span);
  }

  fn convert_switch_case(&mut self, switch_case: &SwitchCase) {
    let end_position = self.add_type_and_start(
      &TYPE_SWITCH_CASE,
      &switch_case.span,
      SWITCH_CASE_RESERVED_BYTES,
      false,
    );
    // test
    switch_case.test.as_ref().map(|expression| {
      self.update_reference_position(end_position + SWITCH_CASE_TEST_OFFSET);
      self.convert_expression(expression)
    });
    // consequent
    self.update_reference_position(end_position + SWITCH_CASE_CONSEQUENT_OFFSET);
    self.convert_item_list(&switch_case.cons, |ast_converter, statement| {
      ast_converter.convert_statement(statement);
      true
    });
    // end
    self.add_end(end_position, &switch_case.span);
  }

  fn convert_switch_statement(&mut self, switch_statement: &SwitchStmt) {
    let end_position = self.add_type_and_start(
      &TYPE_SWITCH_STATEMENT_INLINED_DISCRIMINANT,
      &switch_statement.span,
      SWITCH_STATEMENT_RESERVED_BYTES,
      false,
    );
    // discriminant
    self.convert_expression(&switch_statement.discriminant);
    // cases
    self.update_reference_position(end_position + SWITCH_STATEMENT_CASES_OFFSET);
    self.convert_item_list(&switch_statement.cases, |ast_converter, switch_case| {
      ast_converter.convert_switch_case(switch_case);
      true
    });
    // end
    self.add_end(end_position, &switch_statement.span);
  }

  fn convert_tagged_template_expression(&mut self, tagged_template: &TaggedTpl) {
    let end_position = self.add_type_and_start(
      &TYPE_TAGGED_TEMPLATE_EXPRESSION_INLINED_TAG,
      &tagged_template.span,
      TAGGED_TEMPLATE_EXPRESSION_RESERVED_BYTES,
      false,
    );
    // tag
    self.convert_expression(&tagged_template.tag);
    // quasi
    self.update_reference_position(end_position + TAGGED_TEMPLATE_EXPRESSION_QUASI_OFFSET);
    self.convert_template_literal(&tagged_template.tpl);
    // end
    self.add_end(end_position, &tagged_template.span);
  }

  fn convert_template_element(&mut self, template_element: &TplElement) {
    let end_position = self.add_type_and_start(
      &TYPE_TEMPLATE_ELEMENT_INLINED_RAW,
      &template_element.span,
      TEMPLATE_ELEMENT_RESERVED_BYTES,
      false,
    );
    // flags
    let flags = if template_element.tail {
      TEMPLATE_ELEMENT_TAIL_FLAG
    } else {
      0u32
    };
    let flags_position = end_position + TEMPLATE_ELEMENT_FLAGS_OFFSET;
    self.buffer[flags_position..flags_position + 4].copy_from_slice(&flags.to_ne_bytes());
    // raw
    self.convert_string(&template_element.raw);
    // cooked
    if let Some(cooked) = template_element.cooked.as_ref() {
      self.update_reference_position(end_position + TEMPLATE_ELEMENT_COOKED_OFFSET);
      self.convert_string(cooked);
    }
    // end
    self.add_end(end_position, &template_element.span);
  }

  fn convert_template_literal(&mut self, template_literal: &Tpl) {
    let end_position = self.add_type_and_start(
      &TYPE_TEMPLATE_LITERAL_INLINED_QUASIS,
      &template_literal.span,
      TEMPLATE_LITERAL_RESERVED_BYTES,
      false,
    );
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
    self.update_reference_position(end_position + TEMPLATE_LITERAL_EXPRESSIONS_OFFSET);
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
      self.convert_expression(expression);
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

  fn convert_this_expression(&mut self, this_expression: &ThisExpr) {
    let end_position = self.add_type_and_start(
      &TYPE_THIS_EXPRESSION,
      &this_expression.span,
      THIS_EXPRESSION_RESERVED_BYTES,
      false,
    );
    // end
    self.add_end(end_position, &this_expression.span);
  }

  fn convert_throw_statement(&mut self, throw_statement: &ThrowStmt) {
    let end_position = self.add_type_and_start(
      &TYPE_THROW_STATEMENT_INLINED_ARGUMENT,
      &throw_statement.span,
      THROW_STATEMENT_RESERVED_BYTES,
      false,
    );
    // argument
    self.convert_expression(&throw_statement.arg);
    // end
    self.add_end(end_position, &throw_statement.span);
  }

  fn convert_try_statement(&mut self, try_statement: &TryStmt) {
    let end_position = self.add_type_and_start(
      &TYPE_TRY_STATEMENT_INLINED_BLOCK,
      &try_statement.span,
      TRY_STATEMENT_RESERVED_BYTES,
      false,
    );
    // block
    self.convert_block_statement(&try_statement.block, false);
    // handler
    if let Some(catch_clause) = try_statement.handler.as_ref() {
      self.update_reference_position(end_position + TRY_STATEMENT_HANDLER_OFFSET);
      self.convert_catch_clause(catch_clause);
    }
    // finalizer
    if let Some(block_statement) = try_statement.finalizer.as_ref() {
      self.update_reference_position(end_position + TRY_STATEMENT_FINALIZER_OFFSET);
      self.convert_block_statement(block_statement, false);
    }
    // end
    self.add_end(end_position, &try_statement.span);
  }

  fn convert_unary_expression(&mut self, unary_expression: &UnaryExpr) {
    let end_position = self.add_type_and_start(
      &TYPE_UNARY_EXPRESSION_INLINED_ARGUMENT,
      &unary_expression.span,
      UNARY_EXPRESSION_RESERVED_BYTES,
      false,
    );
    // argument
    self.convert_expression(&unary_expression.arg);
    // operator
    let operator_position = end_position + UNARY_EXPRESSION_OPERATOR_OFFSET;
    self.buffer[operator_position..operator_position + 4].copy_from_slice(
      match unary_expression.op {
        UnaryOp::Minus => &STRING_MINUS,
        UnaryOp::Plus => &STRING_PLUS,
        UnaryOp::Bang => &STRING_BANG,
        UnaryOp::Tilde => &STRING_TILDE,
        UnaryOp::TypeOf => &STRING_TYPEOF,
        UnaryOp::Void => &STRING_VOID,
        UnaryOp::Delete => &STRING_DELETE,
      },
    );
    // end
    self.add_end(end_position, &unary_expression.span);
  }

  fn convert_update_expression(&mut self, update_expression: &UpdateExpr) {
    let end_position = self.add_type_and_start(
      &TYPE_UPDATE_EXPRESSION_INLINED_ARGUMENT,
      &update_expression.span,
      UPDATE_EXPRESSION_RESERVED_BYTES,
      false,
    );
    // argument
    self.convert_expression(&update_expression.arg);
    // flags
    let flags = if update_expression.prefix {
      UPDATE_EXPRESSION_PREFIX_FLAG
    } else {
      0u32
    };
    let flags_position = end_position + UPDATE_EXPRESSION_FLAGS_OFFSET;
    self.buffer[flags_position..flags_position + 4].copy_from_slice(&flags.to_ne_bytes());
    // operator
    let operator_position = end_position + UPDATE_EXPRESSION_OPERATOR_OFFSET;
    self.buffer[operator_position..operator_position + 4].copy_from_slice(
      match update_expression.op {
        UpdateOp::PlusPlus => &STRING_PLUSPLUS,
        UpdateOp::MinusMinus => &STRING_MINUSMINUS,
      },
    );
    // end
    self.add_end(end_position, &update_expression.span);
  }

  fn convert_variable_declaration(&mut self, variable_declaration: &VarDecl) {
    let end_position = self.add_type_and_start(
      &TYPE_VARIABLE_DECLARATION_INLINED_DECLARATIONS,
      &variable_declaration.span,
      VARIABLE_DECLARATION_RESERVED_BYTES,
      matches!(variable_declaration.kind, VarDeclKind::Const),
    );
    // declarations
    self.convert_item_list(
      &variable_declaration.decls,
      |ast_converter, variable_declarator| {
        ast_converter.convert_variable_declarator(variable_declarator);
        true
      },
    );
    // kind
    let kind_position = end_position + VARIABLE_DECLARATION_KIND_OFFSET;
    self.buffer[kind_position..kind_position + 4].copy_from_slice(
      match variable_declaration.kind {
        VarDeclKind::Var => &STRING_VAR,
        VarDeclKind::Let => &STRING_LET,
        VarDeclKind::Const => &STRING_CONST,
      },
    );
    // end
    self.add_end(end_position, &variable_declaration.span);
  }

  fn convert_variable_declarator(&mut self, variable_declarator: &VarDeclarator) {
    let end_position = self.add_type_and_start(
      &TYPE_VARIABLE_DECLARATOR_INLINED_ID,
      &variable_declarator.span,
      VARIABLE_DECLARATOR_RESERVED_BYTES,
      false,
    );
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
    // id
    self.convert_pattern(&variable_declarator.name);
    // init
    if let Some(annotations) = forwarded_annotations {
      self.index_converter.add_collected_annotations(annotations);
    }
    if let Some(init) = variable_declarator.init.as_ref() {
      self.update_reference_position(end_position + VARIABLE_DECLARATOR_INIT_OFFSET);
      self.convert_expression(init);
    }
    // end
    self.add_end(end_position, &variable_declarator.span);
  }

  fn convert_while_statement(&mut self, while_statement: &WhileStmt) {
    let end_position = self.add_type_and_start(
      &TYPE_WHILE_STATEMENT_INLINED_TEST,
      &while_statement.span,
      WHILE_STATEMENT_RESERVED_BYTES,
      false,
    );
    // test
    self.convert_expression(&while_statement.test);
    // body
    self.update_reference_position(end_position + WHILE_STATEMENT_BODY_OFFSET);
    self.convert_statement(&while_statement.body);
    // end
    self.add_end(end_position, &while_statement.span);
  }

  fn convert_yield_expression(&mut self, yield_expression: &YieldExpr) {
    let end_position = self.add_type_and_start(
      &TYPE_YIELD_EXPRESSION,
      &yield_expression.span,
      YIELD_EXPRESSION_RESERVED_BYTES,
      false,
    );
    // flags
    let flags = if yield_expression.delegate {
      YIELD_EXPRESSION_DELEGATE_FLAG
    } else {
      0u32
    };
    let flags_position = end_position + YIELD_EXPRESSION_FLAGS_OFFSET;
    self.buffer[flags_position..flags_position + 4].copy_from_slice(&flags.to_ne_bytes());
    // argument
    yield_expression.arg.as_ref().map(|expression| {
      self.update_reference_position(end_position + YIELD_EXPRESSION_ARGUMENT_OFFSET);
      self.convert_expression(expression)
    });
    // end
    self.add_end(end_position, &yield_expression.span);
  }
}

fn convert_annotation(buffer: &mut Vec<u8>, annotation: &ConvertedAnnotation) {
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
