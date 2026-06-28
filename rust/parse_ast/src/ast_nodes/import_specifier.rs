use swc_ecma_ast::ImportNamedSpecifier;

use crate::convert_ast::converter::{AstConverter, DeclarationKind};
use crate::store_import_specifier;

impl AstConverter<'_> {
  pub(crate) fn store_import_specifier(&mut self, import_named_specifier: &ImportNamedSpecifier) {
    store_import_specifier!(
      self,
      span => &import_named_specifier.span,
      imported => [import_named_specifier.imported, convert_module_export_name],
      local => [import_named_specifier.local, convert_imported_local_identifier]
    );
  }

  pub(crate) fn convert_imported_local_identifier(&mut self, identifier: &swc_ecma_ast::Ident) {
    self.with_declaration_kind(DeclarationKind::Lexical, |ast_converter| {
      ast_converter.convert_identifier(identifier);
    });
  }
}
