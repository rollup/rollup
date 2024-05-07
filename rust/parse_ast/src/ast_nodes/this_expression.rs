use swc_ecma_ast::ThisExpr;

use crate::convert_ast::converter::ast_constants::{
  THIS_EXPRESSION_RESERVED_BYTES, TYPE_THIS_EXPRESSION,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub fn store_this_expression(&mut self, this_expression: &ThisExpr) {
    let end_position = self.add_type_and_start(
      &TYPE_THIS_EXPRESSION,
      &this_expression.span,
      THIS_EXPRESSION_RESERVED_BYTES,
      false,
    );
    // end
    self.add_end(end_position, &this_expression.span);
  }
}
