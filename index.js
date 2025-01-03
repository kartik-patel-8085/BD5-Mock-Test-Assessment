const express = require("express");
const { resolve } = require("path");
let { sequelize } = require("./lib/index");

const Category = require("./models/Category.js");
const Product = require("./models/Product.js");
const Supplier = require("./models/Supplier.js");

const app = express();
app.use(express.json());

const port = 3000;

app.use(express.static("static"));

app.get("/seed_db", async (req, res) => {
  try {
    await sequelize.sync({ force: true });

    const suppliersData = await Supplier.bulkCreate([
      {
        name: "TechSupplies",
        contact: "John Doe",
        email: "contact@techsupplies.com",
        phone: "123-456-7890",
      },
      {
        name: "HomeGoods Co.",
        contact: "Jane Smith",
        email: "contact@homegoodsco.com",
        phone: "987-654-3210",
      },
    ]);

    const productsData = await Product.bulkCreate([
      {
        name: "Laptop",
        description: "High-performance laptop",
        quantityInStock: 50,
        price: 120099,
        supplierId: 1,
      },
      {
        name: "Coffee Maker",
        description: "12-cup coffee maker",
        quantityInStock: 20,
        price: 45000,
        supplierId: 2,
      },
    ]);

    const categoriesData = await Category.bulkCreate([
      { name: "Electronics", description: "Devices and gadgets" },
      {
        name: "Kitchen Appliances",
        description: "Essential home appliances for kitchen",
      },
    ]);

    return res.json({ message: "Database seeded!" });
  } catch (error) {
    console.error("Error seeding database:", error);
    return res
      .status(500)
      .json({ message: "Error seeding database", error: error.message });
  }
});

// Function
async function addNewSupplier(supplier) {
  const { name, contact, email, phone } = supplier;
  return await Supplier.create({
    name,
    contact,
    email,
    phone,
  });
}

async function addNewProduct(product) {
  const { name, description, quantityInStock, price, supplierId } = product;
  return await Product.create({
    name,
    description,
    quantityInStock,
    price,
    supplierId,
  });
}

async function addNewCategory(category) {
  const { name, description } = category;
  return await Category.create({
    name,
    description,
  });
}
async function assignProductToCategory(product, category) {
  await product.addCategory(category);
}
// Exercise 1: Create a New Supplier (POST)
app.post("/suppliers/new", async (req, res) => {
  try {
    const newSupplier = await addNewSupplier(req.body.newSupplier);
    res.json({ newSupplier });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Error creating supplier" });
  }
});

// Exercise 2: Create a New Product (POST )

app.post("/products/new", async (req, res) => {
  try {
    const newProducts = await addNewProduct(req.body.newProduct);
    res.json({ newProducts });
  } catch (error) {
    console.error(error);
    if (error.name === "SequelizeUniqueConstraintError") {
      return res
        .status(400)
        .send({ error: `Email ${error.errors[0].value} is already in use.` });
    }
    res.status(500).send({ error: "Error creating supplier" });
  }
});

// Exercise 3: Create a New Category(POST)
app.post("/categories/new", async (req, res) => {
  try {
    const newCategory = await addNewCategory(req.body.newCategory);
    res.json({ newCategory });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Error creating supplier" });
  }
});

// Exercise 4: Assign a Product to a Category (POST)

app.post(
  "/products/:productId/assignCategory/:categoryId",
  async (req, res) => {
    const productId = parseInt(req.params.productId);
    const categoryId = parseInt(req.params.categoryId);

    try {
      const product = await Product.findByPk(productId, {
        include: { model: Category, through: { attributes: [] } },
      });
      const category = await Category.findByPk(categoryId);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }

      await assignProductToCategory(product, category);

      const updatedProduct = await Product.findByPk(productId, {
        include: {
          model: Category,
          // through: { attributes: [] },
          include: {
            model: Product,
            attributes: [],
          },
        },
      });
      res.json({
        message: "Product assigned to category successfully",
        product: updatedProduct,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error assigning product to category" });
    }
  },
);

// Exercise 5: Get All Products by Category(GET)

app.get("/categories/:id/products", async (req, res) => {
  const categoryId = parseInt(req.params.id);

  try {
    const category = await Category.findByPk(categoryId, {
      include: {
        model: Product,
        through: { attributes: [] },
      },
    });

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json({ products: category.products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error retrieving products" });
  }
});

// Exercise 6: Update a Supplier (POST)

app.post("/suppliers/:id/update", async (req, res) => {
  const supplierId = parseInt(req.params.id);
  const { name, contact, email, phone } = req.body.updateSupplier;

  try {
    const supplier = await Supplier.findByPk(supplierId);

    if (!supplier) {
      return res.status(404).json({ error: "Supplier not found" });
    }
    supplier.name = name;
    supplier.contact = contact;
    supplier.email = email;
    supplier.phone = phone;

    await supplier.save();

    res.json({ updatedSupplier: supplier });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error updating supplier" });
  }
});

// Exercise 7: Delete a Supplier (POST)

app.post("/suppliers/delete", async (req, res) => {
  const supplierId = parseInt(req.body.id);

  try {
    const supplier = await Supplier.findByPk(supplierId);

    if (!supplier) {
      return res.status(404).json({ error: "Supplier not found" });
    }

    await supplier.destroy();

    res.json({ message: "Supplier deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error deleting supplier" });
  }
});

// Exercise 8: Get All Data with Associations
app.get("/suppliers", async (req, res) => {
  try {
    const suppliers = await Supplier.findAll({
      include: [
        {
          model: Product,
          include: [
            {
              model: Category,
              through: { attributes: [] },
            },
          ],
        },
      ],
    });

    res.status(200).json({ suppliers: suppliers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
