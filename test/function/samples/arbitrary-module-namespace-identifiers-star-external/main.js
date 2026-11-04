export * from '*external';

const value = 'local';
export { value as '*external' };
