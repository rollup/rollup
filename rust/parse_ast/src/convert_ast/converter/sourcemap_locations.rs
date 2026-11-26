use crate::convert_ast::converter::update_reference_position;

const BITS_PER_WORD: usize = u32::BITS as usize;

/// The bitset of source positions that sourcemap generation without "hires"
/// needs. It is collected in a vector and appended to the buffer after
/// conversion, like the walking info.
pub(crate) struct SourcemapLocations {
  words: Vec<u32>,
}

impl SourcemapLocations {
  pub(crate) fn new(code_byte_length: usize) -> Self {
    // The UTF-16 length of the code never exceeds its UTF-8 byte length, so
    // this capacity holds every position that can be registered.
    Self {
      words: Vec::with_capacity(code_byte_length / BITS_PER_WORD + 1),
    }
  }

  pub(crate) fn register(&mut self, position: u32) {
    let position = position as usize;
    let word_index = position / BITS_PER_WORD;
    if word_index >= self.words.len() {
      self.words.resize(word_index + 1, 0);
    }
    self.words[word_index] |= 1 << (position % BITS_PER_WORD);
  }

  /// Appends the section as `[word count][words…]` and points the inventory at
  /// it.
  pub(crate) fn append_to_buffer(&self, buffer: &mut Vec<u8>, reference_byte_offset: usize) {
    update_reference_position(buffer, reference_byte_offset);
    buffer.extend_from_slice(&(self.words.len() as u32).to_ne_bytes());
    for word in &self.words {
      buffer.extend_from_slice(&word.to_ne_bytes());
    }
  }
}
