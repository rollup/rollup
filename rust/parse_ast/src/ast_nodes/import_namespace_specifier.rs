use swc_ecma_ast::ImportStarAsSpecifier;

use crate::convert_ast::converter::{AstConverter, DeclarationKind};
use crate::store_import_namespace_specifier;

impl AstConverter<'_> {
  pub(crate) fn store_import_namespace_specifier(
    &mut self,
    import_namespace_specifier: &ImportStarAsSpecifier,
  ) {
    self.with_declaration_kind(DeclarationKind::Lexical, |ast_converter| {
      store_import_namespace_specifier!(
        ast_converter,
        span => &import_namespace_specifier.span,
        local => [import_namespace_specifier.local, convert_identifier]
      );
    });
  }
}
