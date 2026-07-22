'use strict';
import { dropEnumType } from '../utils/migration.js';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('rewards', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      uuid: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, allowNull: false, unique: true },
      name: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      reward_type: { type: Sequelize.STRING, allowNull: false },
      points_required: { type: Sequelize.INTEGER, allowNull: false },
      stock: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      expiry_date: { type: Sequelize.DATE, allowNull: true },
      status: { type: Sequelize.ENUM('active', 'inactive'), allowNull: false, defaultValue: 'active' },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('rewards');
    await dropEnumType(queryInterface, 'rewards', 'status');
  },
};
