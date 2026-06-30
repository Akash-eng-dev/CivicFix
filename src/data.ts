import { Issue, LeaderboardUser, IssueCategory } from './types';

// Let's define the center locations
export const URBAN_CENTER = { lat: 12.9716, lng: 77.5946 }; // Bangalore City
export const RURAL_CENTER = { lat: 13.1500, lng: 77.8500 }; // Kolar Village Panchayat

export interface PresetIssueType {
  id: string;
  name: string;
  category: IssueCategory;
  defaultTitle: string;
  defaultDescription: string;
  // A tiny, valid base64 image representing the issue (small gray block with color dots so it is fast and valid)
  base64Image: string;
}

export const PRESET_ISSUES: PresetIssueType[] = [
  {
    id: 'pothole',
    name: 'Road Pothole (Urban)',
    category: 'Pothole',
    defaultTitle: 'Severe pothole on 80 Feet Road corner',
    defaultDescription: 'A deep, dangerous pothole near the traffic intersection causing sudden braking and severe traffic bottleneck.',
    base64Image: 'iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAAByklEQVR4nO2cwU7CQBCGZ0u8A+InMHoTepSExHvwBXwxkXg13tSD+Ao8gKEnE7+C8Xv0gHdgvIAd/XpY0pZtsVLaYid/kk3SdrP9p9tZNoXwN6oqR0Q9Zp56VfWhqorMvPGo7iKz9T8yYmZOfU9S0WbMHA3K+Xwul8vlcrlcLpfL5XK5XC6Xy+VyuVwun9p8PlfXda/v6NAnVXXOOfc8P+Zc13XNzO9DOf8YInojonNmnnucpCKZ+eY3GfHov1RV/T70A+pE9G3fW966u4hoT0S1H2TEO/X97Gki6m8zYq9b9/uM2PvV/TIj9v5177NOfdfZ+9X9p8yI/V7Z+/U+I8TfMvvnB+L3KfvZ98XvU/Yz/hLx+9T/I8TfKfvN9+XvM3vnJ+N3qf1pRoR7Zu/0E/H7lF009s47Eb9P/Y0QIb5gdufM3ulH4/cxexEiRCgRIsTfMyIsIsLfXoQQIUKIECHE32xEiBAhRIgQIUSAECFChBAhQogQIUSAECFCiBAhRIgQIUSAECFChBAhQogQIUSAECFChBAhQogQIUSAECFChBAhRIgQIUSAECFCiBAhRIgQIUSAECFCiBAhxN8zIqyIiB/fAQB0XWeeM9RCAAAAAElFTkSuQmCC'
  },
  {
    id: 'streetlight',
    name: 'Broken Streetlight (Urban)',
    category: 'Damaged Streetlight',
    defaultTitle: 'Flickering street lamp outside block 4',
    defaultDescription: 'The streetlight is completely dead or flickering heavily, making the pedestrian footpath pitch dark and unsafe at night.',
    base64Image: 'iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAABsklEQVR4nO3csU3DQBiGYTshfgXET2D0JoRREhLvgRdgipFIvBpX6kF8Be7A0JORX8H4PXrAHTCegB39H6w0bVM4scVO/v+TLMvYvXvv6pAsgfAzVbUVEesw8zWqqtXMewgRIsSIECFCpAgRIkSIECFChAgRIkSIECFChAgRIkSIECFChAgRIkSIECFCpAgRIkSIECFChAgRIkSIECFChAgRIkSIECFChAgRIkSIECFChAgRIkSIECFChAgRIkSIECFChAgRIkSIECFChAgRIkSIECFChAgRIkSIECFChAgRIsSIECFCpAgRIsSIECFChAgRIkSIECFChAgRIsSIECFChAgRIkSIECFChAgRIkSIECFChAgRIkSIECFCpAgRIkSIECFChAgRIkSIECFCpAgRIkSIECFChAgRIkSIECFChAgRIkSIECFChAgRIsSIECFChAgRIkSIECFChAgRIkSIECFChAgRIkSIECFChAgRIkSIECFCpAgRIkSIECFChAgRIsSIECFCpAgRIsSIECFChAgRIsSIECFChAgRIn9UVRsREf6eBgD0mZ95XlKMAAAAAElFTkSuQmCC'
  },
  {
    id: 'waterleak',
    name: 'Major Water Leakage (Urban)',
    category: 'Water Leakage',
    defaultTitle: 'Burst fresh water pipeline flooding lane 2',
    defaultDescription: 'Clean water is gushing out of a fractured main pipeline beneath the asphalt. Thousands of liters of water are being wasted.',
    base64Image: 'iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAABsklEQVR4nO3csU3DQBiGYTshfgXET2D0JoRREhLvgRdgipFIvBpX6kF8Be7A0JORX8H4PXrAHTCegB39H6w0bVM4scVO/v+TLMvYvXvv6pAsgfAzVbUVEesw8zWqqtXMewgRIsSIECFCpAgRIkSIECFChAgRIkSIECFChAgRIkSIECFChAgRIkSIECFCpAgRIkSIECFChAgRIkSIECFChAgRIkSIECFChAgRIkSIECFChAgRIkSIECFChAgRIkSIECFChAgRIkSIECFChAgRIkSIECFChAgRIkSIECFChAgRIsSIECFCpAgRIsSIECFChAgRIkSIECFChAgRIsSIECFChAgRIkSIECFChAgRIkSIECFChAgRIkSIECFCpAgRIkSIECFChAgRIkSIECFCpAgRIkSIECFChAgRIkSIECFChAgRIkSIECFChAgRIsSIECFChAgRIkSIECFChAgRIkSIECFChAgRIkSIECFChAgRIkSIECFCpAgRIkSIECFChAgRIsSIECFCpAgRIsSIECFChAgRIsSIECFChAgRIn9UVRsREf6eBgD0mZ95XlKMAAAAAElFTkSuQmCC'
  },
  {
    id: 'tubewell',
    name: 'Clogged Village Tube Well (Rural)',
    category: 'Community Tube Well',
    defaultTitle: 'Gram Panchayat public well dry/clogged',
    defaultDescription: 'The local community borewell lever is broken and the water output is highly turbid, muddy, and smelling of rust.',
    base64Image: 'iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAABsklEQVR4nO3csU3DQBiGYTshfgXET2D0JoRREhLvgRdgipFIvBpX6kF8Be7A0JORX8H4PXrAHTCegB39H6w0bVM4scVO/v+TLMvYvXvv6pAsgfAzVbUVEesw8zWqqtXMewgRIsSIECFCpAgRIkSIECFChAgRIkSIECFChAgRIkSIECFChAgRIkSIECFCpAgRIkSIECFChAgRIkSIECFChAgRIkSIECFChAgRIkSIECFChAgRIkSIECFChAgRIkSIECFChAgRIkSIECFChAgRIkSIECFChAgRIkSIECFChAgRIsSIECFCpAgRIsSIECFChAgRIkSIECFChAgRIsSIECFChAgRIkSIECFChAgRIkSIECFChAgRIkSIECFCpAgRIkSIECFChAgRIkSIECFCpAgRIkSIECFChAgRIkSIECFChAgRIkSIECFChAgRIsSIECFChAgRIkSIECFChAgRIkSIECFChAgRIkSIECFChAgRIkSIECFCpAgRIkSIECFChAgRIsSIECFCpAgRIsSIECFChAgRIsSIECFChAgRIn9UVRsREf6eBgD0mZ95XlKMAAAAAElFTkSuQmCC'
  },
  {
    id: 'drainage',
    name: 'Blocked Irrigation Canal (Rural)',
    category: 'Agricultural Drainage',
    defaultTitle: 'Silt blocked canal feeding northern fields',
    defaultDescription: 'Silt, agricultural runoff, and plastic debris have completely choked the concrete lining of the irrigation channel, flooding nearby dirt pathways.',
    base64Image: 'iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAABsklEQVR4nO3csU3DQBiGYTshfgXET2D0JoRREhLvgRdgipFIvBpX6kF8Be7A0JORX8H4PXrAHTCegB39H6w0bVM4scVO/v+TLMvYvXvv6pAsgfAzVbUVEesw8zWqqtXMewgRIsSIECFCpAgRIkSIECFChAgRIkSIECFChAgRIkSIECFChAgRIkSIECFCpAgRIkSIECFChAgRIkSIECFChAgRIkSIECFChAgRIkSIECFChAgRIkSIECFChAgRIkSIECFChAgRIkSIECFChAgRIkSIECFChAgRIkSIECFChAgRIsSIECFCpAgRIsSIECFChAgRIkSIECFChAgRIsSIECFChAgRIkSIECFChAgRIkSIECFChAgRIkSIECFCpAgRIkSIECFChAgRIkSIECFCpAgRIkSIECFChAgRIkSIECFChAgRIkSIECFChAgRIsSIECFChAgRIkSIECFChAgRIkSIECFChAgRIkSIECFChAgRIkSIECFCpAgRIkSIECFChAgRIsSIECFCpAgRIsSIECFChAgRIsSIECFChAgRIn9UVRsREf6eBgD0mZ95XlKMAAAAAElFTkSuQmCC'
  }
];

