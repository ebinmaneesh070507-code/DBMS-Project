// ---------------------------------------------------------------------------
// Central mock data source. When the Express API is ready, swap the
// functions in src/services/api.js to call real endpoints instead of
// returning these fixtures.
// ---------------------------------------------------------------------------

export const wasteCategories = [
  { id: 'plastic', name: 'Plastic', color: '#4fb8e6' },
  { id: 'organic', name: 'Organic', color: '#49e6a6' },
  { id: 'paper', name: 'Paper', color: '#f0a83e' },
  { id: 'glass', name: 'Glass', color: '#a68cf0' },
  { id: 'metal', name: 'Metal', color: '#8fa79c' },
  { id: 'ewaste', name: 'E-Waste', color: '#ff6f61' },
  { id: 'hazardous', name: 'Hazardous', color: '#ff4d4d' },
  { id: 'mixed', name: 'Mixed', color: '#5d7a6f' },
];

export const zones = ['Zone A', 'Zone B', 'Zone C', 'Zone D', 'Zone E'];

export const dashboardStats = {
  totalCollected: { value: '48.2t', delta: '+6.4%', up: true },
  totalRecycled: { value: '29.1t', delta: '+12.1%', up: true },
  recyclingRate: { value: '60.4%', delta: '+3.2%', up: true },
  activePickups: { value: 27, delta: '-4', up: false },
  highRiskBins: { value: 9, delta: '+2', up: false },
  illegalDumping: { value: 5, delta: '+1', up: false },
};

export const wasteByCategory = wasteCategories.map((c, i) => ({
  name: c.name,
  value: [1240, 980, 640, 310, 420, 260, 90, 180][i],
  color: c.color,
}));

export const wasteByZone = zones.map((z, i) => ({
  zone: z,
  waste: [1420, 1180, 1640, 960, 1080][i],
  recycled: [820, 640, 760, 540, 610][i],
}));

export const monthlyTrend = [
  { month: 'Mar', waste: 3800, recycled: 1900 },
  { month: 'Apr', waste: 4020, recycled: 2100 },
  { month: 'May', waste: 4260, recycled: 2380 },
  { month: 'Jun', waste: 4510, recycled: 2600 },
  { month: 'Jul', waste: 4340, recycled: 2690 },
  { month: 'Aug', waste: 4820, recycled: 2910 },
];

export const recyclingTrend = [
  { month: 'Mar', rate: 50 },
  { month: 'Apr', rate: 52 },
  { month: 'May', rate: 56 },
  { month: 'Jun', rate: 57 },
  { month: 'Jul', rate: 62 },
  { month: 'Aug', rate: 60.4 },
];

export const aiInsights = [
  {
    id: 1,
    tone: 'coral',
    icon: 'triangle-alert',
    text: 'Plastic waste increased by 18% this month, concentrated in Zone C and Zone A.',
  },
  {
    id: 2,
    tone: 'azure',
    icon: 'truck',
    text: 'Zone C may require an additional collection vehicle to keep pace with pickup requests.',
  },
  {
    id: 3,
    tone: 'amber',
    icon: 'trash-2',
    text: '4 bins are predicted to reach capacity within the next 48 hours.',
  },
  {
    id: 4,
    tone: 'mint',
    icon: 'recycle',
    text: 'Recycling efficiency has improved by 12% compared to last month.',
  },
];

export const smartBins = [
  { id: 'BIN-001', zone: 'Zone A', type: 'Plastic', fill: 92, status: 'Critical', predicted: '6 hours' },
  { id: 'BIN-002', zone: 'Zone A', type: 'Organic', fill: 74, status: 'High', predicted: '18 hours' },
  { id: 'BIN-003', zone: 'Zone B', type: 'Paper', fill: 41, status: 'Medium', predicted: '3 days' },
  { id: 'BIN-004', zone: 'Zone C', type: 'Mixed', fill: 88, status: 'High', predicted: '10 hours' },
  { id: 'BIN-005', zone: 'Zone C', type: 'Glass', fill: 22, status: 'Normal', predicted: '6 days' },
  { id: 'BIN-006', zone: 'Zone D', type: 'E-Waste', fill: 97, status: 'Critical', predicted: '2 hours' },
  { id: 'BIN-007', zone: 'Zone D', type: 'Plastic', fill: 55, status: 'Medium', predicted: '2 days' },
  { id: 'BIN-008', zone: 'Zone E', type: 'Metal', fill: 30, status: 'Normal', predicted: '5 days' },
];

