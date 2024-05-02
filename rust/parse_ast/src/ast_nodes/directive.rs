use swc_atoms::JsWord;
use swc_ecma_ast::ExprStmt;

use crate::convert_ast::converter::ast_constants::{
  DIRECTIVE_DIRECTIVE_OFFSET, DIRECTIVE_EXPRESSION_OFFSET, DIRECTIVE_RESERVED_BYTES, TYPE_DIRECTIVE,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub fn store_directive(&mut self, expression_statement: &ExprStmt, directive: &JsWord) {
    let end_position = self.add_type_and_start(
      &TYPE_DIRECTIVE,
      &expression_statement.span,
      DIRECTIVE_RESERVED_BYTES,
      false,
    );
    // directive
    self.convert_string(directive, end_position + DIRECTIVE_DIRECTIVE_OFFSET);
    // expression
    self.update_reference_position(end_position + DIRECTIVE_EXPRESSION_OFFSET);
    self.convert_expression(&expression_statement.expr);
    // end
    self.add_end(end_position, &expression_statement.span);
  }
}
