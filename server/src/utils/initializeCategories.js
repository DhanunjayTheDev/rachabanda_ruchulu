const Category = require('../models/Category');

const DESSERT_CATEGORIES = [
  {
    name: 'Ice Cream',
    slug: 'ice-cream',
    description: 'Delicious ice creams and frozen desserts',
    icon: '🍦',
    displayOrder: 101,
  },
  {
    name: 'Sweets & Desserts',
    slug: 'sweets-desserts',
    description: 'Traditional and modern sweet treats',
    icon: '🍰',
    displayOrder: 102,
  },
  {
    name: 'Mojitos & Mocktails',
    slug: 'mojitos-mocktails',
    description: 'Refreshing mojitos and non-alcoholic beverages',
    icon: '🍹',
    displayOrder: 103,
  },
  {
    name: 'Shakes & Smoothies',
    slug: 'shakes-smoothies',
    description: 'Creamy shakes and healthy smoothies',
    icon: '🥤',
    displayOrder: 104,
  },
  {
    name: 'Pastries',
    slug: 'pastries',
    description: 'Fresh baked pastries and breads',
    icon: '🥐',
    displayOrder: 105,
  },
  {
    name: 'Cakes',
    slug: 'cakes',
    description: 'Cakes for all occasions',
    icon: '🧁',
    displayOrder: 106,
  },
  {
    name: 'Chocolates',
    slug: 'chocolates',
    description: 'Premium chocolates and chocolate desserts',
    icon: '🍫',
    displayOrder: 107,
  },
  {
    name: 'Puddings & Custards',
    slug: 'puddings-custards',
    description: 'Silky puddings and creamy custards',
    icon: '🍮',
    displayOrder: 108,
  },
];

const initializeCategories = async () => {
  try {
    for (const categoryData of DESSERT_CATEGORIES) {
      // Check if category already exists
      const exists = await Category.findOne({ slug: categoryData.slug });
      
      if (!exists) {
        const newCategory = new Category(categoryData);
        await newCategory.save();
        console.log(`✅ Created category: ${categoryData.name}`);
      } else {
        console.log(`⏭️  Category already exists: ${categoryData.name}`);
      }
    }

    console.log('✅ Category initialization complete!');
  } catch (error) {
    console.error('❌ Error initializing categories:', error.message);
  }
};

module.exports = initializeCategories;
