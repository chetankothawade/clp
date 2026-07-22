import { Op } from 'sequelize';
import db from '../models/index.js';
const { Purchase, Redemption, Reward } = db;

const completedPurchaseWhere = (userUuid) => ({ userUuid, status: 'completed' });
const completedRedemptionWhere = (userUuid) => ({ userUuid, status: 'completed' });
const availableRewardWhere = () => ({
  status: 'active',
  stock: { [Op.gt]: 0 },
  [Op.or]: [{ expiryDate: null }, { expiryDate: { [Op.gte]: new Date() } }],
});
const toNumber = (value) => Number(value) || 0;

/**
 * Builds the compact loyalty overview for one authenticated customer.
 */
export const dashboardService = {
  async getDashboard(userUuid) {
    const purchaseWhere = completedPurchaseWhere(userUuid);
    const redemptionWhere = completedRedemptionWhere(userUuid);

    const [
      totalPurchases,
      totalAmountSpent,
      totalPointsEarned,
      totalRewardsRedeemed,
      totalPointsRedeemed,
      recentPurchases,
      recentRedemptions,
      availableRewards,
    ] = await Promise.all([
      Purchase.count({ where: purchaseWhere }),
      Purchase.sum('totalAmount', { where: purchaseWhere }),
      Purchase.sum('pointsEarned', { where: purchaseWhere }),
      Redemption.count({ where: redemptionWhere }),
      Redemption.sum('pointsUsed', { where: redemptionWhere }),
      Purchase.findAll({
        where: purchaseWhere,
        order: [['purchaseDate', 'DESC']],
        limit: 5,
      }),
      Redemption.findAll({
        where: redemptionWhere,
        include: [{ model: Reward, as: 'reward', attributes: ['name'] }],
        order: [['redeemedAt', 'DESC']],
        limit: 5,
      }),
      Reward.count({ where: availableRewardWhere() }),
    ]);

    const earnedPoints = toNumber(totalPointsEarned);
    const redeemedPoints = toNumber(totalPointsRedeemed);

    return {
      user: { uuid: userUuid },
      summary: {
        totalPurchases,
        totalAmountSpent: toNumber(totalAmountSpent),
        totalPointsEarned: earnedPoints,
        totalRewardsRedeemed,
        totalPointsRedeemed: redeemedPoints,
        availablePoints: earnedPoints - redeemedPoints,
      },
      recentPurchases: recentPurchases.map((purchase) => ({
        purchaseUuid: purchase.uuid,
        productName: purchase.productName,
        quantity: purchase.quantity,
        amount: toNumber(purchase.totalAmount),
        pointsEarned: purchase.pointsEarned,
        purchaseDate: purchase.purchaseDate,
      })),
      recentRedemptions: recentRedemptions.map((redemption) => ({
        redemptionUuid: redemption.uuid,
        rewardName: redemption.reward?.name || null,
        pointsUsed: redemption.pointsUsed,
        redeemedAt: redemption.redeemedAt,
      })),
      availableRewards,
    };
  },
};
