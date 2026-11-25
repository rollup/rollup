use crate::convert_ast::converter::ast_constants::WORD_SIZE;
use crate::convert_ast::converter::buffer_inventory_constants::{
  BUFFER_AST_OFFSET, BUFFER_SOURCEMAP_LOCATIONS_OFFSET,
};
use crate::convert_ast::converter::update_reference_position;

const BITS_PER_WORD: usize = u32::BITS as usize;

/// The bitset of source positions that sourcemap generation without "hires"
/// needs. Its words live directly in the buffer as `[word count][words…]`, so
/// the section is reserved before the AST is converted and only the word count
/// is patched afterwards.
pub(crate) struct SourcemapLocations {
  word_count_position: usize,
  reserved_word_count: usize,
  highest_registered_position: Option<usize>,
}

impl SourcemapLocations {
  /// Reserves the section directly behind the buffer inventory, which moves the
  /// AST root behind it.
  pub(crate) fn reserve(buffer: &mut Vec<u8>, code_byte_length: usize) -> Self {
    let word_count_position = buffer.len() / WORD_SIZE;
    update_reference_position(buffer, BUFFER_SOURCEMAP_LOCATIONS_OFFSET);
    // The UTF-16 length of the code never exceeds its UTF-8 byte length, so this
    // upper bound holds every position that can be registered.
    let reserved_word_count = code_byte_length / BITS_PER_WORD + 1;
    buffer.resize(buffer.len() + (reserved_word_count + 1) * WORD_SIZE, 0);
    update_reference_position(buffer, BUFFER_AST_OFFSET);
    Self {
      word_count_position,
      reserved_word_count,
      highest_registered_position: None,
    }
  }

  pub(crate) fn register(&mut self, buffer: &mut [u8], position: u32) {
    let position = position as usize;
    let word_index = position / BITS_PER_WORD;
    debug_assert!(
      word_index < self.reserved_word_count,
      "sourcemap location {position} is outside the reserved section"
    );
    if word_index >= self.reserved_word_count {
      return;
    }
    self.highest_registered_position = Some(
      self
        .highest_registered_position
        .map_or(position, |highest| highest.max(position)),
    );
    let word_offset = (self.word_count_position + 1 + word_index) * WORD_SIZE;
    let mut word = [0; WORD_SIZE];
    word.copy_from_slice(&buffer[word_offset..word_offset + WORD_SIZE]);
    let bits = u32::from_ne_bytes(word) | 1 << (position % BITS_PER_WORD);
    buffer[word_offset..word_offset + WORD_SIZE].copy_from_slice(&bits.to_ne_bytes());
  }

  /// Patches the word count to the words that are actually needed. For non-ASCII
  /// code these are fewer than the reserved ones, so the difference stays unused.
  pub(crate) fn write_word_count(&self, buffer: &mut [u8]) {
    let word_count = self
      .highest_registered_position
      .map_or(0, |highest| highest / BITS_PER_WORD + 1);
    let word_count_offset = self.word_count_position * WORD_SIZE;
    buffer[word_count_offset..word_count_offset + WORD_SIZE]
      .copy_from_slice(&(word_count as u32).to_ne_bytes());
  }
}
