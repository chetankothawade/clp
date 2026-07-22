'use strict';
import { dropEnumType } from '../utils/migration.js';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('redemptions', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      uuid: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, allowNull: false, unique: true },
      user_uuid: { type: Sequelize.UUID, allowNull: false },
      reward_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'rewards', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      points_used: { type: Sequelize.INTEGER, allowNull: false },
      redeemed_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      status: { type: Sequelize.ENUM('pending', 'completed', 'cancelled'), allowNull: false, defaultValue: 'completed' },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('redemptions');
    await dropEnumType(queryInterface, 'redemptions', 'status');
  },
};
