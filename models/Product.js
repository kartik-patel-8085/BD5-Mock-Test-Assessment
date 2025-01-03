let { DataTypes, sequelize } = require('../lib/index');
let Supplier = require('./Supplier');
let Category = require('./Category');

// Define the Product model
let Product = sequelize.define('product', {
  name: DataTypes.STRING,
  description: DataTypes.STRING,
  quantityInStock: DataTypes.INTEGER,
  price: DataTypes.FLOAT,
});

// Define associations
Product.belongsTo(Supplier, {
  foreignKey: {
    name: 'supplierId',
    allowNull: false,
  },
});
Supplier.hasMany(Product, { foreignKey: 'supplierId' });

// Many-to-many relationship with Category
Product.belongsToMany(Category, { through: 'ProductCategory' });
Category.belongsToMany(Product, { through: 'ProductCategory' });

module.exports = Product;
