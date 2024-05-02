use swc_ecma_ast::OptChainExpr;

use crate::convert_ast::converter::ast_constants::{
  CHAIN_EXPRESSION_EXPRESSION_OFFSET, CHAIN_EXPRESSION_RESERVED_BYTES, TYPE_CHAIN_EXPRESSION,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub fn store_chain_expression(
    &mut self,
    optional_chain_expression: &OptChainExpr,
    is_chained: bool,
  ) {
    if is_chained {
      self.convert_optional_chain_base(
        &optional_chain_expression.base,
        optional_chain_expression.optional,
      );
    } else {
      let end_position = self.add_type_and_start(
        &TYPE_CHAIN_EXPRESSION,
        &optional_chain_expression.span,
        CHAIN_EXPRESSION_RESERVED_BYTES,
        false,
      );
      // expression
      self.update_reference_position(end_position + CHAIN_EXPRESSION_EXPRESSION_OFFSET);
      self.convert_optional_chain_base(
        &optional_chain_expression.base,
        optional_chain_expression.optional,
      );
      // end
      self.add_end(end_position, &optional_chain_expression.span);
    }
  }
}
