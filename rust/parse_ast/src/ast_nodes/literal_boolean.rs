use swc_ecma_ast::Bool;

use crate::convert_ast::converter::AstConverter;
use crate::{store_literal_boolean, store_literal_boolean_flags};

impl<'a> AstConverter<'a> {
  pub fn store_literal_boolean(&mut self, literal: &Bool) {
    store_literal_boolean!(
      self,
      span => &literal.span,
      value => literal.value
    );
  }
}
