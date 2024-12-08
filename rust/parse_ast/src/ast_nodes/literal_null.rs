use swc_ecma_ast::Null;

use crate::convert_ast::converter::AstConverter;
use crate::store_literal_null;

impl AstConverter<'_> {
  pub(crate) fn store_literal_null(&mut self, literal: &Null) {
    store_literal_null!(
      self,
      span => &literal.span
    );
  }
}
