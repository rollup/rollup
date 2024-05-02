use crate::convert_ast::converter::ast_constants::{IDENTIFIER_NAME_OFFSET, IDENTIFIER_RESERVED_BYTES, TYPE_IDENTIFIER};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub fn store_identifier(&mut self, start: u32, end: u32, name: &str) {
    let end_position =
      self.add_type_and_explicit_start(&TYPE_IDENTIFIER, start, IDENTIFIER_RESERVED_BYTES);
    // name
    self.convert_string(name, end_position + IDENTIFIER_NAME_OFFSET);
    // end
    self.add_explicit_end(end_position, end);
  }
}
