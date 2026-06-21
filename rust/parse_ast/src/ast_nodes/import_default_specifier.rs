use swc_ecma_ast::ImportDefaultSpecifier;

use crate::convert_ast::converter::{AstConverter, DeclarationKind};
use crate::store_import_default_specifier;

impl AstConverter<'_> {
  pub(crate) fn store_import_default_specifier(
    &mut self,
    import_default_specifier: &ImportDefaultSpecifier,
  ) {
    self.with_declaration_kind(DeclarationKind::Lexical, |ast_converter| {
      store_import_default_specifier!(
        ast_converter,
        span => &import_default_specifier.span,
        local => [import_default_specifier.local, convert_identifier]
      );
    });
  }
}
