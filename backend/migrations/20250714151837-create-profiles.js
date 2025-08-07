'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('profiles', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        unique: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      photo_url: Sequelize.STRING,
      dob: Sequelize.DATE,
      gender: Sequelize.ENUM('male', 'female', 'other'),
      village: Sequelize.STRING(100),
      mandal: Sequelize.STRING(100),
      district: Sequelize.STRING(100),
      pincode: Sequelize.STRING(10),
      caste: Sequelize.STRING(100),
      subcaste: Sequelize.STRING(100),
      marital_status: Sequelize.STRING(50),
      native_place: Sequelize.STRING(100)
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('profiles');
  }
};
