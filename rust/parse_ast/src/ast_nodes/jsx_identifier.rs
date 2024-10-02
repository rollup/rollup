use swc_common::Span;

use crate::convert_ast::converter::AstConverter;
use crate::store_jsx_identifier;

impl<'a> AstConverter<'a> {
  pub(crate) fn store_jsx_identifier(&mut self, span: &Span, name: &str) {
    store_jsx_identifier!(
      self,
      span => span,
      name => name
    );
  }
}
