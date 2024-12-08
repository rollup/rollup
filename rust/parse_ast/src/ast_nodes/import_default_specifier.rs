use swc_ecma_ast::ImportDefaultSpecifier;

use crate::convert_ast::converter::AstConverter;
use crate::store_import_default_specifier;

impl AstConverter<'_> {
  pub(crate) fn store_import_default_specifier(
    &mut self,
    import_default_specifier: &ImportDefaultSpecifier,
  ) {
    store_import_default_specifier!(
      self,
      span => &import_default_specifier.span,
      local => [import_default_specifier.local, convert_identifier]
    );
  }
}
