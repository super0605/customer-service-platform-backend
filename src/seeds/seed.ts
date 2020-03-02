export default interface Seed {
  name: string;
  /** test whether the seed should be applied or not */
  test: () => Promise<"apply" | "skip">;
  /** function to apply the seed */
  apply: () => Promise<void>;
}
