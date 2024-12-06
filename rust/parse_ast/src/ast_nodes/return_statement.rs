use swc_ecma_ast::ReturnStmt;

use crate::convert_ast::converter::AstConverter;
use crate::store_return_statement;

impl AstConverter<'_> {
  pub(crate) fn store_return_statement(&mut self, return_statement: &ReturnStmt) {
    store_return_statement!(
      self,
      span => return_statement.span,
      argument => [return_statement.arg, convert_expression]
    );
  }
}
