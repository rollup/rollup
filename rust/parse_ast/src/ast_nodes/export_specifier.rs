use swc_ecma_ast::ExportNamedSpecifier;

use crate::convert_ast::converter::AstConverter;
use crate::store_export_specifier;

impl AstConverter<'_> {
  pub(crate) fn store_export_specifier(&mut self, export_named_specifier: &ExportNamedSpecifier) {
    store_export_specifier!(
      self,
      span => &export_named_specifier.span,
      local => [export_named_specifier.orig, convert_module_export_name],
      exported => [export_named_specifier.exported, convert_module_export_name]
    );
  }
}
