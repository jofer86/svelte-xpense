import { prisma } from '../prisma';

const defaultCategories = [
  // Income categories
  { name: 'Salary', type: 'INCOME', color: '#34D399', icon: '💰' },
  { name: 'Investments', type: 'INCOME', color: '#60A5FA', icon: '📈' },
  { name: 'Gifts', type: 'INCOME', color: '#F472B6', icon: '🎁' },
  { name: 'Other Income', type: 'INCOME', color: '#A78BFA', icon: '💵' },

  // Expense categories
  { name: 'Housing', type: 'EXPENSE', color: '#F87171', icon: '🏠' },
  { name: 'Transportation', type: 'EXPENSE', color: '#FBBF24', icon: '🚗' },
  { name: 'Food', type: 'EXPENSE', color: '#34D399', icon: '🍽️' },
  { name: 'Utilities', type: 'EXPENSE', color: '#60A5FA', icon: '💡' },
  { name: 'Insurance', type: 'EXPENSE', color: '#A78BFA', icon: '🛡️' },
  { name: 'Healthcare', type: 'EXPENSE', color: '#F472B6', icon: '🏥' },
  { name: 'Entertainment', type: 'EXPENSE', color: '#6EE7B7', icon: '🎬' },
  { name: 'Shopping', type: 'EXPENSE', color: '#9CA3AF', icon: '🛍️' },
  { name: 'Education', type: 'EXPENSE', color: '#FCD34D', icon: '📚' },
  { name: 'Other Expenses', type: 'EXPENSE', color: '#6B7280', icon: '📝' }
] as const;

async function addDefaultCategories() {
  try {
    // Get all users
    const users = await prisma.user.findMany();

    // For each user
    for (const user of users) {
      // Get existing categories
      const existingCategories = await prisma.category.findMany({
        where: { userId: user.id }
      });

      // If user has no categories, add default ones
      if (existingCategories.length === 0) {
        console.log(`Adding default categories for user ${user.email}`);
        await prisma.category.createMany({
          data: defaultCategories.map(category => ({
            ...category,
            userId: user.id
          }))
        });
      }
    }

    console.log('Default categories added successfully');
  } catch (error) {
    console.error('Error adding default categories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
addDefaultCategories();