export const predictionData = [
  {
    zone: 'Zone A',
    current: 1240,
    predicted: 1480,
    change: 19,
    recommendation: 'Increase collection frequency in Zone A.',
    series: [
      { day: 'Mon', current: 170, predicted: 175 },
      { day: 'Tue', current: 165, predicted: 190 },
      { day: 'Wed', current: 180, predicted: 210 },
      { day: 'Thu', current: 175, predicted: 205 },
      { day: 'Fri', current: 190, predicted: 230 },
      { day: 'Sat', current: 200, predicted: 240 },
      { day: 'Sun', current: 160, predicted: 230 },
    ],
  },
  {
    zone: 'Zone B',
    current: 980,
    predicted: 1030,
    change: 5,
    recommendation: 'Current schedule is sufficient; monitor weekly.',
    series: [
      { day: 'Mon', current: 140, predicted: 145 },
      { day: 'Tue', current: 138, predicted: 140 },
      { day: 'Wed', current: 142, predicted: 148 },
      { day: 'Thu', current: 135, predicted: 142 },
      { day: 'Fri', current: 150, predicted: 150 },
      { day: 'Sat', current: 145, predicted: 152 },
      { day: 'Sun', current: 130, predicted: 153 },
    ],
  },
  {
    zone: 'Zone C',
    current: 1640,
    predicted: 1890,
    change: 15,
    recommendation: 'Deploy an additional vehicle for weekend pickups.',
    series: [
      { day: 'Mon', current: 230, predicted: 260 },
      { day: 'Tue', current: 225, predicted: 255 },
      { day: 'Wed', current: 235, predicted: 270 },
      { day: 'Thu', current: 228, predicted: 265 },
      { day: 'Fri', current: 240, predicted: 280 },
      { day: 'Sat', current: 250, predicted: 290 },
      { day: 'Sun', current: 232, predicted: 270 },
    ],
  },
];

export const vehicles = [
  {
    id: 'EV-14',
    zone: 'Zone A',
    driver: 'R. Kapoor',
    capacity: 78,
    status: 'En Route',
    stops: 5,
  },
  {
    id: 'EV-09',
    zone: 'Zone C',
    driver: 'S. Menon',
    capacity: 94,
    status: 'Nearly Full',
    stops: 3,
  },
  {
    id: 'EV-22',
    zone: 'Zone B',
    driver: 'A. Fernandes',
    capacity: 45,
    status: 'En Route',
    stops: 6,
  },
  {
    id: 'EV-03',
    zone: 'Zone D',
    driver: 'T. Nair',
    capacity: 12,
    status: 'Returning',
    stops: 0,
  },
];

export const pickupRequests = [
  { id: 'PR-2291', zone: 'Zone A', type: 'Plastic', status: 'Assigned' },
  { id: 'PR-2292', zone: 'Zone C', type: 'Mixed', status: 'Pending' },
  { id: 'PR-2293', zone: 'Zone B', type: 'Organic', status: 'Pending' },
  { id: 'PR-2294', zone: 'Zone D', type: 'E-Waste', status: 'Assigned' },
];

export const collectionRoute = {
  stops: ['Depot', 'Bin 05', 'Bin 01', 'Bin 03', 'Recycling Facility'],
  optimizationScore: 87,
  distanceSaved: '4.6 km',
  estTime: '38 min',
};

export const dumpingReports = [
  {
    id: 'DR-441',
    zone: 'Zone C',
    description: 'Construction debris dumped near the storm drain on 3rd cross.',
    date: '2026-08-29',
    status: 'Under Review',
    priority: 'High',
  },
  {
    id: 'DR-440',
    zone: 'Zone A',
    description: 'Household waste left beside a closed lot overnight.',
    date: '2026-08-28',
    status: 'Assigned',
    priority: 'Medium',
  },
  {
    id: 'DR-439',
    zone: 'Zone E',
    description: 'Tyres and scrap metal dumped along the canal walkway.',
    date: '2026-08-27',
    status: 'Pending',
    priority: 'High',
  },
  {
    id: 'DR-438',
    zone: 'Zone B',
    description: 'Garden waste pile blocking the pedestrian path.',
    date: '2026-08-25',
    status: 'Resolved',
    priority: 'Low',
  },
  {
    id: 'DR-437',
    zone: 'Zone D',
    description: 'E-waste (old appliances) left at the bus stop corner.',
    date: '2026-08-24',
    status: 'Resolved',
    priority: 'Medium',
  },
];

export const mockScanResults = [
  {
    item: 'Plastic Bottle',
    category: 'Plastic',
    confidence: 96,
    recyclable: true,
    disposal: 'Rinse and place it in the plastic recycling bin.',
  },
  {
    item: 'Banana Peel',
    category: 'Organic',
    confidence: 98,
    recyclable: true,
    disposal: 'Add to the organic / compost bin.',
  },
  {
    item: 'Cardboard Box',
    category: 'Paper',
    confidence: 94,
    recyclable: true,
    disposal: 'Flatten and place in the paper recycling bin.',
  },
  {
    item: 'Broken Glass Jar',
    category: 'Glass',
    confidence: 91,
    recyclable: true,
    disposal: 'Wrap carefully and place in the glass recycling bin.',
  },
  {
    item: 'Old Smartphone',
    category: 'E-Waste',
    confidence: 89,
    recyclable: true,
    disposal: 'Drop off at the nearest certified e-waste collection point.',
  },
];
