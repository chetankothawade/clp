import { jest, describe, beforeEach, it, expect } from "@jest/globals";

const Category = {
  findAll: jest.fn(),
};

jest.unstable_mockModule("../../../src/models/index.js", () => ({
  default: { Category },
}));

const { categoryService } = await import("../../../src/services/category.service.js");

describe("category.service unit", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("getCategoryList should fetch top-level categories", async () => {
    const rows = [{ id: 1, uuid: "cat-1", name: "Category A" }];
    Category.findAll.mockResolvedValue(rows);

    const result = await categoryService.getCategoryList();

    expect(Category.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.any(Object),
      })
    );
    expect(result).toEqual(rows);
  });
});
