use swc_ecma_ast::PrivateName;

use crate::convert_ast::converter::AstConverter;
use crate::store_private_identifier;

impl<'a> AstConverter<'a> {
  pub fn store_private_identifier(&mut self, private_name: &PrivateName) {
    store_private_identifier!(
      self,
      span => &private_name.span,
      name => &private_name.name
    );
  }
}
