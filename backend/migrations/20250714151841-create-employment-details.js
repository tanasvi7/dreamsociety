'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('employment_details', {
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
      company_name: Sequelize.STRING(255),
      role: Sequelize.STRING(255),
      years_of_experience: Sequelize.DECIMAL(4,2),
      currently_working: Sequelize.BOOLEAN
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('employment_details');
  }
};
