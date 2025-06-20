/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

// knex seed:make seed_products
export async function seed(knex) {
  await knex("sales").del();
  await knex("customers").del();
  await knex("sale_items").del();
  await knex("products").del(); // reset all

  const categories = {
    coffee: [
      "Espresso",
      "Americano",
      "Latte",
      "Cappuccino",
      "Macchiato",
      "Mocha",
      "Flat White",
      "Cold Brew",
      "Affogato",
      "Café au Lait",
      "Iced Coffee",
      "Turkish Coffee",
      "Cortado",
      "Irish Coffee",
      "Nitro Brew",
    ],
    tea: [
      "Green Tea",
      "Black Tea",
      "Earl Grey",
      "Chai Latte",
      "Matcha",
      "Oolong",
      "Herbal Blend",
      "Mint Tea",
      "Lemon Tea",
      "Chamomile",
      "Ginger Tea",
      "Thai Iced Tea",
      "Bubble Tea",
      "Milk Tea",
      "Hibiscus",
    ],
    pastries: [
      "Croissant",
      "Pain au Chocolat",
      "Apple Turnover",
      "Cinnamon Roll",
      "Danish",
      "Eclair",
      "Muffin",
      "Scone",
      "Cream Puff",
      "Macaron",
      "Tart",
      "Brownie",
      "Baklava",
      "Donut",
      "Fruit Strudel",
    ],
    bread: [
      "Baguette",
      "Sourdough",
      "Ciabatta",
      "Focaccia",
      "Brioche",
      "Whole Wheat",
      "Rye Bread",
      "Multigrain",
      "Pita",
      "Flatbread",
      "Cornbread",
      "Naan",
      "Bagel",
      "Pretzel",
      "Garlic Bread",
    ],
  };

  const categoryIngredients = {
    coffee: [
      "Espresso Shot",
      "Milk",
      "Sugar",
      "Foam",
      "Whipped Cream",
      "Vanilla Syrup",
      "Caramel Syrup",
      "Chocolate Drizzle",
      "Ice",
      "Cinnamon Powder",
    ],
    tea: [
      "Green Tea Leaves",
      "Black Tea Leaves",
      "Matcha Powder",
      "Lemon",
      "Honey",
      "Milk",
      "Tapioca Pearls",
      "Mint",
      "Sugar",
      "Ginger",
    ],
    pastries: [
      "Flour",
      "Butter",
      "Sugar",
      "Eggs",
      "Chocolate",
      "Vanilla",
      "Cream Cheese",
      "Cinnamon",
      "Baking Powder",
      "Jam",
    ],
    bread: [
      "Flour",
      "Water",
      "Yeast",
      "Salt",
      "Sugar",
      "Olive Oil",
      "Butter",
      "Whole Grains",
      "Milk",
      "Eggs",
    ],
  };

  const coffeeImages = [
    "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=600&h=400&q=80",
    "https://images.unsplash.com/photo-1525253086316-d0c936c814f8?auto=format&fit=crop&w=600&h=400&q=80",
    "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&h=400&q=80",
    "https://images.unsplash.com/photo-1517685352821-92cf88aee5a5?auto=format&fit=crop&w=600&h=400&q=80",
    "https://images.unsplash.com/photo-1528842814073-43dcaf908d5c?auto=format&fit=crop&w=600&h=400&q=80",
    "https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=600&h=400&q=80",
    "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=600&h=400&q=80",
    "https://images.unsplash.com/photo-1482454811764-cc3d7a7d25fe?auto=format&fit=crop&w=600&h=400&q=80",
    "https://images.unsplash.com/photo-1509042239860-c5c903a2ba19?auto=format&fit=crop&w=600&h=400&q=80",
    "https://images.unsplash.com/photo-1510626176961-4d87faff12dc?auto=format&fit=crop&w=600&h=400&q=80",
    "https://images.unsplash.com/photo-1509042239860-a41e4bef8fc3?auto=format&fit=crop&w=600&h=400&q=80",
    "https://images.unsplash.com/photo-1509042239860-a2d1910fba34?auto=format&fit=crop&w=600&h=400&q=80",
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&h=400&q=80",
    "https://images.unsplash.com/photo-1509042239860-1a49c71b0b41?auto=format&fit=crop&w=600&h=400&q=80",
    "https://images.unsplash.com/photo-1509042239860-0cabf3d6b5b2?auto=format&fit=crop&w=600&h=400&q=80",
  ];

  const teaImages = [
    "https://images.unsplash.com/photo-1513569771928-55e37ecb371f?auto=format&fit=crop&w=600&h=400&q=80",
    "https://images.unsplash.com/photo-1502562898656-8cc59bea1ce1?auto=format&fit=crop&w=600&h=400&q=80",
    "https://images.unsplash.com/photo-1460317442999-48411a47f393?auto=format&fit=crop&w=600&h=400&q=80",
    "https://images.unsplash.com/photo-1505253219469-892fb53c0c2f?auto=format&fit=crop&w=600&h=400&q=80",
    "https://images.unsplash.com/photo-1523987355523-c7b5b1cb4b2b?auto=format&fit=crop&w=600&h=400&q=80",
    "https://images.unsplash.com/photo-1460294510031-289c3ac1c8a8?auto=format&fit=crop&w=600&h=400&q=80",
    "https://images.unsplash.com/photo-1526498460520-4c246339dccb?auto=format&fit=crop&w=600&h=400&q=80",
    "https://images.unsplash.com/photo-1506991135406-3c2a25489eca?auto=format&fit=crop&w=600&h=400&q=80",
    "https://images.unsplash.com/photo-1516627146446-e8ff47de5d70?auto=format&fit=crop&w=600&h=400&q=80",
    "https://images.unsplash.com/photo-1530580324105-4abff7f70e24?auto=format&fit=crop&w=600&h=400&q=80",
    "https://images.unsplash.com/photo-1547592180-5c449e37917e?auto=format&fit=crop&w=600&h=400&q=80",
    "https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=600&h=400&q=80",
    "https://images.unsplash.com/photo-1510626176961-4d87faff12dc?auto=format&fit=crop&w=600&h=400&q=80",
    "https://images.unsplash.com/photo-1513569771928-f8dams7ac371f?auto=format&fit=crop&w=600&h=400&q=80",
    "https://images.unsplash.com/photo-1505253219469-asd127d1f9ea?auto=format&fit=crop&w=600&h=400&q=80",
  ];

  const pastriesImages = [
    "https://images.unsplash.com/photo-1485973572410-ec2c51700fec?auto=format&fit=crop&w=600&h=400&q=80",
    "https://images.unsplash.com/photo-1514986888952-8cd320577b8b?auto=format&fit=crop&w=600&h=400&q=80",
    "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=600&h=400&q=80",
    "https://images.unsplash.com/photo-1524524513789-674197aee83d?auto=format&fit=crop&w=600&h=400&q=80",
    "https://images.unsplash.com/photo-1530577197743-7adf14294584?auto=format&fit=crop&w=600&h=400&q=80",
    "https://images.unsplash.com/photo-1526546808110-6609a740ee23?auto=format&fit=crop&w=600&h=400&q=80",
    "https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=600&h=400&q=80",
    "https://images.unsplash.com/photo-1505255271461-18562d8f2a20?auto=format&fit=crop&w=600&h=400&q=80",
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&h=400&q=80",
    "https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=600&h=400&q=80",
    "https://images.unsplash.com/photo-1505253219469-892fb53c0c2f?auto=format&fit=crop&w=600&h=400&q=80",
    "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=600&h=400&q=80",
    "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&h=400&q=80",
    "https://images.unsplash.com/photo-1523987355523-c7b5b1bv4b2b?auto=format&fit=crop&w=600&h=400&q=80",
    "https://images.unsplash.com/photo-1513569771928-4d87faff12dc?auto=format&fit=crop&w=600&h=400&q=80",
  ];

  const breadImages = [
    "https://images.unsplash.com/photo-1508385082359-f5a2c7e90beb?auto=format&fit=crop&w=600&h=400&q=80",
    "https://images.unsplash.com/photo-1523473827532-663a4d58bb15?auto=format&fit=crop&w=600&h=400&q=80",
    "https://images.unsplash.com/photo-1526546808110-6609a740ee23?auto=format&fit=crop&w=600&h=400&q=80",
    "https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=600&h=400&q=80",
    "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=600&h=400&q=80",
    "https://images.unsplash.com/photo-1495474472287-1c2d31ab2085?auto=format&fit=crop&w=600&h=400&q=80",
    "https://images.unsplash.com/photo-1505255271461-892fb53c0c2f?auto=format&fit=crop&w=600&h=400&q=80",
    "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&h=400&q=80",
    "https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=600&h=400&q=80",
    "https://images.unsplash.com/photo-1508385082359-7b5c5fca1d5f?auto=format&fit=crop&w=600&h=400&q=80",
    "https://images.unsplash.com/photo-1523473827532-2e07a4d58bb15?auto=format&fit=crop&w=600&h=400&q=80",
    "https://images.unsplash.com/photo-1514986888952-8cd320577b8b?auto=format&fit=crop&w=600&h=400&q=80",
    "https://images.unsplash.com/photo-1513569771928-55e37ecb371f?auto=format&fit=crop&w=600&h=400&q=80",
    "https://images.unsplash.com/photo-1505253219469-118ccbe16ba?w=600&auto=format&fit=crop&h=400&q=80",
    "https://images.unsplash.com/photo-1524524513789-674197aee83d?auto=format&fit=crop&w=600&h=400&q=80",
  ];

  const getIngredientsForCategory = (category) => {
    const pool = categoryIngredients[category] || [];
    const count = Math.floor(Math.random() * 3) + 3; // 3–5 ingredients
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    return JSON.stringify(shuffled.slice(0, count));
  };

  const categoryImages = {
    coffee: coffeeImages,
    tea: teaImages,
    pastries: pastriesImages,
    bread: breadImages,
  };

  function getRandomImage(category) {
    const pool = categoryImages[category];
    return pool[Math.floor(Math.random() * pool.length)];
  }

  const generateItems = (category, names) =>
    names.map((name) => ({
      name,
      price: (Math.random() * 5 + 2).toFixed(2), // $2.00 - $7.00
      quantity: Math.floor(Math.random() * 20 + 5), // 5 - 25
      image_url: getRandomImage(category),
      category,
    }));

  const allProducts = [
    ...generateItems("coffee", categories.coffee),
    ...generateItems("tea", categories.tea),
    ...generateItems("pastries", categories.pastries),
    ...generateItems("bread", categories.bread),
  ].map((product) => ({
    ...product,
    ingredients: getIngredientsForCategory(product.category),
  }));

  console.log("Row 16 Sample:", allProducts[15]);

  await knex("products").insert(allProducts);
}
