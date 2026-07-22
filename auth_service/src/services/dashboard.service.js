import { Op } from 'sequelize';
import db from '../models/index.js';
import { BaseService } from './base.service.js';

const { Product, Purchase, Redemption, Reward, User } = db;

const completedPurchaseWhere = (userId) => ({ userId, status: 'completed' });
const completedRedemptionWhere = (userId) => ({ userId, status: 'completed' });
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
  async getDashboard(userId) {
    const purchaseWhere = completedPurchaseWhere(userId);
    const redemptionWhere = completedRedemptionWhere(userId);

    const [
      user,
      totalPurchases,
      totalAmountSpent,
      totalPointsEarned,
      totalRewardsRedeemed,
      totalPointsRedeemed,
      recentPurchases,
      recentRedemptions,
      availableRewards,
    ] = await Promise.all([
      User.findByPk(userId, { attributes: ['uuid', 'name', 'email'] }),
      Purchase.count({ where: purchaseWhere }),
      Purchase.sum('totalAmount', { where: purchaseWhere }),
      Purchase.sum('pointsEarned', { where: purchaseWhere }),
      Redemption.count({ where: redemptionWhere }),
      Redemption.sum('pointsUsed', { where: redemptionWhere }),
      Purchase.findAll({
        where: purchaseWhere,
        include: [{ model: Product, as: 'product', attributes: ['name'] }],
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

    if (!user) BaseService.throwError(404, 'error.not_found');

    const earnedPoints = toNumber(totalPointsEarned);
    const redeemedPoints = toNumber(totalPointsRedeemed);

    return {
      user,
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
        productName: purchase.product?.name || null,
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
