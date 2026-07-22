'use strict';

import { randomUUID } from 'crypto';

const REWARD_NAMES = ['Coffee Reward', 'Shopping Voucher', 'Premium Gift'];

export async function up(queryInterface) {
  const [existingRewards] = await queryInterface.sequelize.query(
    "SELECT id FROM rewards WHERE name IN ('Coffee Reward', 'Shopping Voucher', 'Premium Gift')"
  );
  if (existingRewards.length) return;

  const now = new Date();
  const expiryDate = new Date(now);
  expiryDate.setFullYear(expiryDate.getFullYear() + 1);

  return queryInterface.bulkInsert('rewards', [
    {
      uuid: randomUUID(), name: REWARD_NAMES[0], description: 'coffee reward.', reward_type: 'voucher',
      points_required: 100, stock: 20, expiry_date: expiryDate, status: 'active', created_at: now, updated_at: now,
    },
    {
      uuid: randomUUID(), name: REWARD_NAMES[1], description: 'shopping voucher reward.', reward_type: 'voucher',
      points_required: 250, stock: 15, expiry_date: expiryDate, status: 'active', created_at: now, updated_at: now,
    },
    {
      uuid: randomUUID(), name: REWARD_NAMES[2], description: 'premium gift reward.', reward_type: 'gift',
      points_required: 500, stock: 10, expiry_date: expiryDate, status: 'active', created_at: now, updated_at: now,
    },
  ]);
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.bulkDelete('rewards', { name: { [Sequelize.Op.in]: REWARD_NAMES } });
}
