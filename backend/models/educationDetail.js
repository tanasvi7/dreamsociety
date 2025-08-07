const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class EducationDetail extends Model {
    static associate(models) {
      // associations will be defined in index.js
    }
  }
  EducationDetail.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    user_id: DataTypes.INTEGER,
    degree: DataTypes.STRING(255),
    institution: DataTypes.STRING(255),
    year_of_passing: DataTypes.INTEGER,
    grade: DataTypes.STRING(50)
  }, {
    sequelize,
    modelName: 'EducationDetail',
    tableName: 'education_details',
    timestamps: false
  });
  return EducationDetail;
}; 