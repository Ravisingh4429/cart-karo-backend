const mongoose = require("../DB/database");
const Category = require("../model/category");
const Product = require("../model/product");
const { categoriesData } = require("./seedData");

const seedDB = async () => {
  try {
    await mongoose.connection.asPromise();

    console.log("🌱 Seeding database...");

    // Clear old data
    await Category.deleteMany({});
    await Product.deleteMany({});

    // IMPORTANT:
    // categoriesData must be an ARRAY of category objects
    for (const cat of categoriesData) {
      // 1️⃣ Create category
      const createdCategory = await Category.create({
        name: cat.name,
        image: cat.image,
      });

      // 2️⃣ Prepare products with category reference
      const productsWithCategory = cat.products.map((product) => ({
        title: product.title,
        descriptions: product.descriptions,
        price: product.price,
        stock: product.stock,
        images: product.images || [],
        reviews: product.reviews || { rate: 0, counts: 0 },
        category: createdCategory._id,
      }));

      // 3️⃣ Insert products
      await Product.insertMany(productsWithCategory);
    }

    console.log("✅ Database seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error while seeding database:", error);
    process.exit(1);
  }
};

seedDB();
