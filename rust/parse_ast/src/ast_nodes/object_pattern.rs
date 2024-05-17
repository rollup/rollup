use swc_ecma_ast::ObjectPat;

use crate::convert_ast::converter::ast_constants::{
  OBJECT_PATTERN_PROPERTIES_OFFSET, OBJECT_PATTERN_RESERVED_BYTES, TYPE_OBJECT_PATTERN,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub fn store_object_pattern(&mut self, object_pattern: &ObjectPat) {
    let end_position = self.add_type_and_start(
      &TYPE_OBJECT_PATTERN,
      &object_pattern.span,
      OBJECT_PATTERN_RESERVED_BYTES,
      false,
    );
    // properties
    self.convert_item_list(
      &object_pattern.props,
      end_position + OBJECT_PATTERN_PROPERTIES_OFFSET,
      |ast_converter, object_pattern_property| {
        ast_converter.convert_object_pattern_property(object_pattern_property);
        true
      },
    );
    // end
    self.add_end(end_position, &object_pattern.span);
  }
}
