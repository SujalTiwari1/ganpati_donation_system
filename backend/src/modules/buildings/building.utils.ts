

export const normalizeBuildingName = (
    name: string
): string =>
    name
        .trim()
        .replace(/\s+/g, " ")
        .toLowerCase();


