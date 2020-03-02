import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as sut from "src/utils";

describe("utils", () => {
  describe("isSubArray", () => {
    it("should return not found element", () => {
      const res = sut.findFirstMissingEl(["a", "b", "c"], ["a", "d"]);
      pipe(
        res,
        O.fold(
          () => expect(true).toBe(false),
          a => expect(a).toEqual("d")
        )
      );
    });

    it("should return none if all elements are there", () => {
      const res = sut.findFirstMissingEl(["a", "b", "c"], ["c", "b"]);
      expect(O.isNone(res)).toBe(true);
    });
  });

  describe("hasDefinedValues", () => {
    it("should return true for object with defined values", () => {
      const res = sut.hasDefinedValues({
        someValue: true,
        someOtherValue: undefined
      });
      expect(res).toEqual(true);
    });

    it("should return false for object with only undefined values", () => {
      const res = sut.hasDefinedValues({ someValue: undefined });
      expect(res).toEqual(false);
    });

    it("should return false for empty objects", () => {
      const res = sut.hasDefinedValues({});
      expect(res).toEqual(false);
    });
  });

  describe("groupBy", () => {
    it("should group by int", () => {
      const res = sut.groupBy(
        i => {
          if (i < 5) return ["less", i];
          if (i == 5) return ["equal", i];
          return ["more", i];
        },
        [1, 7, 3, 2, 5]
      );

      expect(res).toEqual({
        less: [1, 3, 2],
        more: [7],
        equal: [5]
      });
    });

    it("should group and tranform", () => {
      const res = sut.groupBy(
        i => {
          if (i < 5) return ["less", i + 1];
          if (i == 5) return ["equal", i + 1];
          return ["more", i + 2];
        },
        [1, 7, 3, 2, 5]
      );

      expect(res).toEqual({
        less: [2, 4, 3],
        more: [9],
        equal: [6]
      });
    });
  });

  describe("objectFromEntries", () => {
    it("should pass", () => {
      const res = sut.objectFromEntries([
        ["hello", "hhh"],
        ["asdf", "ggg"]
      ] as const);

      expect(res).toEqual({
        hello: "hhh",
        asdf: "ggg"
      });
    });
  });

  describe("uniquefyStringArray", () => {
    it("should pass", () => {
      const res = sut.uniquefyStringArray(["qwer", "asdf", "zxcv", "asdf"]);

      expect(res).toEqual(["asdf", "qwer", "zxcv"]);
    });
  });

  describe("generateUuid", () => {
    it("should not be same", () => {
      const a = sut.generateUuid();
      const b = sut.generateUuid();

      expect(a).not.toEqual(b);
    });
  });
});
