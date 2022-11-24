export const moveToFront = <T>(arr: T[], ...values: T[]) => {
  for (const value of values.reverse()) {
    const idx = arr.indexOf(value);
    const valueInstance = arr.splice(idx, 1);
    arr.unshift(...valueInstance);
  }
};
