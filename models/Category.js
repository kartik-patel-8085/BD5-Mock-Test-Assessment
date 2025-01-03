let { DataTypes, sequelize } = require('../lib/index');

// Define the Category model
let Category = sequelize.define('category', {
  name: DataTypes.STRING,
  description: DataTypes.STRING,
});

module.exports = Category;
