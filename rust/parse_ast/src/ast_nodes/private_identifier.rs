use swc_ecma_ast::PrivateName;

use crate::convert_ast::converter::ast_constants::{
  PRIVATE_IDENTIFIER_NAME_OFFSET, PRIVATE_IDENTIFIER_RESERVED_BYTES, TYPE_PRIVATE_IDENTIFIER,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub fn store_private_identifier(&mut self, private_name: &PrivateName) {
    let end_position = self.add_type_and_start(
      &TYPE_PRIVATE_IDENTIFIER,
      &private_name.span,
      PRIVATE_IDENTIFIER_RESERVED_BYTES,
      false,
    );
    // name
    self.convert_string(
      &private_name.id.sym,
      end_position + PRIVATE_IDENTIFIER_NAME_OFFSET,
    );
    // end
    self.add_end(end_position, &private_name.span);
  }
}
