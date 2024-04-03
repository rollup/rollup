export default {
  input: "main.js",
  plugins: [
    {
      buildStart() {
        throw new Error("Outer error", {
          cause: new Error("Inner error", {
            cause: new Error("Innermost error")
          })
        });
      }
    }
  ]
};
