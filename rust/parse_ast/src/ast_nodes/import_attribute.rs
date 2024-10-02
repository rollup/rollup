use swc_common::Spanned;
use swc_ecma_ast::{KeyValueProp, ObjectLit, Prop, PropOrSpread};

use crate::convert_ast::converter::ast_constants::{
  IMPORT_ATTRIBUTE_KEY_OFFSET, IMPORT_ATTRIBUTE_RESERVED_BYTES, IMPORT_ATTRIBUTE_VALUE_OFFSET,
  TYPE_IMPORT_ATTRIBUTE,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub(crate) fn store_import_attribute(&mut self, key_value_property: &KeyValueProp) {
    // type
    let end_position = self.add_type_and_start(
      &TYPE_IMPORT_ATTRIBUTE,
      &key_value_property.span(),
      IMPORT_ATTRIBUTE_RESERVED_BYTES,
      false,
    );
    // key
    self.update_reference_position(end_position + IMPORT_ATTRIBUTE_KEY_OFFSET);
    self.convert_property_name(&key_value_property.key);
    // value
    self.update_reference_position(end_position + IMPORT_ATTRIBUTE_VALUE_OFFSET);
    self.convert_expression(&key_value_property.value);
    self.add_end(end_position, &key_value_property.span());
  }

  pub(crate) fn store_import_attributes(
    &mut self,
    with: &Option<Box<ObjectLit>>,
    reference_position: usize,
  ) {
    match with {
      Some(ref with) => {
        self.convert_item_list(
          &with.props,
          reference_position,
          |ast_converter, prop| match prop {
            PropOrSpread::Prop(prop) => match &**prop {
              Prop::KeyValue(key_value_property) => {
                ast_converter.store_import_attribute(key_value_property);
                true
              }
              _ => panic!("Non key-value property in import declaration attributes"),
            },
            PropOrSpread::Spread(_) => panic!("Spread in import declaration attributes"),
          },
        );
      }
      None => self.buffer.resize(self.buffer.len() + 4, 0),
    }
  }
}
