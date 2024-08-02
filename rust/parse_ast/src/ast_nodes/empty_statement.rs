use swc_ecma_ast::EmptyStmt;

use crate::convert_ast::converter::AstConverter;
use crate::store_empty_statement;

impl<'a> AstConverter<'a> {
  pub(crate) fn store_empty_statement(&mut self, empty_statement: &EmptyStmt) {
    store_empty_statement!(self, span => empty_statement.span);
  }
}
