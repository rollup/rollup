// This file is generated by scripts/generate-ast-macros.js.
// Do not edit this file directly.

#[macro_export]
macro_rules! store_arrow_function_expression_flags {
  ($self:expr, $end_position:expr, async => $async_value:expr, expression => $expression_value:expr, generator => $generator_value:expr) => {
    let _: &mut AstConverter = $self;
    let _: usize = $end_position;
    let mut flags = 0u32;
    if $async_value {
      flags |= 1;
    }
    if $expression_value {
      flags |= 2;
    }
    if $generator_value {
      flags |= 4;
    }
    let flags_position = $end_position + 4;
    $self.buffer[flags_position..flags_position + 4].copy_from_slice(&flags.to_ne_bytes());
  };
}

#[macro_export]
macro_rules! store_call_expression_flags {
  ($self:expr, $end_position:expr, optional => $optional_value:expr) => {
    let _: &mut AstConverter = $self;
    let _: usize = $end_position;
    let mut flags = 0u32;
    if $optional_value {
      flags |= 1;
    }
    let flags_position = $end_position + 4;
    $self.buffer[flags_position..flags_position + 4].copy_from_slice(&flags.to_ne_bytes());
  };
}

#[macro_export]
macro_rules! store_for_of_statement_flags {
  ($self:expr, $end_position:expr, await => $await_value:expr) => {
    let _: &mut AstConverter = $self;
    let _: usize = $end_position;
    let mut flags = 0u32;
    if $await_value {
      flags |= 1;
    }
    let flags_position = $end_position + 4;
    $self.buffer[flags_position..flags_position + 4].copy_from_slice(&flags.to_ne_bytes());
  };
}

#[macro_export]
macro_rules! store_function_declaration_flags {
  ($self:expr, $end_position:expr, async => $async_value:expr, generator => $generator_value:expr) => {
    let _: &mut AstConverter = $self;
    let _: usize = $end_position;
    let mut flags = 0u32;
    if $async_value {
      flags |= 1;
    }
    if $generator_value {
      flags |= 2;
    }
    let flags_position = $end_position + 4;
    $self.buffer[flags_position..flags_position + 4].copy_from_slice(&flags.to_ne_bytes());
  };
}

#[macro_export]
macro_rules! store_literal_boolean_flags {
  ($self:expr, $end_position:expr, value => $value_value:expr) => {
    let _: &mut AstConverter = $self;
    let _: usize = $end_position;
    let mut flags = 0u32;
    if $value_value {
      flags |= 1;
    }
    let flags_position = $end_position + 4;
    $self.buffer[flags_position..flags_position + 4].copy_from_slice(&flags.to_ne_bytes());
  };
}

#[macro_export]
macro_rules! store_member_expression_flags {
  ($self:expr, $end_position:expr, computed => $computed_value:expr, optional => $optional_value:expr) => {
    let _: &mut AstConverter = $self;
    let _: usize = $end_position;
    let mut flags = 0u32;
    if $computed_value {
      flags |= 1;
    }
    if $optional_value {
      flags |= 2;
    }
    let flags_position = $end_position + 4;
    $self.buffer[flags_position..flags_position + 4].copy_from_slice(&flags.to_ne_bytes());
  };
}

#[macro_export]
macro_rules! store_method_definition_flags {
  ($self:expr, $end_position:expr, static => $static_value:expr, computed => $computed_value:expr) => {
    let _: &mut AstConverter = $self;
    let _: usize = $end_position;
    let mut flags = 0u32;
    if $static_value {
      flags |= 1;
    }
    if $computed_value {
      flags |= 2;
    }
    let flags_position = $end_position + 4;
    $self.buffer[flags_position..flags_position + 4].copy_from_slice(&flags.to_ne_bytes());
  };
}

#[macro_export]
macro_rules! store_property_flags {
  ($self:expr, $end_position:expr, method => $method_value:expr, shorthand => $shorthand_value:expr, computed => $computed_value:expr) => {
    let _: &mut AstConverter = $self;
    let _: usize = $end_position;
    let mut flags = 0u32;
    if $method_value {
      flags |= 1;
    }
    if $shorthand_value {
      flags |= 2;
    }
    if $computed_value {
      flags |= 4;
    }
    let flags_position = $end_position + 4;
    $self.buffer[flags_position..flags_position + 4].copy_from_slice(&flags.to_ne_bytes());
  };
}

#[macro_export]
macro_rules! store_property_definition_flags {
  ($self:expr, $end_position:expr, static => $static_value:expr, computed => $computed_value:expr) => {
    let _: &mut AstConverter = $self;
    let _: usize = $end_position;
    let mut flags = 0u32;
    if $static_value {
      flags |= 1;
    }
    if $computed_value {
      flags |= 2;
    }
    let flags_position = $end_position + 4;
    $self.buffer[flags_position..flags_position + 4].copy_from_slice(&flags.to_ne_bytes());
  };
}

#[macro_export]
macro_rules! store_template_element_flags {
  ($self:expr, $end_position:expr, tail => $tail_value:expr) => {
    let _: &mut AstConverter = $self;
    let _: usize = $end_position;
    let mut flags = 0u32;
    if $tail_value {
      flags |= 1;
    }
    let flags_position = $end_position + 4;
    $self.buffer[flags_position..flags_position + 4].copy_from_slice(&flags.to_ne_bytes());
  };
}

#[macro_export]
macro_rules! store_update_expression_flags {
  ($self:expr, $end_position:expr, prefix => $prefix_value:expr) => {
    let _: &mut AstConverter = $self;
    let _: usize = $end_position;
    let mut flags = 0u32;
    if $prefix_value {
      flags |= 1;
    }
    let flags_position = $end_position + 4;
    $self.buffer[flags_position..flags_position + 4].copy_from_slice(&flags.to_ne_bytes());
  };
}

#[macro_export]
macro_rules! store_yield_expression_flags {
  ($self:expr, $end_position:expr, delegate => $delegate_value:expr) => {
    let _: &mut AstConverter = $self;
    let _: usize = $end_position;
    let mut flags = 0u32;
    if $delegate_value {
      flags |= 1;
    }
    let flags_position = $end_position + 4;
    $self.buffer[flags_position..flags_position + 4].copy_from_slice(&flags.to_ne_bytes());
  };
}
