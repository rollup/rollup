use swc_ecma_ast::ArrayLit;

use crate::convert_ast::converter::ast_constants::{
  ARRAY_EXPRESSION_ELEMENTS_OFFSET, ARRAY_EXPRESSION_RESERVED_BYTES, TYPE_ARRAY_EXPRESSION,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub fn store_array_expression(&mut self, array_literal: &ArrayLit) {
    let end_position = self.add_type_and_start(
      &TYPE_ARRAY_EXPRESSION,
      &array_literal.span,
      ARRAY_EXPRESSION_RESERVED_BYTES,
      false,
    );
    // elements
    self.convert_item_list(
      &array_literal.elems,
      end_position + ARRAY_EXPRESSION_ELEMENTS_OFFSET,
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
}
