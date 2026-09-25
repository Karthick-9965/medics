export interface ArticleItem {
  id: string;
  title: string;
  category: string;
  image: any;
  date: string;
  readTime: string;
  author?: string;
  summary?: string;
}

export const ARTICLES_DATA: ArticleItem[] = [
  {
    id: '1',
    title: 'The 25 Healthiest Fruits You Can Eat',
    category: 'Nutrition',
    image: require('../assets/images/home/articles/healthy-fruits.png'),
    date: 'Jun 10, 2026',
    readTime: '5 min read',
    author: 'Dr. Sarah Jenkins (Nutritionist)',
    summary: 'Discover nutrient-dense fruits packed with natural antioxidants, essential vitamins, and soluble dietary fiber that optimize metabolism and cellular regeneration.',
  },
  {
    id: '2',
    title: '10 Tips To Improve Your Immune System',
    category: 'Wellness',
    image: require('../assets/images/home/articles/immune-system.png'),
    date: 'Jun 8, 2026',
    readTime: '4 min read',
    author: 'Dr. Alan Vance (Immunologist)',
    summary: 'Simple evidence-based daily routines including quality sleep, gut biome optimization, micronutrient supplementation, and hydration to build resilient immunity.',
  },
  {
    id: '3',
    title: 'How To Manage Stress Naturally',
    category: 'Mental Health',
    image: require('../assets/images/home/articles/stress-management.png'),
    date: 'Jun 5, 2026',
    readTime: '6 min read',
    author: 'Dr. Maria Elena (Clinical Psychologist)',
    summary: 'Clinical techniques for calming the vagus nerve, reducing cortisol spikes, and practicing guided breathwork to maintain emotional equilibrium during hectic schedules.',
  },
  {
    id: '4',
    title: 'Brain Health & Memory Booster Habits',
    category: 'Neurology',
    image: require('../assets/images/home/articles/brain-health.png'),
    date: 'Jun 2, 2026',
    readTime: '7 min read',
    author: 'Dr. Neil Robert (Neurologist)',
    summary: 'Neuroplasticity strategies, omega-3 fatty acids, cognitive workouts, and restful REM cycles that protect brain tissue from premature cognitive decline.',
  },
  {
    id: '5',
    title: 'Annual Health Checkups: Why They Matter',
    category: 'Preventative Care',
    image: require('../assets/images/home/articles/checkup.png'),
    date: 'May 28, 2026',
    readTime: '5 min read',
    author: 'Dr. Marcus Horizon (Cardiologist)',
    summary: 'Why early biometric screening, lipid profiles, and metabolic panels catch asymptomatic cardiovascular and endocrinological disorders before they escalate.',
  },
];
