'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if admin user already exists
    const existingAdmin = await queryInterface.sequelize.query(
      'SELECT id FROM users WHERE email = ?',
      {
        replacements: ['admin@example.com'],
        type: Sequelize.QueryTypes.SELECT
      }
    );

    // Only create admin user if it doesn't exist
    if (existingAdmin.length === 0) {
      console.log('Creating default admin user...');
      const adminPasswordHash = await bcrypt.hash('admin123', 10);
      await queryInterface.bulkInsert('users', [{
        full_name: 'Admin User',
        email: 'admin@example.com',
        phone: '+1234567890',
        password_hash: adminPasswordHash,
        role: 'admin',
        is_verified: true,
        created_at: new Date(),
        updated_at: new Date()
      }]);
      console.log('Default admin user created successfully');
    } else {
      console.log('Admin user already exists, skipping creation');
    }

    // Create test moderator user
    const moderatorPasswordHash = await bcrypt.hash('moderator123', 10);
    await queryInterface.bulkInsert('users', [{
      full_name: 'Moderator User',
      email: 'moderator@example.com',
      phone: '+1234567891',
      password_hash: moderatorPasswordHash,
      role: 'moderator',
      is_verified: true,
      created_at: new Date(),
      updated_at: new Date()
    }]);

    // Create test member user
    const memberPasswordHash = await bcrypt.hash('member123', 10);
    await queryInterface.bulkInsert('users', [{
      full_name: 'Test Member',
      email: 'member@example.com',
      phone: '+1234567892',
      password_hash: memberPasswordHash,
      role: 'member',
      is_verified: true,
      created_at: new Date(),
      updated_at: new Date()
    }]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', {
      email: {
        [Sequelize.Op.in]: [
          'admin@example.com',
          'moderator@example.com',
          'member@example.com'
        ]
      }
    });
  }
}; 