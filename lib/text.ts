export const toTitleCase = (value: string) =>
  value.replace(/[A-Za-zÀ-ÖØ-öø-ÿ]+/g, (word) =>
    `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`,
  );

export const formatProfileName = (profile: {
  firstName?: string | null;
  middleInitial?: string | null;
  lastName?: string | null;
  extensionName?: string | null;
}) =>
  [
    profile.firstName?.trim(),
    profile.middleInitial?.trim() ? `${profile.middleInitial.trim().charAt(0)}.` : null,
    profile.lastName?.trim(),
    profile.extensionName?.trim(),
  ]
    .filter(Boolean)
    .join(" ");
