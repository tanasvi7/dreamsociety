const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class FamilyMember extends Model {
    static associate(models) {
      // associations will be defined in index.js
    }
  }
  FamilyMember.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    user_id: DataTypes.INTEGER,
    name: DataTypes.STRING,
    relation: DataTypes.STRING(100),
    education: DataTypes.STRING(255),
    profession: DataTypes.STRING(255)
  }, {
    sequelize,
    modelName: 'FamilyMember',
    tableName: 'family_members',
    timestamps: false
  });
  return FamilyMember;
}; 