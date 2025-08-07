const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Skill extends Model {
    static associate(models) {
      // associations will be defined in index.js
    }
  }
  Skill.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    user_id: DataTypes.INTEGER,
    skill_name: DataTypes.STRING(100),
    endorsed_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null
    }
  }, {
    sequelize,
    modelName: 'Skill',
    tableName: 'skills',
    timestamps: false
  });
  return Skill;
}; 