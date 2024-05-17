use swc_ecma_ast::EmptyStmt;

use crate::convert_ast::converter::ast_constants::{
  EMPTY_STATEMENT_RESERVED_BYTES, TYPE_EMPTY_STATEMENT,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub fn store_empty_statement(&mut self, empty_statement: &EmptyStmt) {
    let end_position = self.add_type_and_start(
      &TYPE_EMPTY_STATEMENT,
      &empty_statement.span,
      EMPTY_STATEMENT_RESERVED_BYTES,
      false,
    );
    self.add_end(end_position, &empty_statement.span)
  }
}
