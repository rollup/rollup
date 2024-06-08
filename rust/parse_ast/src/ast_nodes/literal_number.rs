use swc_ecma_ast::Number;

use crate::convert_ast::converter::AstConverter;
use crate::store_literal_number;

impl<'a> AstConverter<'a> {
  pub fn store_literal_number(&mut self, literal: &Number) {
    store_literal_number!(
      self,
      span => &literal.span,
      raw => literal.raw,
      value => literal.value
    );
  }
}
