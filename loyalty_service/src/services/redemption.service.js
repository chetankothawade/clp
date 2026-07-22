import { Op } from 'sequelize';
import db from '../models/index.js';
import { BaseService } from './base.service.js';
import { buildPaginationMeta, getPaginationParams } from './pagination.service.js';

const { Purchase, Redemption, Reward, sequelize } = db;

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

const getAvailablePoints = async (userUuid, transaction) => {
  const earned = Number(await Purchase.sum('pointsEarned', { where: { userUuid, status: 'completed' }, transaction })) || 0;
  const used = Number(await Redemption.sum('pointsUsed', { where: { userUuid, status: 'completed' }, transaction })) || 0;
  return earned - used;
};

export const redemptionService = {
  async createRedemption(userUuid, payload) {
    return sequelize.transaction(async (transaction) => {
      const reward = await Reward.findOne({
        where: availableRewardWhere(payload.reward_uuid),
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!reward) BaseService.throwError(404, 'redemption.reward_not_available');

      const availablePoints = await getAvailablePoints(userUuid, transaction);
      if (availablePoints < reward.pointsRequired) BaseService.throwError(422, 'redemption.insufficient_points');

      const redemption = await Redemption.create({
        userUuid,
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

  async listRedemptions(userUuid, query) {
    const { page, limit, offset, sortedField, sortedBy } = getPaginationParams(query, { sortedField: 'redeemedAt' });
    const { count, rows } = await Redemption.findAndCountAll({
      where: { userUuid },
      include: rewardInclude,
      limit,
      offset,
      order: [[sortedField, sortedBy]],
      distinct: true,
    });
    return { redemptions: rows, pagination: buildPaginationMeta(count, page, limit) };
  },

  async getRedemption(userUuid, uuid) {
    const redemption = await Redemption.findOne({ where: { uuid, userUuid }, include: rewardInclude });
    if (!redemption) BaseService.throwError(404, 'error.not_found');
    return redemption;
  },
};
