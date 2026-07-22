'use strict';
import { dropEnumType } from '../utils/migration.js';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('purchases', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      uuid: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, allowNull: false, unique: true },
      user_uuid: { type: Sequelize.UUID, allowNull: false },
      product_uuid: { type: Sequelize.UUID, allowNull: false },
      product_name: { type: Sequelize.STRING, allowNull: false },
      product_sku: { type: Sequelize.STRING, allowNull: false },
      quantity: { type: Sequelize.INTEGER, allowNull: false },
      unit_price: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      total_amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      points_earned: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      purchase_date: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      status: { type: Sequelize.ENUM('pending', 'completed', 'cancelled'), allowNull: false, defaultValue: 'completed' },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('purchases');
    await dropEnumType(queryInterface, 'purchases', 'status');
  },
};
