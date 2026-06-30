export type UserRole = 'citizen' | 'urban_admin' | 'rural_admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
  points: number;
  badges: string[];
}

export interface LatLng {
  lat: number;
  lng: number;
}

export type IssueCategory =
  | 'Pothole'
  | 'Water Leakage'
  | 'Damaged Streetlight'
  | 'Electricity Problem'
  | 'Waste Management'
  | 'Agricultural Drainage'
  | 'Community Tube Well'
  | 'Village Path/Road'
  | 'Rural Water Supply'
  | 'Other';

export type IssueStatus = 'Reported' | 'Verified' | 'In Progress' | 'Resolved';

export interface DuplicateReport {
  id: string;
  reportedAt: string;
  reportedBy: string;
  imageUrl?: string;
  description?: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  status: IssueStatus;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  reportedBy: string;
  reportedAt: string;
  upvotes: number;
  upvotedBy: string[]; // List of user IDs who upvoted
  priorityScore: number;
  duplicateReports: DuplicateReport[];
  isRural: boolean; // Flag to filter rural vs urban easily
  isDeduplicated?: boolean;
  masterTicketId?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  issueId: string;
  isRead: boolean;
  createdAt: string;
  type: 'status_change' | 'duplicate_merged' | 'upvote_alert' | 'system';
}

export interface LeaderboardUser {
  id: string;
  name: string;
  points: number;
  reportsCount: number;
  votesCount: number;
  badge: string;
  rank: number;
}
