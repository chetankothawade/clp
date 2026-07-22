'use strict';
import { dropEnumType } from "../utils/migration.js";

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('modules', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      parent_id: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      name: {
        type: Sequelize.STRING(50),
        unique: true,
        allowNull: false,
      },
      url: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      icon: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      seq_no: {
        type: Sequelize.INTEGER,
      },
      is_sub_module: {
        type: Sequelize.ENUM('Y', 'N'),
        defaultValue: 'N',
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive'),
        defaultValue: 'active',
      },
      is_permission: {
        type: Sequelize.ENUM('Y', 'N'),
        defaultValue: 'N',
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('modules');
    await dropEnumType(queryInterface, 'modules', 'status');
    await dropEnumType(queryInterface, 'modules', 'is_sub_module');
    await dropEnumType(queryInterface, 'modules', 'is_permission');
  },
};
