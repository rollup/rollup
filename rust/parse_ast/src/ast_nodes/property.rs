use swc_common::Span;
use swc_ecma_ast::{
  AssignPatProp, BlockStmt, Expr, GetterProp, Ident, KeyValuePatProp, KeyValueProp, MethodProp,
  Pat, Prop, PropName, SetterProp,
};

use crate::ast_nodes::assignment_pattern::PatternOrIdentifier;
use crate::convert_ast::converter::analyze_code::find_first_occurrence_outside_comment;
use crate::convert_ast::converter::ast_constants::{
  PROPERTY_COMPUTED_FLAG, PROPERTY_FLAGS_OFFSET, PROPERTY_KEY_OFFSET, PROPERTY_KIND_OFFSET,
  PROPERTY_METHOD_FLAG, PROPERTY_RESERVED_BYTES, PROPERTY_SHORTHAND_FLAG, PROPERTY_VALUE_OFFSET,
  TYPE_FUNCTION_EXPRESSION, TYPE_PROPERTY,
};
use crate::convert_ast::converter::string_constants::{STRING_GET, STRING_INIT, STRING_SET};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub fn convert_property(&mut self, property: &Prop) {
    match property {
      Prop::Getter(getter_property) => self.convert_getter_property(getter_property),
      Prop::KeyValue(key_value_property) => self.convert_key_value_property(key_value_property),
      Prop::Method(method_property) => self.convert_method_property(method_property),
      Prop::Setter(setter_property) => self.convert_setter_property(setter_property),
      Prop::Shorthand(identifier) => self.convert_shorthand_property(identifier),
      Prop::Assign(_) => unimplemented!("Cannot convert Prop::Assign"),
    }
  }

  pub fn convert_assignment_pattern_property(
    &mut self,
    assignment_pattern_property: &AssignPatProp,
  ) {
    self.store_shorthand_property(
      &assignment_pattern_property.span,
      &assignment_pattern_property.key,
      &assignment_pattern_property.value,
    );
  }

  pub fn convert_key_value_pattern_property(
    &mut self,
    key_value_pattern_property: &KeyValuePatProp,
  ) {
    self.store_key_value_property(
      &key_value_pattern_property.key,
      PatternOrExpression::Pattern(&key_value_pattern_property.value),
    );
  }

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
    let mut flags = 0u32;
    if matches!(property_name, PropName::Computed(_)) {
      flags |= PROPERTY_COMPUTED_FLAG
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
    let mut flags = 0u32;
    if matches!(key, PropName::Computed(_)) {
      flags |= PROPERTY_COMPUTED_FLAG;
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
      &TYPE_FUNCTION_EXPRESSION,
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

  fn convert_getter_property(&mut self, getter_property: &GetterProp) {
    self.store_getter_setter_property(
      &getter_property.span,
      &STRING_GET,
      &getter_property.key,
      &getter_property.body,
      None,
    );
  }

  fn convert_key_value_property(&mut self, key_value_property: &KeyValueProp) {
    self.store_key_value_property(
      &key_value_property.key,
      PatternOrExpression::Expression(&key_value_property.value),
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

  fn convert_shorthand_property(&mut self, identifier: &Ident) {
    self.store_shorthand_property(&identifier.span, identifier, &None);
  }
}

pub enum PatternOrExpression<'a> {
  Pattern(&'a Pat),
  Expression(&'a Expr),
}
