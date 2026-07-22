'use strict';
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_permissions', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      module_permission_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'module_permissions',
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
    await queryInterface.addConstraint('user_permissions', {
      fields: ['user_id', 'module_permission_id'],
      type: 'unique',
      name: 'unique_user_permission'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user_permissions');
  },
};
