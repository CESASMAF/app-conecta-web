// Brand<T, Tag> — Nominal typing via phantom tag.
// Prevents mixing structurally identical types (e.g., CPF vs NIS).

declare const __brand: unique symbol;

export type Brand<T, Tag extends string> = T & {
  readonly [__brand]: Tag;
};
