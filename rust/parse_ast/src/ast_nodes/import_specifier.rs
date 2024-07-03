use swc_ecma_ast::ImportNamedSpecifier;

use crate::convert_ast::converter::AstConverter;
use crate::store_import_specifier;

impl<'a> AstConverter<'a> {
  pub fn store_import_specifier(&mut self, import_named_specifier: &ImportNamedSpecifier) {
    store_import_specifier!(
      self,
      span => &import_named_specifier.span,
      imported => [import_named_specifier.imported, convert_module_export_name],
      local => [import_named_specifier.local, convert_identifier]
    );
  }
}
