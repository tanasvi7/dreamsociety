'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('education_details', {
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
      degree: Sequelize.STRING(255),
      institution: Sequelize.STRING(255),
      year_of_passing: Sequelize.INTEGER,
      grade: Sequelize.STRING(50)
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('education_details');
  }
};
