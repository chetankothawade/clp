'use strict';

import { randomUUID } from 'crypto';

const REWARD_NAMES = ['Coffee Reward', 'Shopping Voucher', 'Premium Gift'];

const daysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

export async function up(queryInterface) {
  // Purchase seed data is required because each redemption consumes earned loyalty points.
  const [users] = await queryInterface.sequelize.query(
    "SELECT id FROM users WHERE role = 'user' ORDER BY id ASC LIMIT 2"
  );
  if (!users.length) throw new Error('Run the user seeder before the redemption seeder.');

  const [rewards] = await queryInterface.sequelize.query(
    "SELECT id, name, points_required, stock FROM rewards WHERE name IN ('Coffee Reward', 'Shopping Voucher', 'Premium Gift') ORDER BY id ASC"
  );
  if (rewards.length !== REWARD_NAMES.length) {
    throw new Error('Run the reward seeder before the redemption seeder.');
  }

  const rewardByName = Object.fromEntries(rewards.map((reward) => [reward.name, reward]));
  const rows = [
    { user: users[0], reward: rewardByName['Coffee Reward'], date: daysAgo(2) },
    { user: users[0], reward: rewardByName['Premium Gift'], date: daysAgo(1) },
    { user: users[Math.min(1, users.length - 1)], reward: rewardByName['Shopping Voucher'], date: daysAgo(1) },
  ];

  await queryInterface.bulkInsert('redemptions', rows.map(({ user, reward, date }) => ({
    uuid: randomUUID(),
    user_id: user.id,
    reward_id: reward.id,
    points_used: reward.points_required,
    redeemed_at: date,
    status: 'completed',
    created_at: date,
    updated_at: date,
  })));

  for (const reward of rewards) {
    const redeemedCount = rows.filter((row) => row.reward.id === reward.id).length;
    if (redeemedCount) {
      await queryInterface.bulkUpdate('rewards', { stock: Number(reward.stock) - redeemedCount, updated_at: new Date() }, { id: reward.id });
    }
  }
}

export async function down(queryInterface, Sequelize) {
  const [rewards] = await queryInterface.sequelize.query(
    "SELECT id FROM rewards WHERE name IN ('Coffee Reward', 'Shopping Voucher', 'Premium Gift')"
  );
  if (rewards.length) {
    const rewardIds = rewards.map((reward) => reward.id);
    const [redemptionCounts] = await queryInterface.sequelize.query(
      'SELECT reward_id, COUNT(*)::integer AS count FROM redemptions WHERE reward_id IN (:rewardIds) GROUP BY reward_id',
      { replacements: { rewardIds } }
    );
    await queryInterface.bulkDelete('redemptions', { reward_id: { [Sequelize.Op.in]: rewardIds } });
    for (const row of redemptionCounts) {
      await queryInterface.sequelize.query(
        'UPDATE rewards SET stock = stock + :count, updated_at = :updatedAt WHERE id = :id',
        { replacements: { count: Number(row.count), updatedAt: new Date(), id: row.reward_id } }
      );
    }
  }
}
