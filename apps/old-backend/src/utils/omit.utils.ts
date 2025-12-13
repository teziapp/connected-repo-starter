export const omitKeys = <T extends Record<string, unknown>>(obj: T, keys: string[]) => {
  const newObj = { ...obj };
  keys.forEach((key) => {
    delete newObj[key];
  });
  return newObj;
};