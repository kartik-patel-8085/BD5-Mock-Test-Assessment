const express = require('express');
const { resolve } = require('path');
let { sequelize } = require('./lib/index');

const Category = require('./models/Category.js');
const Product = require('./models/Product.js');
const Supplier = require('./models/Supplier.js');

const app = express();
app.use(express.json());

const port = 3010;

app.use(express.static('static'));

app.get('/seed_db', async (req, res) => {
  try {
    await sequelize.sync({ force: true });

    const suppliersData = await Supplier.bulkCreate([
      {
        name: 'TechSupplies',
        contact: 'John Doe',
        email: 'contact@techsupplies.com',
        phone: '123-456-7890',
      },
      {
        name: 'HomeGoods Co.',
        contact: 'Jane Smith',
        email: 'contact@homegoodsco.com',
        phone: '987-654-3210',
      },
    ]);

    const productsData = await Product.bulkCreate([
      {
        name: 'Laptop',
        description: 'High-performance laptop',
        quantityInStock: 50,
        price: 120099,
        supplierId: 1,
      },
      {
        name: 'Coffee Maker',
        description: '12-cup coffee maker',
        quantityInStock: 20,
        price: 45000,
        supplierId: 2,
      },
    ]);

    const categoriesData = await Category.bulkCreate([
      { name: 'Electronics', description: 'Devices and gadgets' },
      {
        name: 'Kitchen Appliances',
        description: 'Essential home appliances for kitchen',
      },
    ]);

    return res.json({ message: 'Database seeded!' });
  } catch (error) {
    console.error('Error seeding database:', error);
    return res
      .status(500)
      .json({ message: 'Error seeding database', error: error.message });
  }
});

// Function
async function addNewSupplier(supplier) {
  const { name, contact, email, phone } = supplier;
  const newSupplier = await Supplier.create({ name, contact, email, phone });
  return newSupplier;
}

// Exercise 1: Create a New Supplier (POST)
app.post('/suppliers/new', async (req, res) => {
  try {
    const newSupplier = await addNewSupplier(req.body.newSupplier);
    call;
    res.json({ newSupplier });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Error creating supplier' });
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
