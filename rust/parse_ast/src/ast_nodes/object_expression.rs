use swc_ecma_ast::ObjectLit;

use crate::convert_ast::converter::ast_constants::{
  OBJECT_EXPRESSION_PROPERTIES_OFFSET, OBJECT_EXPRESSION_RESERVED_BYTES, TYPE_OBJECT_EXPRESSION,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub fn store_object_expression(&mut self, object_literal: &ObjectLit) {
    let end_position = self.add_type_and_start(
      &TYPE_OBJECT_EXPRESSION,
      &object_literal.span,
      OBJECT_EXPRESSION_RESERVED_BYTES,
      false,
    );
    // properties
    self.convert_item_list(
      &object_literal.props,
      end_position + OBJECT_EXPRESSION_PROPERTIES_OFFSET,
      |ast_converter, property_or_spread| {
        ast_converter.convert_property_or_spread(property_or_spread);
        true
      },
    );
    // end
    self.add_end(end_position, &object_literal.span);
  }
}
