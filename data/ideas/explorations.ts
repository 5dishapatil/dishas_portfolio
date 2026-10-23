/**
 * Curated Visual Playground / Ideas Data
 * 
 * TO CHANGE IMAGES:
 * 1. Place your image files into: /public/ideas/ (e.g. /public/ideas/my-image-1.jpg)
 * 2. Set the 'image' field below to '/ideas/my-image-1.jpg' (or keep an external https:// URL).
 * 3. Update the title, subtitle, medium, and tags as desired.
 */

export interface ExplorationItem {
  id: string;
  title: string;
  subtitle: string;
  medium: string;
  image: string;
  rotation: number;
  tags: string[];
}

export const EXPLORATION_ITEMS: ExplorationItem[] = [
  {
    id: 'exp-1',
    title: 'Stock Exchange',
    subtitle: 'Building low-latency stock exchange platform that executes orders and maintains an order book.',
    medium: 'Fintech',
    image: '/ideas/stock exchange.jpg',
    rotation: -2,
    tags: ['C++', 'Low-Latency', 'Financial', 'Order Book'],
  },
  {
    id: 'exp-2',
    title: 'Unified Medical Records Platform',
    subtitle: 'Instead of hardcopies of medical prescriptions, we can have a unified platform that stores all medical records digitally and securely.',
    medium: 'Healthcare',
    image: '/ideas/medical records.jpg',
    rotation: 3.5,
    tags: ['Digital Health', 'Data Security', 'Unified Platform'],
  },
  {
    id: 'exp-3',
    title: 'Monitoring Climate Change Impact on Animals',
    subtitle: 'Studying the effects of climate change on animal populations using data analysis and visualization techniques. And, finding ways to mitigate the negative impacts of climate change on wildlife.',
    medium: 'Environmental Science',
    image: '/ideas/climate change.jpg',
    rotation: -1.5,
    tags: ['Environmental Science', 'Data Analysis', 'Climate Change', 'Wildlife Conservation'],
  },
  {
    id: 'exp-4',
    title: 'Accident Detection and Prevention System',
    subtitle: 'Developing a system that uses CCTV footage and deep learning algorithms to detect accidents in real-time and alert emergency services, potentially saving lives and reducing response times.',
    medium: 'Social Impact',
    image: '/ideas/accident detection.jpg',
    rotation: 2,
    tags: ['Deep Learning', 'Computer Vision', 'Real-Time Systems', 'Emergency Response'],
  },
  {
    id: 'exp-5',
    title: 'Immersive Audiobook Experience',
    subtitle: 'Perform sentiment analysis on the text of the audiobook and generate a dynamic visual experience that reflects the emotional tone of the story, enhancing the listener\'s engagement and immersion.',
    medium: 'Generative Art',
    image: '/ideas/audiobook.jpg',
    rotation: -3,
    tags: ['Sentiment Analysis', 'Voice Synthesis', 'Immersive Experience'],
  },
  {
    id: 'exp-6',
    title: 'Bus Health Monitoring System',
    subtitle: 'Developing a system that uses sensors and data analysis to monitor the health of buses in real-time, detecting potential issues before they become critical and alerting maintenance teams to take action, improving safety and reducing downtime.',
    medium: 'IoT & Data Analytics',
    image: '/ideas/bus health.jpg',
    rotation: 1.5,
    tags: ['IoT', 'Data Analytics', 'Predictive Maintenance'],
  },
  {
    id: 'exp-7',
    title: 'Books in Your Language',
    subtitle: 'Developing a system that uses natural language processing and machine translation to provide access to books in multiple languages, breaking down language barriers and promoting literacy and education, while preserving the original meaning and context of the text.',
    medium: 'Accessibility & Education',
    image: '/ideas/translate books.jpg',
    rotation: 1.5,
    tags: ['Natural Language Processing', 'Machine Translation', 'Literacy'],
  },
  {
    id: 'exp-8',
    title: 'Algorithmic Trading for Indian Market',
    subtitle: 'Developing algorithmic trading strategies tailored for the Indian stock market, leveraging machine learning and data analytics to identify opportunities and manage risks, abiding SEBI regulations and ensuring ethical practices, while maximizing returns for investors.',
    medium: 'Finance & Technology',
    image: '/ideas/trading.jpg',
    rotation: 1.5,
    tags: ['Machine Learning', 'Financial Analysis', 'Algorithmic Trading', 'SEBI Regulations'],
  },
];

