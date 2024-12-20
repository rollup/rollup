use swc_ecma_ast::{Expr, VarDeclarator};

use crate::convert_ast::annotations::AnnotationKind;
use crate::convert_ast::converter::ast_constants::{
  TYPE_VARIABLE_DECLARATOR, VARIABLE_DECLARATOR_ID_OFFSET, VARIABLE_DECLARATOR_INIT_OFFSET,
  VARIABLE_DECLARATOR_RESERVED_BYTES,
};
use crate::convert_ast::converter::AstConverter;

impl AstConverter<'_> {
  pub(crate) fn store_variable_declarator(&mut self, variable_declarator: &VarDeclarator) {
    let end_position = self.add_type_and_start(
      &TYPE_VARIABLE_DECLARATOR,
      &variable_declarator.span,
      VARIABLE_DECLARATOR_RESERVED_BYTES,
      false,
    );
    let forwarded_annotations = match &variable_declarator.init {
      Some(expression) => match &**expression {
        Expr::Arrow(_) => {
          let annotations = self
            .index_converter
            .take_collected_annotations(AnnotationKind::NoSideEffects);
          Some(annotations)
        }
        _ => None,
      },
      None => None,
    };
    // id
    self.update_reference_position(end_position + VARIABLE_DECLARATOR_ID_OFFSET);
    self.convert_pattern(&variable_declarator.name);
    // init
    if let Some(annotations) = forwarded_annotations {
      self.index_converter.add_collected_annotations(annotations);
    }
    if let Some(init) = variable_declarator.init.as_ref() {
      self.update_reference_position(end_position + VARIABLE_DECLARATOR_INIT_OFFSET);
      self.convert_expression(init);
    }
    // end
    self.add_end(end_position, &variable_declarator.span);
  }
}
