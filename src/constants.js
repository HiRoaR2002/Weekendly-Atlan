export const activityCategories = {
  food: {
    name: 'Food & Drinks',
    icon: 'Utensils',
    color: 'bg-orange-500',
    activities: [
      { id: 'brunch', name: 'Weekend Brunch', duration: 90, vibe: 'relaxed', time: '10:00', icon: 'Coffee' },
      { id: 'cooking', name: 'Cook Together', duration: 120, vibe: 'energetic', time: '18:00', icon: 'Utensils' },
      { id: 'wine-tasting', name: 'Wine Tasting', duration: 180, vibe: 'happy', time: '15:00', icon: 'Heart' },
      { id: 'food-truck', name: 'Food Truck Hunt', duration: 60, vibe: 'adventurous', time: '12:00', icon: 'ShoppingCart' }
    ]
  },
  outdoor: {
    name: 'Outdoor Adventures',
    icon: 'Mountain',
    color: 'bg-green-500',
    activities: [
      { id: 'hiking', name: 'Nature Hike', duration: 240, vibe: 'energetic', time: '08:00', icon: 'Mountain' },
      { id: 'picnic', name: 'Park Picnic', duration: 180, vibe: 'relaxed', time: '12:00', icon: 'Sun' },
      { id: 'cycling', name: 'City Cycling', duration: 120, vibe: 'energetic', time: '09:00', icon: 'Zap' },
      { id: 'stargazing', name: 'Stargazing', duration: 120, vibe: 'peaceful', time: '21:00', icon: 'Moon' }
    ]
  },
  entertainment: {
    name: 'Entertainment',
    icon: 'Film',
    color: 'bg-purple-500',
    activities: [
      { id: 'movie', name: 'Movie Marathon', duration: 180, vibe: 'relaxed', time: '19:00', icon: 'Film' },
      { id: 'concert', name: 'Live Music', duration: 150, vibe: 'energetic', time: '20:00', icon: 'Music' },
      { id: 'museum', name: 'Art Gallery', duration: 120, vibe: 'peaceful', time: '14:00', icon: 'Palette' },
      { id: 'gaming', name: 'Game Night', duration: 240, vibe: 'happy', time: '19:00', icon: 'Users' }
    ]
  },
  wellness: {
    name: 'Wellness & Self-Care',
    icon: 'Heart',
    color: 'bg-pink-500',
    activities: [
      { id: 'spa', name: 'Spa Day', duration: 240, vibe: 'peaceful', time: '10:00', icon: 'Heart' },
      { id: 'yoga', name: 'Morning Yoga', duration: 60, vibe: 'peaceful', time: '07:00', icon: 'Sunrise' },
      { id: 'meditation', name: 'Meditation', duration: 30, vibe: 'peaceful', time: '06:00', icon: 'Moon' },
      { id: 'reading', name: 'Reading Time', duration: 120, vibe: 'relaxed', time: '15:00', icon: 'Book' }
    ]
  }
};

export const themes = {
  lazy: { name: 'Lazy Weekend', color: 'bg-blue-500', icon: 'Bed', activities: ['reading', 'movie', 'brunch', 'spa'] },
  adventurous: { name: 'Adventure Time', color: 'bg-green-500', icon: 'Rocket', activities: ['hiking', 'cycling', 'food-truck', 'concert'] },
  family: { name: 'Family Fun', color: 'bg-yellow-500', icon: 'Smile', activities: ['picnic', 'museum', 'cooking', 'gaming'] },
  romantic: { name: 'Romantic Getaway', color: 'bg-pink-500', icon: 'Gift', activities: ['wine-tasting', 'stargazing', 'spa', 'cooking'] },
  balanced: { name: 'Perfect Balance', color: 'bg-purple-500', icon: 'Scale', activities: ['yoga', 'brunch', 'museum', 'movie'] }
};

export const weekendOptions = {
  twoDays: { name: '2-Day Weekend', days: ['saturday', 'sunday'] },
  threeDaysFriday: { name: '3-Day (Fri-Sun)', days: ['friday', 'saturday', 'sunday'] },
  threeDaysMonday: { name: '3-Day (Sat-Mon)', days: ['saturday', 'sunday', 'monday'] },
  fourDaysThursday: { name: '4-Day (Thu-Sun)', days: ['thursday', 'friday', 'saturday', 'sunday'] },
  fourDaysMonday: { name: '4-Day (Fri-Mon)', days: ['friday', 'saturday', 'sunday', 'monday'] },
  fourDaysTuesday: { name: '4-Day (Sat-Tue)', days: ['saturday', 'sunday', 'monday', 'tuesday'] }
};
