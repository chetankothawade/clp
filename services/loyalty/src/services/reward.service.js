import { Op } from 'sequelize';
import db from '../../../../src/models/index.js';
import { BaseService } from '../../../../src/services/base.service.js';
import { buildPaginationMeta, getPaginationParams } from '../../../../src/services/pagination.service.js';

const { Reward } = db;

const toRewardAttributes = (payload) => ({
  name: payload.name,
  description: payload.description || null,
  rewardType: payload.reward_type,
  pointsRequired: payload.points_required,
  stock: payload.stock,
  expiryDate: payload.expiry_date || null,
});

const customerAvailabilityWhere = () => ({
  status: 'active',
  stock: { [Op.gt]: 0 },
  [Op.or]: [{ expiryDate: null }, { expiryDate: { [Op.gte]: new Date() } }],
});

export const rewardService = {
  async listRewards(query, role) {
    const { page, limit, offset, sortedField, sortedBy } = getPaginationParams(query);
    const search = query.search?.trim();
    const isCustomer = role === 'user';
    const where = {
      ...(isCustomer ? customerAvailabilityWhere() : {}),
      ...(!isCustomer && query.status ? { status: query.status } : {}),
      ...(search ? { [Op.or]: [{ name: { [Op.iLike]: `%${search}%` } }, { rewardType: { [Op.iLike]: `%${search}%` } }] } : {}),
    };
    const { count, rows } = await Reward.findAndCountAll({ where, limit, offset, order: [[sortedField, sortedBy]] });
    return { rewards: rows, pagination: buildPaginationMeta(count, page, limit) };
  },

  createReward(payload) {
    return Reward.create(toRewardAttributes(payload));
  },

  async getReward(uuid, role) {
    const reward = await Reward.findOne({ where: { uuid, ...(role === 'user' ? customerAvailabilityWhere() : {}) } });
    if (!reward) BaseService.throwError(404, 'error.not_found');
    return reward;
  },
};
