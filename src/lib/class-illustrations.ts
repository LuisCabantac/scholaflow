export const classIllustrations = [
  "M1 1h46v62H1zM9 63V2M14 15h28M14 21h28M63 3v50l-4 8-4-8V3zM55 7h-4v10",
  "M4 3h40v58H4zM34 3v57M8 16H0M8 8H0M8 24H0M8 32H0M8 40H0M8 48H0M8 56H0M55 1v53l4 8 4-8V1zM55 11h8",
  "M63 3v50l-4 8-4-8V3zM55 7h-4v10M42 15v46H1V3h29zM8 13h12M8 23h27M8 31h27M8 39h27M8 47h27",
  "M22 1h16v62H22zM31 12h7M38 22h-3M38 42h-3M31 32h7M31 52h7M16 63V10l-4-8-4 8v53zM16 53H8M56 3v50l-4 8-4-8V3zM48 7h-4v10",
  "M36 5V1h-8v4h-4l-2 8h20l-2-8zM14 13h36v46H14z",
] as const;

export function classIllustration(index: number | null | undefined): string {
  return classIllustrations[index ?? 0] ?? classIllustrations[0];
}
