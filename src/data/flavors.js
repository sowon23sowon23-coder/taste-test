// Yogurtland 맛 데이터
export const flavorCategories = {
  tart: {
    name: "Tart",
    color: "from-yellow-400 to-orange-400",
    icon: "🍋"
  },
  classic: {
    name: "Classic",
    color: "from-amber-300 to-yellow-500",
    icon: "🍦"
  },
  chocolate: {
    name: "Chocolate",
    color: "from-amber-700 to-yellow-900",
    icon: "🍫"
  },
  fruity: {
    name: "Fruity",
    color: "from-pink-400 to-rose-500",
    icon: "🍓"
  },
  specialty: {
    name: "Specialty",
    color: "from-purple-400 to-indigo-500",
    icon: "✨"
  }
};

export const flavors = {
  // Tart
  "Original Tart": { category: "tart", description: "클래식한 타트 요거트" },
  "Pomegranate Tart": { category: "tart", description: "석류 타트 요거트" },

  // Classic
  "바닐라": { category: "classic", description: "부드럽고 크리미한 클래식" },
  "French Vanilla": { category: "classic", description: "진한 프렌치 바닐라" },

  // Chocolate
  "초콜릿": { category: "chocolate", description: "진한 초콜릿의 깊은 맛" },
  "Dutch Chocolate": { category: "chocolate", description: "리치한 더치 초콜릿" },
  "민트 초콜릿 칩": { category: "chocolate", description: "상쾌한 민트와 초콜릿의 조화" },

  // Fruity
  "딸기": { category: "fruity", description: "새콤달콤한 딸기" },
  "망고": { category: "fruity", description: "열대 망고의 달콤함" },
  "레몬": { category: "fruity", description: "상큼한 레몬 소르베" },
  "Peach": { category: "fruity", description: "달콤한 복숭아" },
  "Passion Fruit": { category: "fruity", description: "트로피컬 패션프루트" },

  // Specialty
  "쿠키 앤 크림": { category: "specialty", description: "오레오 쿠키가 듬뿍" },
  "Cake Batter": { category: "specialty", description: "케이크 반죽 맛" },
  "Peanut Butter": { category: "specialty", description: "고소한 땅콩버터" }
};

export const toppings = {
  // Chocolate
  "초콜릿 칩": { category: "chocolate", icon: "🍫" },
  "오레오": { category: "chocolate", icon: "🍪" },
  "Brownie Bites": { category: "chocolate", icon: "🧁" },

  // Fruits
  "과일 토핑": { category: "fruit", icon: "🍓" },
  "젤리": { category: "fruit", icon: "🍬" },
  "Strawberries": { category: "fruit", icon: "🍓" },
  "Mango": { category: "fruit", icon: "🥭" },

  // Candy
  "쿠키": { category: "candy", icon: "🍪" },
  "M&Ms": { category: "candy", icon: "🌈" },
  "Gummy Bears": { category: "candy", icon: "🐻" },

  // Sauces
  "카라멜": { category: "sauce", icon: "🍯" },
  "크림": { category: "sauce", icon: "🥛" },
  "Hot Fudge": { category: "sauce", icon: "🍫" }
};
