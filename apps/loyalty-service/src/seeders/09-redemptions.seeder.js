'use strict';

import { randomUUID } from 'crypto';
import { fetchUsers } from './helpers/db.helper.js';

const REWARD_NAMES = ['Coffee Reward', 'Shopping Voucher', 'Premium Gift'];

// Emails of the auth-service demo users used to locate their real UUIDs.
const USER_EMAILS = [
  'superadmin@yopmail.com',
  'admin@yopmail.com',
];

const daysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

export async function up(queryInterface) {
  const [existingRedemptions] = await queryInterface.sequelize.query(
    "SELECT id FROM redemptions WHERE reward_id IN (SELECT id FROM rewards WHERE name IN ('Coffee Reward', 'Shopping Voucher', 'Premium Gift'))"
  );
  if (existingRedemptions.length) return;

  const [rewards] = await queryInterface.sequelize.query(
    "SELECT id, name, points_required, stock FROM rewards WHERE name IN ('Coffee Reward', 'Shopping Voucher', 'Premium Gift') ORDER BY id ASC"
  );
  if (rewards.length !== REWARD_NAMES.length) {
    throw new Error('Run the reward seeder before the redemption seeder.');
  }

  // Fetch the real user UUIDs from the auth-service `users` table (by email).
  const userRows = await fetchUsers();
  const userByEmail = Object.fromEntries(userRows.map((user) => [user.email, user]));
  const missingEmails = USER_EMAILS.filter((email) => !userByEmail[email]);
  if (missingEmails.length) {
    throw new Error(`Run the auth-service user seeder first. Missing users: ${missingEmails.join(', ')}`);
  }

  const USER_UUIDS = USER_EMAILS.map((email) => userByEmail[email].uuid);

  const rewardByName = Object.fromEntries(rewards.map((reward) => [reward.name, reward]));
  const rows = [
    { user: USER_UUIDS[0], reward: rewardByName['Coffee Reward'], date: daysAgo(2) },
    { user: USER_UUIDS[0], reward: rewardByName['Premium Gift'], date: daysAgo(1) },
    { user: USER_UUIDS[1], reward: rewardByName['Shopping Voucher'], date: daysAgo(1) },
  ];

  await queryInterface.bulkInsert('redemptions', rows.map(({ user, reward, date }) => ({
    uuid: randomUUID(),
    user_uuid: user,
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
