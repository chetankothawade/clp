import { Op } from 'sequelize';
import db from '../../../../src/models/index.js';
import { BaseService } from '../../../../src/services/base.service.js';
import { buildPaginationMeta, getPaginationParams } from '../../../../src/services/pagination.service.js';

const { Purchase, Redemption, Reward, User, sequelize } = db;

const rewardInclude = [{
  model: Reward,
  as: 'reward',
  attributes: ['id', 'uuid', 'name', 'description', 'rewardType', 'pointsRequired', 'expiryDate'],
}];

const availableRewardWhere = (uuid) => ({
  uuid,
  status: 'active',
  stock: { [Op.gt]: 0 },
  [Op.or]: [{ expiryDate: null }, { expiryDate: { [Op.gte]: new Date() } }],
});

const getAvailablePoints = async (userId, transaction) => {
  const earned = Number(await Purchase.sum('pointsEarned', { where: { userId, status: 'completed' }, transaction })) || 0;
  const used = Number(await Redemption.sum('pointsUsed', { where: { userId, status: 'completed' }, transaction })) || 0;
  return earned - used;
};

export const redemptionService = {
  async createRedemption(userId, payload) {
    return sequelize.transaction(async (transaction) => {
      const user = await User.findByPk(userId, { transaction });
      if (!user) BaseService.throwError(404, 'error.not_found');

      const reward = await Reward.findOne({
        where: availableRewardWhere(payload.reward_uuid),
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!reward) BaseService.throwError(404, 'redemption.reward_not_available');

      const availablePoints = await getAvailablePoints(userId, transaction);
      if (availablePoints < reward.pointsRequired) BaseService.throwError(422, 'redemption.insufficient_points');

      const redemption = await Redemption.create({
        userId,
        rewardId: reward.id,
        pointsUsed: reward.pointsRequired,
        redeemedAt: new Date(),
        status: 'completed',
      }, { transaction });

      reward.stock -= 1;
      await reward.save({ transaction });
      return redemption;
    });
  },

  async listRedemptions(userId, query) {
    const { page, limit, offset, sortedField, sortedBy } = getPaginationParams(query, { sortedField: 'redeemedAt' });
    const { count, rows } = await Redemption.findAndCountAll({
      where: { userId },
      include: rewardInclude,
      limit,
      offset,
      order: [[sortedField, sortedBy]],
      distinct: true,
    });
    return { redemptions: rows, pagination: buildPaginationMeta(count, page, limit) };
  },

  async getRedemption(userId, uuid) {
    const redemption = await Redemption.findOne({ where: { uuid, userId }, include: rewardInclude });
    if (!redemption) BaseService.throwError(404, 'error.not_found');
    return redemption;
  },
};
