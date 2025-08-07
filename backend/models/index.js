'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Associations
// User 1:1 Profile
if (db.User && db.Profile) {
  db.User.hasOne(db.Profile, { foreignKey: 'user_id', as: 'profile', onDelete: 'CASCADE' });
  db.Profile.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });
}
// User 1:N FamilyMember
if (db.User && db.FamilyMember) {
  db.User.hasMany(db.FamilyMember, { foreignKey: 'user_id', as: 'familyMembers', onDelete: 'CASCADE' });
  db.FamilyMember.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });
}
// User 1:N EducationDetail
if (db.User && db.EducationDetail) {
  db.User.hasMany(db.EducationDetail, { foreignKey: 'user_id', as: 'educationDetails', onDelete: 'CASCADE' });
  db.EducationDetail.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });
}
// User 1:N EmploymentDetail
if (db.User && db.EmploymentDetail) {
  db.User.hasMany(db.EmploymentDetail, { foreignKey: 'user_id', as: 'employmentDetails', onDelete: 'CASCADE' });
  db.EmploymentDetail.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });
}
// User 1:N Skill
if (db.User && db.Skill) {
  db.User.hasMany(db.Skill, { foreignKey: 'user_id', as: 'skills', onDelete: 'CASCADE' });
  db.Skill.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });
  db.Skill.belongsTo(db.User, { foreignKey: 'endorsed_by', as: 'endorser' });
}
// User 1:N Job (posted_by)
if (db.User && db.Job) {
  db.User.hasMany(db.Job, { foreignKey: 'posted_by', as: 'jobs' });
  db.Job.belongsTo(db.User, { foreignKey: 'posted_by', as: 'poster' });
}
// Job 1:N JobApplication
if (db.Job && db.JobApplication) {
  db.Job.hasMany(db.JobApplication, { foreignKey: 'job_id', as: 'applications', onDelete: 'CASCADE' });
  db.JobApplication.belongsTo(db.Job, { foreignKey: 'job_id', as: 'job' });
}
// User 1:N JobApplication
if (db.User && db.JobApplication) {
  db.User.hasMany(db.JobApplication, { foreignKey: 'user_id', as: 'jobApplications', onDelete: 'CASCADE' });
  db.JobApplication.belongsTo(db.User, { foreignKey: 'user_id', as: 'applicant' });
}
// User 1:N Payment
if (db.User && db.Payment) {
  db.User.hasMany(db.Payment, { foreignKey: 'user_id', as: 'payments', onDelete: 'CASCADE' });
  db.Payment.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });
}
// User 1:N BulkUploadLog (uploaded_by)
if (db.User && db.BulkUploadLog) {
  db.User.hasMany(db.BulkUploadLog, { foreignKey: 'uploaded_by', as: 'bulkUploads' });
  db.BulkUploadLog.belongsTo(db.User, { foreignKey: 'uploaded_by', as: 'uploader' });
}
// User 1:N AdminLog (admin_id)
if (db.User && db.AdminLog) {
  db.User.hasMany(db.AdminLog, { foreignKey: 'admin_id', as: 'adminLogs' });
  db.AdminLog.belongsTo(db.User, { foreignKey: 'admin_id', as: 'admin' });
}
// User 1:N Notification
if (db.User && db.Notification) {
  db.User.hasMany(db.Notification, { foreignKey: 'user_id', as: 'notifications', onDelete: 'CASCADE' });
  db.Notification.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
