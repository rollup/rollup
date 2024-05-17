use swc_ecma_ast::ForOfStmt;

use crate::convert_ast::converter::ast_constants::{
  FOR_OF_STATEMENT_AWAIT_FLAG, FOR_OF_STATEMENT_BODY_OFFSET, FOR_OF_STATEMENT_FLAGS_OFFSET,
  FOR_OF_STATEMENT_LEFT_OFFSET, FOR_OF_STATEMENT_RESERVED_BYTES, FOR_OF_STATEMENT_RIGHT_OFFSET,
  TYPE_FOR_OF_STATEMENT,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub fn store_for_of_statement(&mut self, for_of_statement: &ForOfStmt) {
    let end_position = self.add_type_and_start(
      &TYPE_FOR_OF_STATEMENT,
      &for_of_statement.span,
      FOR_OF_STATEMENT_RESERVED_BYTES,
      false,
    );
    // flags
    let mut flags = 0u32;
    if for_of_statement.is_await {
      flags |= FOR_OF_STATEMENT_AWAIT_FLAG;
    };
    let flags_position = end_position + FOR_OF_STATEMENT_FLAGS_OFFSET;
    self.buffer[flags_position..flags_position + 4].copy_from_slice(&flags.to_ne_bytes());
    // left
    self.update_reference_position(end_position + FOR_OF_STATEMENT_LEFT_OFFSET);
    self.convert_for_head(&for_of_statement.left);
    // right
    self.update_reference_position(end_position + FOR_OF_STATEMENT_RIGHT_OFFSET);
    self.convert_expression(&for_of_statement.right);
    // body
    self.update_reference_position(end_position + FOR_OF_STATEMENT_BODY_OFFSET);
    self.convert_statement(&for_of_statement.body);
    // end
    self.add_end(end_position, &for_of_statement.span);
  }
}
