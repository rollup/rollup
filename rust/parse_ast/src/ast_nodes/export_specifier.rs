use swc_ecma_ast::ExportNamedSpecifier;

use crate::convert_ast::converter::AstConverter;
use crate::store_export_specifier;

impl AstConverter<'_> {
  pub(crate) fn store_export_specifier(&mut self, export_named_specifier: &ExportNamedSpecifier) {
    store_export_specifier!(
      self,
      span => &export_named_specifier.span,
      local => [export_named_specifier.orig, convert_module_export_name],
      exported => [*export_named_specifier, convert_exported_name]
    );
  }

  fn convert_exported_name(&mut self, specifier: &ExportNamedSpecifier) {
    match specifier.exported.as_ref() {
      Some(exported) => self.convert_module_export_name(exported),
      None => self.convert_module_export_name(&specifier.orig),
    }
  }
}
