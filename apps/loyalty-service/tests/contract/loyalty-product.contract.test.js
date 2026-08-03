import { jest } from "@jest/globals";

const transaction = jest.fn(async (callback) => callback({}));
const Purchase = {
  create: jest.fn(async (payload) => ({ uuid: "purchase-uuid", ...payload })),
};
const IdempotencyKey = {
  create: jest.fn(),
  findOne: jest.fn(),
};

jest.unstable_mockModule("../../src/models/index.js", () => ({
  default: {
    Purchase,
    IdempotencyKey,
    sequelize: { transaction },
  },
}));

jest.unstable_mockModule("../../src/utils/logger.js", () => ({
  default: { info: jest.fn(), error: jest.fn() },
  logger: { info: jest.fn(), error: jest.fn() },
}));

const { purchaseService } = await import("../../src/services/purchase.service.js");

describe("Loyalty to Product purchase-details contract", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.PRODUCT_SERVICE_URL = "http://product-service";
    process.env.INTERNAL_SERVICE_KEY = "internal-secret";
    IdempotencyKey.findOne.mockResolvedValue(null);
  });

  it("fetches purchasable product data and stores the snapshot in loyalty_db", async () => {
    const product = {
      uuid: "00000000-0000-4000-8000-000000000111",
      name: "Coffee",
      sku: "COF-1",
      status: "active",
      price: "10.00",
      loyalty_points: 5,
    };
    global.fetch = jest.fn(async () => new Response(JSON.stringify({ success: true, data: { product }, requestId: "request-123" }), {
      status: 200,
      headers: { "content-type": "application/json" },
    }));

    await purchaseService.createPurchase(
      "00000000-0000-4000-8000-000000000007",
      { product_uuid: product.uuid, quantity: 2 },
      "request-123",
      "purchase-key-123",
    );

    expect(global.fetch).toHaveBeenCalledWith(
      "http://product-service/internal/products/00000000-0000-4000-8000-000000000111/purchase-details",
      expect.objectContaining({
        headers: {
          "X-Request-Id": "request-123",
          "X-Internal-Service-Key": "internal-secret",
        },
      }),
    );
    expect(Purchase.create).toHaveBeenCalledWith(expect.objectContaining({
      userUuid: "00000000-0000-4000-8000-000000000007",
      productUuid: product.uuid,
      productName: product.name,
      productSku: product.sku,
      unitPrice: "10.00",
      totalAmount: "20.00",
      pointsEarned: 10,
    }), expect.objectContaining({ transaction: {} }));
  });
});
