'use strict';
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('module_permissions', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      module_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'modules',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      permission_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'permissions',
          key: 'id',
        },
        onDelete: 'CASCADE',
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

    // Unique key
    await queryInterface.addConstraint('module_permissions', {
      fields: ['module_id', 'permission_id'],
      type: 'unique',
      name: 'unique_module_permission'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('module_permissions');
  },
};
