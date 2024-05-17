use swc_ecma_ast::Super;

use crate::convert_ast::converter::ast_constants::{
  SUPER_ELEMENT_RESERVED_BYTES, TYPE_SUPER_ELEMENT,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub fn store_super_element(&mut self, super_token: &Super) {
    let end_position = self.add_type_and_start(
      &TYPE_SUPER_ELEMENT,
      &super_token.span,
      SUPER_ELEMENT_RESERVED_BYTES,
      false,
    );
    // end
    self.add_end(end_position, &super_token.span);
  }
}
