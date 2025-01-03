let { DataTypes, sequelize } = require('../lib/index');

// Define the Supplier model
let Supplier = sequelize.define('supplier', {
  name: DataTypes.STRING,
  contact: DataTypes.STRING,
  email: {
    type: DataTypes.STRING,
    unique: true,
  },
  phone: DataTypes.STRING,
});

module.exports = Supplier;
