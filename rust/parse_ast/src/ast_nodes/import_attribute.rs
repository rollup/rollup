use swc_ecma_ast::{KeyValueProp, ObjectLit, Prop, PropOrSpread};

use crate::convert_ast::converter::ast_constants::{
  IMPORT_ATTRIBUTE_KEY_OFFSET, IMPORT_ATTRIBUTE_RESERVED_BYTES, IMPORT_ATTRIBUTE_VALUE_OFFSET,
  TYPE_IMPORT_ATTRIBUTE,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub fn store_import_attribute(&mut self, key_value_property: &KeyValueProp) {
    // type
    self.buffer.extend_from_slice(&TYPE_IMPORT_ATTRIBUTE);
    let start_position = self.buffer.len();
    let end_position = start_position + 4;
    // reserved bytes
    self
      .buffer
      .resize(end_position + IMPORT_ATTRIBUTE_RESERVED_BYTES, 0);
    // key
    self.update_reference_position(end_position + IMPORT_ATTRIBUTE_KEY_OFFSET);
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

  pub fn store_import_attributes(
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
