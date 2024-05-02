use swc_common::Span;
use swc_ecma_ast::{ClassExpr, Expr, FnExpr};

use crate::convert_ast::converter::ast_constants::{
  EXPORT_DEFAULT_DECLARATION_DECLARATION_OFFSET, EXPORT_DEFAULT_DECLARATION_RESERVED_BYTES,
  TYPE_CLASS_DECLARATION, TYPE_EXPORT_DEFAULT_DECLARATION, TYPE_FUNCTION_DECLARATION,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub fn store_export_default_declaration(
    &mut self,
    span: &Span,
    expression: StoredDefaultExportExpression,
  ) {
    let end_position = self.add_type_and_start(
      &TYPE_EXPORT_DEFAULT_DECLARATION,
      span,
      EXPORT_DEFAULT_DECLARATION_RESERVED_BYTES,
      matches!(
        expression,
        StoredDefaultExportExpression::Expression(Expr::Fn(_) | Expr::Arrow(_))
          | StoredDefaultExportExpression::Function(_)
      ),
    );
    // declaration
    self.update_reference_position(end_position + EXPORT_DEFAULT_DECLARATION_DECLARATION_OFFSET);
    match expression {
      StoredDefaultExportExpression::Expression(expression) => {
        self.convert_expression(expression);
      }
      StoredDefaultExportExpression::Class(class_expression) => {
        self.store_class_expression(class_expression, &TYPE_CLASS_DECLARATION)
      }
      StoredDefaultExportExpression::Function(function_expression) => self.convert_function(
        &function_expression.function,
        &TYPE_FUNCTION_DECLARATION,
        function_expression.ident.as_ref(),
      ),
    }
    // end
    self.add_end(end_position, span);
  }
}

pub enum StoredDefaultExportExpression<'a> {
  Expression(&'a Expr),
  Class(&'a ClassExpr),
  Function(&'a FnExpr),
}
