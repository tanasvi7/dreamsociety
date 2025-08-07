const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Job extends Model {
    static associate(models) {
      // associations will be defined in index.js
    }
  }
  Job.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    posted_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    title: DataTypes.STRING(255),
    company: DataTypes.STRING(255),
    description: DataTypes.TEXT,
    skills_required: DataTypes.TEXT,
    job_type: DataTypes.ENUM('full-time', 'part-time', 'contract', 'internship', 'freelance'),
    work_model: {
      type: DataTypes.ENUM('office', 'remote', 'hybrid'),
      defaultValue: 'office'
    },
    experience_required: DataTypes.STRING(100),
    salary_range: DataTypes.STRING(50),
    salary_min: DataTypes.DECIMAL(10, 2),
    salary_max: DataTypes.DECIMAL(10, 2),
    salary_currency: {
      type: DataTypes.STRING(10),
      defaultValue: 'INR'
    },
    location: DataTypes.STRING(255),
    map_lat: DataTypes.DOUBLE,
    map_lng: DataTypes.DOUBLE,
    application_deadline: DataTypes.DATE,
    contact_email: DataTypes.STRING(255),
    company_website: DataTypes.STRING(500),
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
      defaultValue: 'pending'
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Job',
    tableName: 'jobs',
    timestamps: false
  });
  return Job;
}; 