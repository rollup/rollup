use swc_ecma_ast::Regex;

use crate::convert_ast::converter::ast_constants::{
  LITERAL_REG_EXP_FLAGS_OFFSET, LITERAL_REG_EXP_PATTERN_OFFSET, LITERAL_REG_EXP_RESERVED_BYTES,
  TYPE_LITERAL_REG_EXP,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub fn store_literal_regex(&mut self, regex: &Regex) {
    let end_position = self.add_type_and_start(
      &TYPE_LITERAL_REG_EXP,
      &regex.span,
      LITERAL_REG_EXP_RESERVED_BYTES,
      false,
    );
    // flags
    self.convert_string(&regex.flags, end_position + LITERAL_REG_EXP_FLAGS_OFFSET);
    // pattern
    self.convert_string(&regex.exp, end_position + LITERAL_REG_EXP_PATTERN_OFFSET);
    // end
    self.add_end(end_position, &regex.span);
  }
}
