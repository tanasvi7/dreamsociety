'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('jobs', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      posted_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      title: Sequelize.STRING(255),
      description: Sequelize.TEXT,
      skills_required: Sequelize.TEXT,
      job_type: Sequelize.ENUM('full-time', 'part-time', 'contract'),
      salary_range: Sequelize.STRING(50),
      location: Sequelize.STRING(255),
      map_lat: Sequelize.DOUBLE,
      map_lng: Sequelize.DOUBLE,
      status: {
        type: Sequelize.ENUM('pending', 'accepted', 'rejected'),
        defaultValue: 'pending'
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('jobs');
  }
};