export const INITIAL_ISSUES: Issue[] = [
  {
    id: 'issue-101',
    title: 'Cracked bridge joint on Outer Ring Road',
    description: 'A 4-inch separation gap has formed on the flyover expansion joint near Sector 5. Extremely risky for fast-moving two-wheelers.',
    category: 'Pothole',
    status: 'In Progress',
    latitude: 12.9730,
    longitude: 77.5955,
    reportedBy: 'akashgurjarboss@gmail.com',
    reportedAt: '2026-06-25T14:30:00Z',
    upvotes: 48,
    upvotedBy: ['akashgurjarboss@gmail.com', 'user-2', 'user-3', 'user-4'],
    priorityScore: 33.6, // 48 * 0.7 = 33.6
    duplicateReports: [
      {
        id: 'dup-1',
        reportedAt: '2026-06-26T09:12:00Z',
        reportedBy: 'priya_sharma@gmail.com',
        description: 'Joint on bridge has expanded. Can feel the impact when driving over it.'
      }
    ],
    isRural: false
  },
  {
    id: 'issue-102',
    title: 'Water pipe rupture flooding main market street',
    description: 'Main municipal water pipe split open. Fresh water pouring into the street for 3 days, causing waterlogging in three shopping lanes.',
    category: 'Water Leakage',
    status: 'Reported',
    latitude: 12.9705,
    longitude: 77.5930,
    reportedBy: 'rajesh_b@yahoo.com',
    reportedAt: '2026-06-28T08:15:00Z',
    upvotes: 14,
    upvotedBy: ['user-2', 'user-10'],
    priorityScore: 10.4, // (14 * 0.7) + (1 * 0.3) = 9.8 + 0.3 = 10.1
    duplicateReports: [],
    isRural: false
  },
  {
    id: 'issue-103',
    title: 'Defective street lamp post #89 dark for a week',
    description: 'The lamp post near the local park has been dead. Residents feel very insecure walking in this alley after sunset.',
    category: 'Damaged Streetlight',
    status: 'Verified',
    latitude: 12.9755,
    longitude: 77.5910,
    reportedBy: 'sneha_patel@outlook.com',
    reportedAt: '2026-06-27T19:40:00Z',
    upvotes: 22,
    upvotedBy: ['user-3', 'user-5', 'user-6'],
    priorityScore: 15.4,
    duplicateReports: [],
    isRural: false
  },
  {
    id: 'issue-104',
    title: 'High voltage transformer sparking in rain',
    description: 'Local transformer emits large sparks during high humidity and rain. Fear of fire or complete power outage in the block.',
    category: 'Electricity Problem',
    status: 'Verified',
    latitude: 12.9690,
    longitude: 77.5960,
    reportedBy: 'karan_singh@gmail.com',
    reportedAt: '2026-06-26T21:10:00Z',
    upvotes: 62,
    upvotedBy: ['user-1', 'user-4', 'user-8', 'user-12'],
    priorityScore: 43.4,
    duplicateReports: [],
    isRural: false
  },
  {
    id: 'issue-105',
    title: 'Overflowing dump bins near community center',
    description: 'Garbage bins have not been cleared by the municipal truck for 5 days. Foul smell and stray dogs dispersing waste across the street.',
    category: 'Waste Management',
    status: 'Resolved',
    latitude: 12.9712,
    longitude: 77.5980,
    reportedBy: 'amit_sharma@gmail.com',
    reportedAt: '2026-06-24T07:00:00Z',
    upvotes: 35,
    upvotedBy: [],
    priorityScore: 24.5,
    duplicateReports: [],
    isRural: false
  },
  // Rural Issues
  {
    id: 'issue-201',
    title: 'Silt blocked irrigation canal inlet #4',
    description: 'Main concrete feeder canal is choked with river silt, blocking water supply to over 20 agricultural fields downstream.',
    category: 'Agricultural Drainage',
    status: 'In Progress',
    latitude: 13.1520,
    longitude: 77.8520,
    reportedBy: 'ramesh_patel@rural.org',
    reportedAt: '2026-06-26T06:00:00Z',
    upvotes: 80,
    upvotedBy: ['user-r1', 'user-r2', 'user-r3'],
    priorityScore: 56.6, // (80 * 0.7) + (2 * 0.3) = 56 + 0.6 = 56.6
    duplicateReports: [
      {
        id: 'dup-r1',
        reportedAt: '2026-06-27T08:00:00Z',
        reportedBy: 'village_head_kolar@gmail.com',
        description: 'Feeder is blocked, mud accumulation is heavy. Farmers unable to water crops.'
      },
      {
        id: 'dup-r2',
        reportedAt: '2026-06-27T10:30:00Z',
        reportedBy: 'devappa_b@gmail.com',
        description: 'Irrigation water has stopped completely due to silt blockage.'
      }
    ],
    isRural: true
  },
  {
    id: 'issue-202',
    title: 'Broken solar tube well motor near Panchayat house',
    description: 'The solar-powered community borehole has stopped pumping water completely. Requires service technician for the inverter circuit.',
    category: 'Community Tube Well',
    status: 'Reported',
    latitude: 13.1480,
    longitude: 77.8480,
    reportedBy: 'gowda_farmer@kolar.in',
    reportedAt: '2026-06-28T11:00:00Z',
    upvotes: 25,
    upvotedBy: ['user-r5'],
    priorityScore: 17.5,
    duplicateReports: [],
    isRural: true
  },
  {
    id: 'issue-203',
    title: 'Mud cave-in on primary mud road after monsoon',
    description: 'The mud path connecting Kolar central to the outer school has experienced a mini landslide, making bicycle travel impossible.',
    category: 'Village Path/Road',
    status: 'Verified',
    latitude: 13.1510,
    longitude: 77.8550,
    reportedBy: 'school_teacher_kolar@edu.in',
    reportedAt: '2026-06-27T15:30:00Z',
    upvotes: 45,
    upvotedBy: [],
    priorityScore: 31.5,
    duplicateReports: [],
    isRural: true
  }
];

export const MOCK_LEADERBOARD: LeaderboardUser[] = [
  { id: 'l1', name: 'Ramesh Patel', points: 420, reportsCount: 8, votesCount: 32, badge: 'Pioneer Warden', rank: 1 },
  { id: 'l2', name: 'Sneha Rao', points: 310, reportsCount: 5, votesCount: 24, badge: 'Civic Guardian', rank: 2 },
  { id: 'l3', name: 'Akash Gurjar', points: 285, reportsCount: 4, votesCount: 18, badge: 'Eagle Eye', rank: 3 },
  { id: 'l4', name: 'Priya Sharma', points: 190, reportsCount: 3, votesCount: 15, badge: 'Active Citizen', rank: 4 },
  { id: 'l5', name: 'Karan Singh', points: 150, reportsCount: 2, votesCount: 10, badge: 'Community Hero', rank: 5 }
];

export const MOCK_IMPACT = {
  totalIssuesReported: 342,
  totalResolved: 298,
  averageResolutionDays: 3.8,
  activeCitizenCount: 140,
  urbanResolutionPercent: 88,
  ruralResolutionPercent: 84
};
