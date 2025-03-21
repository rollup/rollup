use swc_common::{Span, Spanned};
use swc_ecma_ast::{
  ClassMethod, Constructor, Function, MethodKind, ParamOrTsParamProp, Pat, PrivateMethod,
  PrivateName, PropName,
};

use crate::convert_ast::converter::analyze_code::find_first_occurrence_outside_comment;
use crate::convert_ast::converter::ast_constants::{
  METHOD_DEFINITION_DECORATORS_OFFSET, METHOD_DEFINITION_KEY_OFFSET, METHOD_DEFINITION_KIND_OFFSET,
  METHOD_DEFINITION_RESERVED_BYTES, METHOD_DEFINITION_VALUE_OFFSET, TYPE_FUNCTION_EXPRESSION,
  TYPE_METHOD_DEFINITION,
};
use crate::convert_ast::converter::string_constants::{
  STRING_CONSTRUCTOR, STRING_GET, STRING_METHOD, STRING_SET,
};
use crate::convert_ast::converter::AstConverter;
use crate::store_method_definition_flags;

impl AstConverter<'_> {
  pub(crate) fn store_method_definition(
    &mut self,
    span: &Span,
    kind: &MethodKind,
    is_static: bool,
    key: PropOrPrivateName,
    is_computed: bool,
    function: &Function,
  ) {
    let end_position = self.add_type_and_start(
      &TYPE_METHOD_DEFINITION,
      span,
      METHOD_DEFINITION_RESERVED_BYTES,
      false,
    );
    // flags
    store_method_definition_flags!(self, end_position, static => is_static, computed => is_computed);
    // decorators
    self.convert_item_list(
      &function.decorators,
      end_position + METHOD_DEFINITION_DECORATORS_OFFSET,
      |ast_convertor, decorator| {
        ast_convertor.store_decorator(decorator);
        true
      },
    );
    // kind
    let kind_position = end_position + METHOD_DEFINITION_KIND_OFFSET;
    self.buffer[kind_position..kind_position + 4].copy_from_slice(match kind {
      MethodKind::Method => &STRING_METHOD,
      MethodKind::Getter => &STRING_GET,
      MethodKind::Setter => &STRING_SET,
    });
    // key
    self.update_reference_position(end_position + METHOD_DEFINITION_KEY_OFFSET);
    let key_end = match key {
      PropOrPrivateName::PropName(prop_name) => {
        self.convert_property_name(prop_name);
        prop_name.span().hi.0 - 1
      }
      PropOrPrivateName::PrivateName(private_name) => {
        self.store_private_identifier(private_name);
        private_name.span.hi.0 - 1
      }
    };
    // value
    self.update_reference_position(end_position + METHOD_DEFINITION_VALUE_OFFSET);
    let function_start = find_first_occurrence_outside_comment(self.code, b'(', key_end);
    let parameters: Vec<&Pat> = function.params.iter().map(|param| &param.pat).collect();
    self.store_function_node(
      &TYPE_FUNCTION_EXPRESSION,
      function_start,
      function.span.hi.0 - 1,
      function.is_async,
      function.is_generator,
      None,
      &parameters,
      function.body.as_ref().unwrap(),
      false,
    );
    // end
    self.add_end(end_position, span);
  }

  pub(crate) fn convert_constructor(&mut self, constructor: &Constructor) {
    let end_position = self.add_type_and_start(
      &TYPE_METHOD_DEFINITION,
      &constructor.span,
      METHOD_DEFINITION_RESERVED_BYTES,
      false,
    );
    // key
    self.update_reference_position(end_position + METHOD_DEFINITION_KEY_OFFSET);
    self.convert_property_name(&constructor.key);
    // flags
    store_method_definition_flags!(self, end_position, static => false, computed => false);
    // kind
    let kind_position = end_position + METHOD_DEFINITION_KIND_OFFSET;
    self.buffer[kind_position..kind_position + 4].copy_from_slice(&STRING_CONSTRUCTOR);
    // value
    match &constructor.body {
      Some(block_statement) => {
        self.update_reference_position(end_position + METHOD_DEFINITION_VALUE_OFFSET);
        let key_end = constructor.key.span().hi.0 - 1;
        let function_start = find_first_occurrence_outside_comment(self.code, b'(', key_end);
        let parameters: Vec<&Pat> = constructor
          .params
          .iter()
          .map(|param| match param {
            ParamOrTsParamProp::Param(param) => &param.pat,
            ParamOrTsParamProp::TsParamProp(_) => panic!("TsParamProp in constructor"),
          })
          .collect();
        self.store_function_node(
          &TYPE_FUNCTION_EXPRESSION,
          function_start,
          block_statement.span.hi.0 - 1,
          false,
          false,
          None,
          &parameters,
          block_statement,
          false,
        );
      }
      None => {
        panic!("Getter property without body");
      }
    }
    // end
    self.add_end(end_position, &constructor.span);
  }

  pub(crate) fn convert_method(&mut self, method: &ClassMethod) {
    self.store_method_definition(
      &method.span,
      &method.kind,
      method.is_static,
      PropOrPrivateName::PropName(&method.key),
      matches!(method.key, PropName::Computed(_)),
      &method.function,
    );
  }

  pub(crate) fn convert_private_method(&mut self, private_method: &PrivateMethod) {
    self.store_method_definition(
      &private_method.span,
      &private_method.kind,
      private_method.is_static,
      PropOrPrivateName::PrivateName(&private_method.key),
      false,
      &private_method.function,
    );
  }
}

pub(crate) enum PropOrPrivateName<'a> {
  PropName(&'a PropName),
  PrivateName(&'a PrivateName),
}
