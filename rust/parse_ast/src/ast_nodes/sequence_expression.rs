use swc_ecma_ast::SeqExpr;

use crate::convert_ast::converter::ast_constants::{
  SEQUENCE_EXPRESSION_EXPRESSIONS_OFFSET, SEQUENCE_EXPRESSION_RESERVED_BYTES,
  TYPE_SEQUENCE_EXPRESSION,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub fn store_sequence_expression(&mut self, sequence_expression: &SeqExpr) {
    let end_position = self.add_type_and_start(
      &TYPE_SEQUENCE_EXPRESSION,
      &sequence_expression.span,
      SEQUENCE_EXPRESSION_RESERVED_BYTES,
      false,
    );
    // expressions
    self.convert_item_list(
      &sequence_expression.exprs,
      end_position + SEQUENCE_EXPRESSION_EXPRESSIONS_OFFSET,
      |ast_converter, expression| {
        ast_converter.convert_expression(expression);
        true
      },
    );
    // end
    self.add_end(end_position, &sequence_expression.span);
  }
}
