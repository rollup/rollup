use swc_ecma_ast::Str;

use crate::convert_ast::converter::AstConverter;
use crate::store_literal_string;

impl AstConverter<'_> {
  pub(crate) fn store_literal_string(&mut self, literal: &Str) {
    store_literal_string!(
      self,
      span => &literal.span,
      value => literal.value.as_atom().map_or("", |atom| atom.as_ref()),
      raw => &literal.raw
    );
  }
}
