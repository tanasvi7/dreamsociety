const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class EmploymentDetail extends Model {
    static associate(models) {
      // associations will be defined in index.js
    }
  }
  EmploymentDetail.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    user_id: DataTypes.INTEGER,
    company_name: DataTypes.STRING(255),
    role: DataTypes.STRING(255),
    years_of_experience: DataTypes.DECIMAL(4,2),
    currently_working: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'EmploymentDetail',
    tableName: 'employment_details',
    timestamps: false
  });
  return EmploymentDetail;
}; 