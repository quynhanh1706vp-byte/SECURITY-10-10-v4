export const noSpecialCharsRule = (message: string) => ({
  validator: (_: any, value: string) =>
    value && !/^[a-zA-Z0-9\s]*$/.test(value)
      ? Promise.reject(message)
      : Promise.resolve(),
});
