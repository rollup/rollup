use swc_ecma_ast::ImportStarAsSpecifier;

use crate::convert_ast::converter::AstConverter;
use crate::store_import_namespace_specifier;

impl AstConverter<'_> {
  pub(crate) fn store_import_namespace_specifier(
    &mut self,
    import_namespace_specifier: &ImportStarAsSpecifier,
  ) {
    store_import_namespace_specifier!(
      self,
      span => &import_namespace_specifier.span,
      local => [import_namespace_specifier.local, convert_identifier]
    );
  }
}
