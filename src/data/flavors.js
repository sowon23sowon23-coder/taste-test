// Yogurtland flavor data
export const flavorCategories = {
  tart: {
    name: 'Tart',
    color: 'from-yellow-400 to-orange-400',
    icon: '🍋'
  },
  classic: {
    name: 'Classic',
    color: 'from-amber-300 to-yellow-500',
    icon: '🍦'
  },
  chocolate: {
    name: 'Chocolate',
    color: 'from-amber-700 to-yellow-900',
    icon: '🍫'
  },
  fruity: {
    name: 'Fruity',
    color: 'from-pink-400 to-rose-500',
    icon: '🍓'
  },
  specialty: {
    name: 'Specialty',
    color: 'from-purple-400 to-indigo-500',
    icon: '✨'
  }
};

export const flavors = {
  // Tart
  'Original Tart': { category: 'tart', description: 'Classic tangy yogurt' },
  'Pomegranate Tart': { category: 'tart', description: 'Pomegranate tart yogurt' },

  // Classic
  'Vanilla': { category: 'classic', description: 'Smooth and creamy classic' },
  'French Vanilla': { category: 'classic', description: 'Rich French vanilla' },

  // Chocolate
  'Chocolate': { category: 'chocolate', description: 'Deep, rich chocolate' },
  'Dutch Chocolate': { category: 'chocolate', description: 'Rich Dutch chocolate' },
  'Mint Chocolate Chip': { category: 'chocolate', description: 'Refreshing mint with chocolate chips' },

  // Fruity
  'Strawberry': { category: 'fruity', description: 'Sweet and tangy strawberry' },
  'Mango': { category: 'fruity', description: 'Tropical mango sweetness' },
  'Lemon': { category: 'fruity', description: 'Bright lemon sorbet' },
  'Peach': { category: 'fruity', description: 'Sweet summer peach' },
  'Passion Fruit': { category: 'fruity', description: 'Tropical passion fruit' },

  // Specialty
  'Cookies & Cream': { category: 'specialty', description: 'Loaded with Oreo cookies' },
  'Cake Batter': { category: 'specialty', description: 'Birthday cake batter flavor' },
  'Peanut Butter': { category: 'specialty', description: 'Rich peanut butter' }
};

export const toppings = {
  // Chocolate
  'Chocolate Chips': { category: 'chocolate', icon: '🍫' },
  'Oreo': { category: 'chocolate', icon: '🍪' },
  'Brownie Bites': { category: 'chocolate', icon: '🧁' },

  // Fruits
  'Fresh Fruit': { category: 'fruit', icon: '🍓' },
  'Jelly': { category: 'fruit', icon: '🍬' },
  'Strawberries': { category: 'fruit', icon: '🍓' },
  'Mango': { category: 'fruit', icon: '🥭' },

  // Candy
  'Cookies': { category: 'candy', icon: '🍪' },
  'M&Ms': { category: 'candy', icon: '🌈' },
  'Gummy Bears': { category: 'candy', icon: '🐻' },

  // Sauces
  'Caramel': { category: 'sauce', icon: '🍯' },
  'Whipped Cream': { category: 'sauce', icon: '🥛' },
  'Hot Fudge': { category: 'sauce', icon: '🍫' }
};
