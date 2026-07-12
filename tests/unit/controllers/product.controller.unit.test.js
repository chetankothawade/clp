import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { createMockReq, createMockRes } from "../../helpers/mocks.js";

const sendResponse = jest.fn();
const handleError = jest.fn();
const productService = {
  listProducts: jest.fn(),
  createProduct: jest.fn(),
  getProduct: jest.fn(),
  updateProduct: jest.fn(),
  updateProductStatus: jest.fn(),
};

jest.unstable_mockModule("../../../src/utils/response.js", () => ({
  sendResponse,
  handleError,
}));

jest.unstable_mockModule("../../../src/services/product.service.js", () => ({
  productService,
}));

const {
  listProducts,
  createProduct,
  getProduct,
  updateProduct,
  updateProductStatus,
} = await import("../../../src/controllers/product.controller.js");

describe("product.controller unit", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("listProducts should call productService with query params", async () => {
    const req = createMockReq({ query: { search: "tea", page: 1 } });
    const res = createMockRes();
    productService.listProducts.mockResolvedValue({ products: [], pagination: { total: 0 } });

    await listProducts(req, res);

    expect(productService.listProducts).toHaveBeenCalledWith(req.query);
    expect(sendResponse).toHaveBeenCalledWith(
      res,
      200,
      true,
      "product.list.success",
      { products: [], pagination: { total: 0 } }
    );
  });

  it("createProduct should delegate to service and send success response", async () => {
    const req = createMockReq({ body: { name: "Tea", price: 25 } });
    const res = createMockRes();
    productService.createProduct.mockResolvedValue({ id: 1, name: "Tea" });

    await createProduct(req, res);

    expect(productService.createProduct).toHaveBeenCalledWith(req.body);
    expect(sendResponse).toHaveBeenCalledWith(
      res,
      201,
      true,
      "product.create.success",
      { product: { id: 1, name: "Tea" } }
    );
  });

  it("getProduct should return product details", async () => {
    const req = createMockReq({ params: { uuid: "uuid-1" } });
    const res = createMockRes();
    productService.getProduct.mockResolvedValue({ id: 1, name: "Tea" });

    await getProduct(req, res);

    expect(productService.getProduct).toHaveBeenCalledWith(req.params.uuid);
    expect(sendResponse).toHaveBeenCalledWith(
      res,
      200,
      true,
      "product.get.success",
      { product: { id: 1, name: "Tea" } }
    );
  });

  it("updateProduct should forward the update payload", async () => {
    const req = createMockReq({ params: { uuid: "uuid-1" }, body: { name: "Green Tea" } });
    const res = createMockRes();
    productService.updateProduct.mockResolvedValue({ id: 1, name: "Green Tea" });

    await updateProduct(req, res);

    expect(productService.updateProduct).toHaveBeenCalledWith(req.params.uuid, req.body);
    expect(sendResponse).toHaveBeenCalledWith(
      res,
      200,
      true,
      "product.update.success",
      { product: { id: 1, name: "Green Tea" } }
    );
  });

  it("updateProductStatus should route errors through handleError", async () => {
    const req = createMockReq({ params: { uuid: "uuid-1" }, body: { status: true } });
    const res = createMockRes();
    const error = new Error("bad");
    productService.updateProductStatus.mockRejectedValue(error);

    await updateProductStatus(req, res);

    expect(handleError).toHaveBeenCalledWith(
      req,
      res,
      error,
      expect.objectContaining({ logPrefix: "Update product status error:" })
    );
  });
});
