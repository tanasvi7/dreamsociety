'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('skills', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      skill_name: Sequelize.STRING(100),
      endorsed_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'SET NULL'
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('skills');
  }
};
