import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { createMockReq, createMockRes } from "../../helpers/mocks.js";

const sendResponse = jest.fn();
const handleError = jest.fn();
const purchaseService = {
  createPurchase: jest.fn(),
  listPurchases: jest.fn(),
  getPurchase: jest.fn(),
};

jest.unstable_mockModule("../../../src/utils/response.js", () => ({
  sendResponse,
  handleError,
}));

jest.unstable_mockModule("../../../src/services/purchase.service.js", () => ({
  purchaseService,
}));

const { createPurchase, listPurchases, getPurchase } = await import("../../../src/controllers/purchase.controller.js");

describe("purchase.controller unit", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("createPurchase should delegate to service and send success response", async () => {
    const req = createMockReq({ user: { id: 7 }, body: { amount: 120 } });
    const res = createMockRes();
    purchaseService.createPurchase.mockResolvedValue({ id: 1, amount: 120 });

    await createPurchase(req, res);

    expect(purchaseService.createPurchase).toHaveBeenCalledWith(req.user.id, req.body);
    expect(sendResponse).toHaveBeenCalledWith(
      res,
      201,
      true,
      "purchase.create.success",
      { purchase: { id: 1, amount: 120 } }
    );
  });

  it("listPurchases should pass the current user and query to the service", async () => {
    const req = createMockReq({ user: { id: 7 }, query: { page: 1 } });
    const res = createMockRes();
    purchaseService.listPurchases.mockResolvedValue({ purchases: [], pagination: { total: 0 } });

    await listPurchases(req, res);

    expect(purchaseService.listPurchases).toHaveBeenCalledWith(req.user.id, req.query);
    expect(sendResponse).toHaveBeenCalledWith(
      res,
      200,
      true,
      "purchase.list.success",
      { purchases: [], pagination: { total: 0 } }
    );
  });

  it("getPurchase should return the requested purchase", async () => {
    const req = createMockReq({ user: { id: 7 }, params: { uuid: "p-1" } });
    const res = createMockRes();
    purchaseService.getPurchase.mockResolvedValue({ id: 1, uuid: "p-1" });

    await getPurchase(req, res);

    expect(purchaseService.getPurchase).toHaveBeenCalledWith(req.user.id, req.params.uuid);
    expect(sendResponse).toHaveBeenCalledWith(
      res,
      200,
      true,
      "purchase.get.success",
      { purchase: { id: 1, uuid: "p-1" } }
    );
  });

  it("createPurchase should route errors through handleError", async () => {
    const req = createMockReq({ user: { id: 7 }, body: { amount: 120 } });
    const res = createMockRes();
    const error = new Error("bad");
    purchaseService.createPurchase.mockRejectedValue(error);

    await createPurchase(req, res);

    expect(handleError).toHaveBeenCalledWith(
      req,
      res,
      error,
      expect.objectContaining({ logPrefix: "Create purchase error:" })
    );
  });
});
