use swc_ecma_ast::ArrayPat;

use crate::convert_ast::converter::ast_constants::{
  ARRAY_PATTERN_ELEMENTS_OFFSET, ARRAY_PATTERN_RESERVED_BYTES, TYPE_ARRAY_PATTERN,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub(crate) fn store_array_pattern(&mut self, array_pattern: &ArrayPat) {
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
  }
}
