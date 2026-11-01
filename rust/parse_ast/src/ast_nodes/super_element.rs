use swc_ecma_ast::Super;

use crate::convert_ast::converter::AstConverter;
use crate::store_super;

impl AstConverter<'_> {
  pub(crate) fn store_super(&mut self, super_token: &Super) {
    store_super!(
      self,
      span => &super_token.span
    );
  }
}
