use swc_common::Span;
use swc_ecma_ast::{ClassProp, Expr, PrivateProp, PropName};

use crate::ast_nodes::method_definition::PropOrPrivateName;
use crate::convert_ast::converter::ast_constants::{
  PROPERTY_DEFINITION_COMPUTED_FLAG, PROPERTY_DEFINITION_FLAGS_OFFSET,
  PROPERTY_DEFINITION_KEY_OFFSET, PROPERTY_DEFINITION_RESERVED_BYTES,
  PROPERTY_DEFINITION_STATIC_FLAG, PROPERTY_DEFINITION_VALUE_OFFSET, TYPE_PROPERTY_DEFINITION,
};
use crate::convert_ast::converter::AstConverter;

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
    let mut flags = 0u32;
    if is_static {
      flags |= PROPERTY_DEFINITION_STATIC_FLAG;
    }
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
