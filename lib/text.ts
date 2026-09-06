export const toTitleCase = (value: string) =>
  value.replace(/[A-Za-zÀ-ÖØ-öø-ÿ]+/g, (word) =>
    `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`,
  );
