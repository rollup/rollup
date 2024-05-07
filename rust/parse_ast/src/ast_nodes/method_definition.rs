use swc_common::Span;
use swc_ecma_ast::{
  ClassMethod, Constructor, Function, MethodKind, ParamOrTsParamProp, Pat, PrivateMethod,
  PrivateName, PropName,
};

use crate::convert_ast::converter::analyze_code::find_first_occurrence_outside_comment;
use crate::convert_ast::converter::ast_constants::{
  METHOD_DEFINITION_COMPUTED_FLAG, METHOD_DEFINITION_FLAGS_OFFSET, METHOD_DEFINITION_KEY_OFFSET,
  METHOD_DEFINITION_KIND_OFFSET, METHOD_DEFINITION_RESERVED_BYTES, METHOD_DEFINITION_STATIC_FLAG,
  METHOD_DEFINITION_VALUE_OFFSET, TYPE_FUNCTION_EXPRESSION, TYPE_METHOD_DEFINITION,
};
use crate::convert_ast::converter::string_constants::{
  STRING_CONSTRUCTOR, STRING_GET, STRING_METHOD, STRING_SET,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub fn store_method_definition(
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
    let mut flags = 0u32;
    if is_static {
      flags |= METHOD_DEFINITION_STATIC_FLAG
    };
    if is_computed {
      flags |= METHOD_DEFINITION_COMPUTED_FLAG;
    }
    let flags_position = end_position + METHOD_DEFINITION_FLAGS_OFFSET;
    self.buffer[flags_position..flags_position + 4].copy_from_slice(&flags.to_ne_bytes());
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
        self.get_property_name_span(prop_name).hi.0 - 1
      }
      PropOrPrivateName::PrivateName(private_name) => {
        self.store_private_identifier(private_name);
        private_name.id.span.hi.0 - 1
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

  pub fn convert_constructor(&mut self, constructor: &Constructor) {
    let end_position = self.add_type_and_start(
      &TYPE_METHOD_DEFINITION,
      &constructor.span,
      METHOD_DEFINITION_RESERVED_BYTES,
      false,
    );
    // key
    self.update_reference_position(end_position + METHOD_DEFINITION_KEY_OFFSET);
    self.convert_property_name(&constructor.key);
    // flags, method definitions are neither static nor computed
    let flags_position = end_position + METHOD_DEFINITION_FLAGS_OFFSET;
    self.buffer[flags_position..flags_position + 4].copy_from_slice(&0u32.to_ne_bytes());
    // kind
    let kind_position = end_position + METHOD_DEFINITION_KIND_OFFSET;
    self.buffer[kind_position..kind_position + 4].copy_from_slice(&STRING_CONSTRUCTOR);
    // value
    match &constructor.body {
      Some(block_statement) => {
        self.update_reference_position(end_position + METHOD_DEFINITION_VALUE_OFFSET);
        let key_end = self.get_property_name_span(&constructor.key).hi.0 - 1;
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

  pub fn convert_method(&mut self, method: &ClassMethod) {
    self.store_method_definition(
      &method.span,
      &method.kind,
      method.is_static,
      PropOrPrivateName::PropName(&method.key),
      matches!(method.key, PropName::Computed(_)),
      &method.function,
    );
  }

  pub fn convert_private_method(&mut self, private_method: &PrivateMethod) {
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

pub enum PropOrPrivateName<'a> {
  PropName(&'a PropName),
  PrivateName(&'a PrivateName),
}
