'use strict';
import { dropEnumType } from "../utils/migration.js";

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('role_modules', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      role: {
        type: Sequelize.ENUM('super_admin', 'admin', 'user'),
        allowNull: false,
      },
      module_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      },
    });

    await queryInterface.addConstraint('role_modules', {
      fields: ['role', 'module_id'],
      type: 'unique',
      name: 'role_module_unique',
    });

    await queryInterface.addIndex('role_modules', ['module_id'], {
      name: 'role_modules_module_id_foreign',
    });

    await queryInterface.addIndex('role_modules', ['role'], {
      name: 'role_modules_role_index',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('role_modules');
    await dropEnumType(queryInterface, 'role_modules', 'role');
  },
};
