export function keptAttachments(
  stored: string[] | null | undefined,
  requested: string[],
): string[] {
  return (stored ?? []).filter((url) => requested.includes(url));
}

export function removedAttachments(
  stored: string[] | null | undefined,
  requested: string[],
): string[] {
  return (stored ?? []).filter((url) => !requested.includes(url));
}

export function pathsInFolder(paths: string[], folder: string): string[] {
  return paths.filter((path) => path.startsWith(`${folder}/`));
}

export function uploadableFiles(entries: FormDataEntryValue[]): File[] {
  return entries.filter(
    (entry): entry is File =>
      entry instanceof File && entry.name !== "undefined" && entry.size > 0,
  );
}
