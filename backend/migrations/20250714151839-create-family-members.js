'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('family_members', {
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
      name: Sequelize.STRING,
      relation: Sequelize.STRING(100),
      education: Sequelize.STRING(255),
      profession: Sequelize.STRING(255)
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('family_members');
  }
};
