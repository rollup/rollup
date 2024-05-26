use swc_ecma_ast::RestPat;

use crate::convert_ast::converter::ast_constants::{
  REST_ELEMENT_ARGUMENT_OFFSET, REST_ELEMENT_RESERVED_BYTES, TYPE_REST_ELEMENT,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub fn store_rest_element(&mut self, rest_pattern: &RestPat) {
    let end_position = self.add_type_and_start(
      &TYPE_REST_ELEMENT,
      &rest_pattern.dot3_token,
      REST_ELEMENT_RESERVED_BYTES,
      false,
    );
    // argument
    self.update_reference_position(end_position + REST_ELEMENT_ARGUMENT_OFFSET);
    self.convert_pattern(&rest_pattern.arg);
    // end
    self.add_end(end_position, &rest_pattern.span);
  }
}
