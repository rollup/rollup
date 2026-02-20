use swc_ecma_ast::ArrayPat;

use crate::convert_ast::converter::ast_constants::{
  ARRAY_PATTERN_ELEMENTS_OFFSET, ARRAY_PATTERN_RESERVED_BYTES, NODE_TYPE_ID_ARRAY_PATTERN,
  TYPE_ARRAY_PATTERN,
};
use crate::convert_ast::converter::AstConverter;

impl AstConverter<'_> {
  pub(crate) fn store_array_pattern(&mut self, array_pattern: &ArrayPat) {
    let walk_entry = self.on_node_enter::<NODE_TYPE_ID_ARRAY_PATTERN>();
    let end_position = self.add_type_and_start(
      &TYPE_ARRAY_PATTERN,
      &array_pattern.span,
      ARRAY_PATTERN_RESERVED_BYTES,
      false,
    );
    // elements
    self.convert_item_list(
      &array_pattern.elems,
      end_position + ARRAY_PATTERN_ELEMENTS_OFFSET,
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
    self.on_node_exit(walk_entry);
  }
}
