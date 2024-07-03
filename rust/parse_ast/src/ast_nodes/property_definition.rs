use swc_common::Span;
use swc_ecma_ast::{ClassProp, Expr, PrivateProp, PropName};

use crate::ast_nodes::method_definition::PropOrPrivateName;
use crate::convert_ast::converter::ast_constants::{
  PROPERTY_DEFINITION_KEY_OFFSET, PROPERTY_DEFINITION_RESERVED_BYTES,
  PROPERTY_DEFINITION_VALUE_OFFSET, TYPE_PROPERTY_DEFINITION,
};
use crate::convert_ast::converter::AstConverter;
use crate::store_property_definition_flags;

impl<'a> AstConverter<'a> {
  pub fn store_property_definition(
    &mut self,
    span: &Span,
    is_computed: bool,
    is_static: bool,
    key: PropOrPrivateName,
    value: &Option<&Expr>,
  ) {
    let end_position = self.add_type_and_start(
      &TYPE_PROPERTY_DEFINITION,
      span,
      PROPERTY_DEFINITION_RESERVED_BYTES,
      false,
    );
    // key
    self.update_reference_position(end_position + PROPERTY_DEFINITION_KEY_OFFSET);
    match key {
      PropOrPrivateName::PropName(prop_name) => {
        self.convert_property_name(prop_name);
      }
      PropOrPrivateName::PrivateName(private_name) => self.store_private_identifier(private_name),
    }
    // flags
    store_property_definition_flags!(self, end_position, static => is_static, computed => is_computed);
    // value
    if let Some(expression) = value {
      self.update_reference_position(end_position + PROPERTY_DEFINITION_VALUE_OFFSET);
      self.convert_expression(expression);
    }
    // end
    self.add_end(end_position, span);
  }

  pub fn convert_class_property(&mut self, class_property: &ClassProp) {
    self.store_property_definition(
      &class_property.span,
      matches!(&class_property.key, PropName::Computed(_)),
      class_property.is_static,
      PropOrPrivateName::PropName(&class_property.key),
      &class_property.value.as_deref(),
    );
  }

  pub fn convert_private_property(&mut self, private_property: &PrivateProp) {
    self.store_property_definition(
      &private_property.span,
      false,
      private_property.is_static,
      PropOrPrivateName::PrivateName(&private_property.key),
      &private_property.value.as_deref(),
    );
  }
}
