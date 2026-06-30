import React, { useState, useEffect, useRef } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Camera,
  Upload,
  ThumbsUp,
  User,
  Shield,
  Layers,
  ChevronRight,
  Filter,
  BarChart3,
  Award,
  Bell,
  RefreshCw,
  Search,
  Check,
  Building,
  Home,
  FileText,
  Info,
  Compass,
  Lock,
  Mail,
  LogOut,
  Key,
  Sparkles
} from 'lucide-react';
import { Issue, IssueCategory, IssueStatus, Notification, LeaderboardUser } from './types';
import { PRESET_ISSUES, URBAN_CENTER, RURAL_CENTER, PresetIssueType } from './data';

const DEMO_USERS = [
  {
    email: 'akashgurjarboss@gmail.com',
    name: 'Akash Gurjar',
    points: 285,
    badges: ['Eagle Eye', 'Civic Hero']
  },
  {
    email: 'ramesh_patel@rural.org',
    name: 'Ramesh Patel',
    points: 420,
    badges: ['Pioneer Warden', 'Active Citizen']
  },
  {
    email: 'priya_sharma@gmail.com',
    name: 'Priya Sharma',
    points: 190,
    badges: ['Civic Guardian']
  },
  {
    email: 'sneha_patel@outlook.com',
    name: 'Sneha Patel',
    points: 310,
    badges: ['Community Hero']
  }
];

export default function App() {
  // Authentication & Session State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loginEmail, setLoginEmail] = useState<string>('akashgurjarboss@gmail.com');
  const [loginPassword, setLoginPassword] = useState<string>('admin123');
  const [loginName, setLoginName] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');
  const [authTab, setAuthTab] = useState<'citizen' | 'admin'>('citizen');
  const [adminType, setAdminType] = useState<'urban_admin' | 'rural_admin'>('urban_admin');

  // Navigation & Role State
  const [currentRole, setCurrentRole] = useState<'citizen' | 'urban_admin' | 'rural_admin'>('citizen');
  const [activeTab, setActiveTab] = useState<'report' | 'feed' | 'impact' | 'leaderboard'>('report');

  // App Core State loaded from backend
  const [issues, setIssues] = useState<Issue[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // User Profile Simulation
  const [userEmail, setUserEmail] = useState<string>('akashgurjarboss@gmail.com');
  const [userName, setUserName] = useState<string>('Akash Gurjar');
  const [userPoints, setUserPoints] = useState<number>(285);
  const [userBadges, setUserBadges] = useState<string[]>(['Eagle Eye', 'Civic Hero']);

  // Report Form State
  const [formCategory, setFormCategory] = useState<IssueCategory>('Pothole');
  const [formTitle, setFormTitle] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formIsRural, setFormIsRural] = useState<boolean>(false);
  const [formLat, setFormLat] = useState<number>(URBAN_CENTER.lat);
  const [formLng, setFormLng] = useState<number>(URBAN_CENTER.lng);
  const [formImageUrl, setFormImageUrl] = useState<string>('');
  const [imageAnalyzing, setImageAnalyzing] = useState<boolean>(false);
  const [aiConfidence, setAiConfidence] = useState<number | null>(null);
  const [formSubmittedStatus, setFormSubmittedStatus] = useState<{ status: 'idle' | 'success' | 'merged' | 'error'; message: string; issueId?: string } | null>(null);

  // Filter/Search States for Citizen Feed
  const [feedFilterCategory, setFeedFilterCategory] = useState<string>('All');
  const [feedFilterStatus, setFeedFilterStatus] = useState<string>('All');
  const [feedSearchQuery, setFeedSearchQuery] = useState<string>('');
  const [feedScope, setFeedScope] = useState<'All' | 'Urban' | 'Rural'>('All');

  // Selected Issue for Detail Viewer
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

  // Admin Portal states
  const [adminSelectedCategory, setAdminSelectedCategory] = useState<string>('All');
  const [adminStatusFilter, setAdminStatusFilter] = useState<string>('All');
  const [adminSearchQuery, setAdminSearchQuery] = useState<string>('');
  const [adminRemarks, setAdminRemarks] = useState<string>('');
  const [adminActionLoading, setAdminActionLoading] = useState<string | null>(null);

  // Toast / System Alert
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Show Toast Helper
  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Citizen Sign-In Simulation Handler
  const handleCitizenLogin = (emailToUse: string, nameToUse?: string) => {
    if (!emailToUse || !emailToUse.includes('@')) {
      setLoginError('Please enter a valid Google Account email.');
      return;
    }
    setLoginError('');
    
    const matched = DEMO_USERS.find(u => u.email.toLowerCase() === emailToUse.toLowerCase());
    if (matched) {
      setUserEmail(matched.email);
      setUserName(matched.name);
      setUserPoints(matched.points);
      setUserBadges(matched.badges);
    } else {
      setUserEmail(emailToUse);
      const computedName = nameToUse || emailToUse.split('@')[0].split(/[._-]/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      setUserName(computedName);
      setUserPoints(50);
      setUserBadges(['First Steps']);
    }

    setCurrentRole('citizen');
    setIsLoggedIn(true);
    setActiveTab('report');
    setRefreshTrigger(prev => prev + 1);
    showToast(`Welcome back, ${matched ? matched.name : emailToUse}! Successfully signed in via Google Account.`, 'success');
  };

  // Administrative Officer Login Handler
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginEmail.includes('@')) {
      setLoginError('Please enter a valid professional email address.');
      return;
    }
    if (!loginPassword || loginPassword.length < 4) {
      setLoginError('Password must be at least 4 characters.');
      return;
    }
    setLoginError('');

    if (adminType === 'urban_admin') {
      setCurrentRole('urban_admin');
      setUserEmail(loginEmail);
      setUserName('Urban Municipal Commissioner');
      showToast('Welcome Officer! Authenticated successfully as Urban Admin.', 'success');
    } else {
      setCurrentRole('rural_admin');
      setUserEmail(loginEmail);
      setUserName('Panchayat Development Officer');
      showToast('Welcome Officer! Authenticated successfully as Panchayat Admin.', 'success');
    }
    setIsLoggedIn(true);
    setRefreshTrigger(prev => prev + 1);
  };

  // Sign out
  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoginEmail('akashgurjarboss@gmail.com');
    setLoginPassword('admin123');
    setLoginError('');
    showToast('Signed out successfully.', 'info');
  };

  // Fetch all issues & notifications
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [issuesRes, notifRes] = await Promise.all([
          fetch('/api/issues'),
          fetch(`/api/notifications?email=${encodeURIComponent(userEmail)}`)
        ]);

        if (issuesRes.ok) {
          const data = await issuesRes.json();
          setIssues(data);
        }
        if (notifRes.ok) {
          const data = await notifRes.json();
          setNotifications(data);
        }
      } catch (err) {
        console.error("Failed to load initial data from server:", err);
        showToast("Error connecting to server. Using local cache.", "error");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [refreshTrigger, userEmail]);

  // Adjust Form Coordinates default when switching rural flag
  useEffect(() => {
    if (formIsRural) {
      setFormLat(RURAL_CENTER.lat);
      setFormLng(RURAL_CENTER.lng);
      setFormCategory('Agricultural Drainage');
    } else {
      setFormLat(URBAN_CENTER.lat);
      setFormLng(URBAN_CENTER.lng);
      setFormCategory('Pothole');
    }
  }, [formIsRural]);

  // Auto Geolocation Helper
  const handleAutoLocate = () => {
    if (!navigator.geolocation) {
      showToast("Geolocation is not supported by your browser.", "error");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormLat(Number(latitude.toFixed(5)));
        setFormLng(Number(longitude.toFixed(5)));
        showToast("Fetched exact GPS coordinates from your device!", "success");
      },
      (error) => {
        console.error(error);
        showToast("Unable to retrieve location. Pin set to default area center.", "error");
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  // Analyze Image file or preset
  const handleImageAnalysis = async (base64String: string, fileName: string) => {
    setImageAnalyzing(true);
    setFormImageUrl(base64String);
    showToast("AI analyzing infrastructure defect from image...", "info");

    try {
      const res = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64Image: base64String, fileName })
      });

      if (res.ok) {
        const analysis = await res.json();
        setFormTitle(analysis.title || '');
        setFormDescription(analysis.description || '');
        if (analysis.category) {
          setFormCategory(analysis.category as IssueCategory);
        }
        if (analysis.confidence) {
          setAiConfidence(analysis.confidence);
        }
        showToast(`AI analysis complete! Categorized as ${analysis.category} (${Math.round(analysis.confidence * 100)}% confidence)`, "success");
      } else {
        showToast("AI Analyzer response failed. Manual override activated.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error connecting to AI Analysis engine.", "error");
    } finally {
      setImageAnalyzing(false);
    }
  };

  // Trigger file upload selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        handleImageAnalysis(reader.result, file.name);
      }
    };
    reader.onerror = () => showToast("Failed to read image file.", "error");
    reader.readAsDataURL(file);
  };

  // Trigger preset image click to facilitate testing
  const handlePresetSelect = (preset: PresetIssueType) => {
    const fakeBase64 = `data:image/png;base64,${preset.base64Image}`;
    handleImageAnalysis(fakeBase64, `${preset.id}.jpg`);
    setFormCategory(preset.category);
    // Determine automatically if rural
    if (preset.id === 'tubewell' || preset.id === 'drainage') {
      setFormIsRural(true);
    } else {
      setFormIsRural(false);
    }
  };

  // Submit Issue form
  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showToast("Please enter a title or upload an image for AI detection", "error");
      return;
    }

    try {
      const payload = {
        title: formTitle,
        description: formDescription,
        category: formCategory,
        latitude: formLat,
        longitude: formLng,
        imageUrl: formImageUrl || undefined,
        reportedBy: userEmail,
        isRural: formIsRural
      };

      const res = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const result = await res.json();
        if (result.status === 'merged') {
          setFormSubmittedStatus({
            status: 'merged',
            message: result.message,
            issueId: result.issueId
          });
          showToast("Deduplication Active: Report merged with matching ticket within 50m!", "info");
          // Boost user gamification points for contributing validation
          setUserPoints(prev => prev + 15);
        } else {
          setFormSubmittedStatus({
            status: 'success',
            message: result.message,
            issueId: result.issue?.id
          });
          showToast("Ticket created successfully! Citizen points awarded.", "success");
          setUserPoints(prev => prev + 50); // High points for fresh ticket
        }

        // Reset form variables
        setFormTitle('');
        setFormDescription('');
        setFormImageUrl('');
        setAiConfidence(null);
        setRefreshTrigger(prev => prev + 1);
      } else {
        const errData = await res.json();
        setFormSubmittedStatus({
          status: 'error',
          message: errData.error || "Failed to submit report"
        });
        showToast("Submission failed: " + (errData.error || "Unknown error"), "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error submitting report.", "error");
    }
  };

  // Upvote Action
  const handleUpvote = async (issueId: string) => {
    try {
      const res = await fetch(`/api/issues/${issueId}/upvote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userEmail })
      });

      if (res.ok) {
        const data = await res.json();
        showToast(data.upvotes > issues.find(i => i.id === issueId)!.upvotes ? "Upvoted issue!" : "Removed upvote");
        setUserPoints(prev => prev + 5); // award point for active validation
        setRefreshTrigger(prev => prev + 1);
      } else {
        showToast("Failed to register upvote", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error processing upvote.", "error");
    }
  };

  // Admin Action - Update Status
  const handleUpdateStatus = async (issueId: string, nextStatus: IssueStatus) => {
    setAdminActionLoading(issueId);
    try {
      const res = await fetch(`/api/issues/${issueId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: nextStatus,
          remarks: adminRemarks || undefined
        })
      });

      if (res.ok) {
        showToast(`Ticket status updated to ${nextStatus}`, "success");
        setAdminRemarks('');
        setRefreshTrigger(prev => prev + 1);
      } else {
        showToast("Failed to update status", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error processing update", "error");
    } finally {
      setAdminActionLoading(null);
    }
  };

  // Clear Read Notifications
  const handleMarkNotificationsRead = async () => {
    try {
      const res = await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail })
      });
      if (res.ok) {
        setRefreshTrigger(prev => prev + 1);
        showToast("All notifications marked as read.", "info");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Computed metrics for active view filters (Citizen Feed)
  const filteredIssues = issues.filter(issue => {
    // Search query match
    const matchesSearch =
      issue.title.toLowerCase().includes(feedSearchQuery.toLowerCase()) ||
      issue.description.toLowerCase().includes(feedSearchQuery.toLowerCase()) ||
      issue.category.toLowerCase().includes(feedSearchQuery.toLowerCase());

    // Category filter
    const matchesCategory = feedFilterCategory === 'All' || issue.category === feedFilterCategory;

    // Status filter
    const matchesStatus = feedFilterStatus === 'All' || issue.status === feedFilterStatus;

    // Scope filter (Urban / Rural)
    const matchesScope =
      feedScope === 'All' ||
      (feedScope === 'Urban' && !issue.isRural) ||
      (feedScope === 'Rural' && issue.isRural);

    return matchesSearch && matchesCategory && matchesStatus && matchesScope;
  });

  // Filtered issues for Admin Portals
  const adminFilteredIssues = issues.filter(issue => {
    // Filter rural vs urban based on active admin view
    const correctRoleScope = currentRole === 'urban_admin' ? !issue.isRural : issue.isRural;
    if (!correctRoleScope) return false;

    const matchesSearch =
      issue.title.toLowerCase().includes(adminSearchQuery.toLowerCase()) ||
      issue.description.toLowerCase().includes(adminSearchQuery.toLowerCase()) ||
      issue.id.toLowerCase().includes(adminSearchQuery.toLowerCase());

    const matchesCategory = adminSelectedCategory === 'All' || issue.category === adminSelectedCategory;
    const matchesStatus = adminStatusFilter === 'All' || issue.status === adminStatusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Find currently selected issue for detail display
  const selectedIssue = issues.find(i => i.id === selectedIssueId);

  // Auto select first issue detail if none is selected and list changes
  useEffect(() => {
    if (filteredIssues.length > 0 && !selectedIssueId) {
      setSelectedIssueId(filteredIssues[0].id);
    }
  }, [filteredIssues, selectedIssueId]);

  // Count unread notifications
  const unreadNotifCount = notifications.filter(n => !n.isRead).length;

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans selection:bg-teal-200">
        {/* Dynamic Toast Message */}
        {toast && (
          <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl border transition-all duration-300 animate-slide-in ${
            toast.type === 'success' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
              : toast.type === 'error' 
                ? 'bg-rose-50 border-rose-200 text-rose-800' 
                : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-600" />}
            {toast.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-600" />}
            {toast.type === 'info' && <Bell className="w-5 h-5 text-blue-600" />}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        )}

        {/* Minimal Login Header */}
        <header className="bg-white border-b border-slate-200 py-4 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-teal-600 text-white p-2 rounded-xl flex items-center justify-center shadow-md">
                <Compass className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="font-bold text-xl tracking-tight text-slate-900">Civic<span className="text-teal-600">Fix</span></span>
                <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[11px] font-semibold bg-slate-100 text-slate-600 rounded-full">AI GIS Claim Dispatch</span>
              </div>
            </div>
            <div className="text-xs text-slate-400 font-mono">Platform Gateway v2.4</div>
          </div>
        </header>

        {/* Main Section */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden">
            
            {/* Login Header info */}
            <div className="bg-slate-900 text-white p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_120%,rgba(20,184,166,0.25),transparent_70%)]"></div>
              <div className="relative z-10">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300 mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  Secure Citizen & Government Portal
                </span>
                <h2 className="text-2xl font-extrabold tracking-tight">Access CivicFix</h2>
                <p className="text-slate-400 text-xs mt-1">
                  Connect instantly to report public infrastructure defects or manage municipal ticket streams.
                </p>
              </div>
            </div>

            {/* Auth Tab Selectors */}
            <div className="grid grid-cols-2 border-b border-slate-100">
              <button
                type="button"
                id="tab-auth-citizen"
                onClick={() => { setAuthTab('citizen'); setLoginError(''); }}
                className={`py-3.5 text-xs font-bold transition-all border-b-2 text-center flex items-center justify-center gap-2 cursor-pointer ${
                  authTab === 'citizen'
                    ? 'border-teal-600 text-teal-700 bg-teal-50/20 font-extrabold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <User className="w-4 h-4" />
                Citizen Sign-In
              </button>
              <button
                type="button"
                id="tab-auth-admin"
                onClick={() => { setAuthTab('admin'); setLoginError(''); }}
                className={`py-3.5 text-xs font-bold transition-all border-b-2 text-center flex items-center justify-center gap-2 cursor-pointer ${
                  authTab === 'admin'
                    ? 'border-teal-600 text-teal-700 bg-teal-50/20 font-extrabold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Shield className="w-4 h-4" />
                Administrative Officer
              </button>
            </div>

            <div className="p-6">
              {loginError && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl text-xs flex items-center gap-2 font-medium">
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* 1. CITIZEN LOGIN VIEW */}
              {authTab === 'citizen' && (
                <div className="space-y-6">
                  {/* Google OAuth Simulation Button */}
                  <div>
                    <button
                      type="button"
                      id="btn-google-login"
                      onClick={() => handleCitizenLogin(loginEmail || 'akashgurjarboss@gmail.com')}
                      className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-sm transition-all shadow-xs cursor-pointer"
                    >
                      {/* Custom styled HTML Google Icon */}
                      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" width="100%" height="100%">
                        <path
                          fill="#EA4335"
                          d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.102C18.232 1.833 15.49 1 12.24 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.985 0-.74-.08-1.302-.178-1.859H12.24z"
                        />
                      </svg>
                      <span>Sign in with Google Account</span>
                    </button>
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-100"></div>
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-3 text-slate-400 font-semibold text-[10px]">Or enter google email manually</span>
                      </div>
                    </div>
                  </div>

                  {/* Manual email field */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-600">Google Account / Gmail</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        type="email"
                        id="input-citizen-email"
                        placeholder="yourname@gmail.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Standard Gmail triggers instant automatic Google account verification.
                    </p>
                  </div>

                  {/* Demo account triggers */}
                  <div className="space-y-2">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fast Testing Citizen Accounts</span>
                    <div className="grid grid-cols-2 gap-2">
                      {DEMO_USERS.map((user) => (
                        <button
                          type="button"
                          key={user.email}
                          id={`demo-user-${user.email.split('@')[0]}`}
                          onClick={() => {
                            setLoginEmail(user.email);
                            handleCitizenLogin(user.email, user.name);
                          }}
                          className="p-2 border border-slate-100 hover:border-teal-200 hover:bg-teal-50/10 rounded-xl text-left transition-all cursor-pointer"
                        >
                          <p className="font-bold text-[11px] text-slate-700 truncate">{user.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                          <div className="flex items-center justify-between mt-1 text-[9px] text-teal-600 font-bold">
                            <span>Points: {user.points}</span>
                            <span className="bg-slate-100 px-1 py-0.5 rounded text-slate-500">{user.badges[0]}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    id="btn-citizen-submit"
                    onClick={() => handleCitizenLogin(loginEmail)}
                    className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer"
                  >
                    <User className="w-4 h-4" />
                    Enter Citizen Dashboard
                  </button>
                </div>
              )}

              {/* 2. ADMINISTRATIVE OFFICER LOGIN VIEW */}
              {authTab === 'admin' && (
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  {/* Admin Role Scope Switcher */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-600">Select Department / Administration</label>
                    <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                      <button
                        type="button"
                        id="btn-admin-select-urban"
                        onClick={() => {
                          setAdminType('urban_admin');
                          setLoginEmail('urban@civicfix.gov');
                        }}
                        className={`py-2 px-3 rounded-lg text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                          adminType === 'urban_admin'
                            ? 'bg-teal-900 text-teal-100 shadow-sm'
                            : 'text-slate-600 hover:text-slate-800'
                        }`}
                      >
                        <Building className="w-3.5 h-3.5" />
                        Municipal (Urban)
                      </button>
                      <button
                        type="button"
                        id="btn-admin-select-rural"
                        onClick={() => {
                          setAdminType('rural_admin');
                          setLoginEmail('rural@civicfix.gov');
                        }}
                        className={`py-2 px-3 rounded-lg text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                          adminType === 'rural_admin'
                            ? 'bg-emerald-950 text-emerald-100 shadow-sm'
                            : 'text-slate-600 hover:text-slate-800'
                        }`}
                      >
                        <Home className="w-3.5 h-3.5" />
                        Panchayat (Rural)
                      </button>
                    </div>
                  </div>

                  {/* Credentials block */}
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-600">Officer Professional ID / Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                          type="email"
                          id="input-admin-email"
                          placeholder="officer@civicfix.gov"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-600">Secured Access Key / Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                          type="password"
                          id="input-admin-password"
                          placeholder="••••••••"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Quick autofill shortcut buttons */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Officer Credential Shortcuts</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        id="btn-autofill-urban"
                        onClick={() => {
                          setAdminType('urban_admin');
                          setLoginEmail('urban@civicfix.gov');
                          setLoginPassword('admin123');
                        }}
                        className="flex-1 py-1 px-2 border bg-white border-slate-200 hover:border-teal-300 hover:bg-teal-50/5 text-[10px] text-slate-600 rounded-lg text-center font-semibold transition-all cursor-pointer"
                      >
                        Municipal Urban
                      </button>
                      <button
                        type="button"
                        id="btn-autofill-rural"
                        onClick={() => {
                          setAdminType('rural_admin');
                          setLoginEmail('rural@civicfix.gov');
                          setLoginPassword('admin123');
                        }}
                        className="flex-1 py-1 px-2 border bg-white border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/5 text-[10px] text-slate-600 rounded-lg text-center font-semibold transition-all cursor-pointer"
                      >
                        Panchayat Rural
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    id="btn-admin-submit"
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer"
                  >
                    <Key className="w-4 h-4 text-slate-400" />
                    Verify Officer Credentials
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Minimal Footer */}
        <footer className="bg-slate-900 text-slate-500 py-6 border-t border-slate-800 text-center text-xs">
          <p>© 2026 CivicFix Municipal Engine. Secured by Central Public Infrastructure Gateway.</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-teal-200">
      
      {/* Dynamic Toast Message */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl border transition-all duration-300 animate-slide-in ${
          toast.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : toast.type === 'error' 
              ? 'bg-rose-50 border-rose-200 text-rose-800' 
              : 'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-600" />}
          {toast.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-600" />}
          {toast.type === 'info' && <Bell className="w-5 h-5 text-blue-600" />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* HEADER BAR */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="bg-teal-600 text-white p-2 rounded-xl flex items-center justify-center shadow-md shadow-teal-100">
                <Compass className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="font-bold text-xl tracking-tight text-slate-900">Civic<span className="text-teal-600">Fix</span></span>
                <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-xs font-semibold bg-slate-100 text-slate-600 rounded-full">AI-Powered Deduplication</span>
              </div>
            </div>

            {/* User Session Info / Logout */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-100 rounded-xl border border-slate-200/50">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs font-bold ${
                  currentRole === 'citizen' ? 'bg-teal-600' : currentRole === 'urban_admin' ? 'bg-indigo-900' : 'bg-emerald-800'
                }`}>
                  {currentRole === 'citizen' ? <User className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-[11px] font-bold text-slate-700 leading-none truncate max-w-[120px]">{userName}</p>
                  <p className="text-[9px] text-slate-400 leading-none mt-0.5 uppercase tracking-wider font-semibold">
                    {currentRole === 'citizen' ? `Citizen (${userPoints} pts)` : currentRole === 'urban_admin' ? 'Urban Admin' : 'Panchayat Admin'}
                  </p>
                </div>
              </div>

              {/* Refresh button */}
              <button
                onClick={() => setRefreshTrigger(prev => prev + 1)}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
                title="Refresh database records"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>

              {/* Sign Out Button */}
              <button
                id="btn-logout"
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 rounded-xl text-xs font-bold transition-all border border-rose-100/50 shadow-xs cursor-pointer"
                title="Sign out of current session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Sign Out</span>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* TOP NOTIFICATIONS TAPE (Simulating alert when updates happen) */}
      {unreadNotifCount > 0 && currentRole === 'citizen' && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2 text-center text-xs sm:text-sm font-medium flex items-center justify-center gap-2">
          <Bell className="w-4 h-4 text-amber-600 animate-bounce" />
          <span>You have {unreadNotifCount} unread administrative status alerts regarding your reported issues.</span>
          <button 
            onClick={handleMarkNotificationsRead}
            className="underline ml-2 hover:text-amber-950 font-bold"
          >
            Mark as read
          </button>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">

        {/* -------------------- CITIZEN PORTAL -------------------- */}
        {currentRole === 'citizen' && (
          <div className="flex flex-col gap-6">
            
            {/* HERO HERO SECTION */}
            <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(20,184,166,0.15),transparent_60%)]"></div>
              <div className="relative z-10 max-w-2xl">
                <span className="inline-block px-3 py-1 bg-teal-500/20 text-teal-300 font-semibold text-xs uppercase tracking-wider rounded-full mb-3">
                  Empowering Communities with AI
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
                  Resolve Local Infrastructure Instantly
                </h1>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  Upload an issue photo. Our AI automatically scans, categorizes, detects duplicates within <strong className="text-white">50 meters</strong> to group votes, and coordinates with Urban Municipalities or Rural Gram Panchayats.
                </p>
              </div>

              {/* Citizen Stats card */}
              <div className="relative z-10 bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/10 w-full md:w-auto min-w-[240px] flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="bg-teal-500 p-2 rounded-lg text-white">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-300 uppercase tracking-wider font-semibold">My Contributor Level</p>
                    <p className="text-lg font-bold text-white">{userName}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/15">
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase">Civic Points</span>
                    <span className="text-xl font-black text-teal-300">{userPoints} pts</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase">Badges Earned</span>
                    <span className="text-xs font-semibold px-2 py-0.5 bg-teal-400/20 text-teal-200 rounded-md inline-block mt-0.5">
                      {userBadges[0]}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* TAB NAVIGATION FOR CITIZEN PORTAL */}
            <div className="flex border-b border-slate-200 gap-1 sm:gap-4 overflow-x-auto pb-px">
              <button
                id="tab-report"
                onClick={() => setActiveTab('report')}
                className={`py-3 px-4 font-semibold text-sm border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'report'
                    ? 'border-teal-600 text-teal-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Camera className="w-4 h-4" />
                Report Infrastructure Issue
              </button>
              <button
                id="tab-feed"
                onClick={() => setActiveTab('feed')}
                className={`py-3 px-4 font-semibold text-sm border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'feed'
                    ? 'border-teal-600 text-teal-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Layers className="w-4 h-4" />
                Public Feed & Interactive Map
                {issues.length > 0 && (
                  <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded-full text-xs font-bold">
                    {issues.length}
                  </span>
                )}
              </button>
              <button
                id="tab-impact"
                onClick={() => setActiveTab('impact')}
                className={`py-3 px-4 font-semibold text-sm border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'impact'
                    ? 'border-teal-600 text-teal-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Impact Dashboard
              </button>
              <button
                id="tab-leaderboard"
                onClick={() => setActiveTab('leaderboard')}
                className={`py-3 px-4 font-semibold text-sm border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'leaderboard'
                    ? 'border-teal-600 text-teal-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Award className="w-4 h-4" />
                Citizen Leaderboard
              </button>
            </div>

            {/* TAB CONTENT: REPORT FORM */}
            {activeTab === 'report' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Reporting Instructions and Fast Presets */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                  
                  {/* Visual Test Tool - File Upload Helper Presets */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                    <h3 className="text-md font-bold text-slate-950 mb-1 flex items-center gap-2">
                      <Camera className="w-4 h-4 text-teal-600" />
                      Visual Analyzer Test Suite
                    </h3>
                    <p className="text-xs text-slate-500 mb-4">
                      No photo of a broken pothole or blocked canal on your machine? Select one of our instant pre-loaded community issues to simulate camera capture and see the AI analyze and auto-fill coordinates in real-time!
                    </p>

                    <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                      {PRESET_ISSUES.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handlePresetSelect(preset)}
                          className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-teal-500 hover:bg-teal-50/20 transition-all flex gap-3 items-center"
                        >
                          {/* Colored visual placeholder for base64 preset image */}
                          <div className="w-12 h-12 rounded-lg bg-slate-100 flex-shrink-0 flex items-center justify-center border border-slate-200 overflow-hidden">
                            <img 
                              src={`data:image/png;base64,${preset.base64Image}`} 
                              alt={preset.name}
                              className="w-full h-full object-cover" 
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">{preset.name}</p>
                            <span className="inline-block px-1.5 py-0.5 text-[10px] bg-slate-100 text-slate-600 rounded mt-0.5 font-medium">
                              {preset.category}
                            </span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Deduplication mechanism info */}
                  <div className="bg-teal-50/50 border border-teal-100 p-6 rounded-2xl">
                    <h4 className="text-sm font-bold text-teal-950 mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-teal-700" />
                      Spatial Deduplication Active
                    </h4>
                    <p className="text-xs text-teal-800 leading-relaxed mb-2">
                      To prevent administrative backlog, CivicFix scans a <strong className="text-teal-950 font-semibold">50-meter radius</strong> of your report. If another unresolved ticket of the same category exists:
                    </p>
                    <ul className="text-xs text-teal-800 space-y-1.5 list-disc pl-4">
                      <li>Your photo/description is linked under the existing <strong>Master Ticket</strong>.</li>
                      <li>The Master Ticket's upvote score is incremented automatically.</li>
                      <li>Priority is re-calculated instantly, pushing the issue to the top of Admin Dashboards.</li>
                    </ul>
                  </div>

                  {/* Geolocation selector assistance */}
                  <div className="bg-slate-100/50 p-5 rounded-2xl border border-slate-200">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      Regional Boundaries Check
                    </h4>
                    <div className="space-y-2 text-xs text-slate-600">
                      <p>
                        <strong>Bangalore Urban:</strong> Coordinates near lat <code className="bg-white px-1 rounded">12.97</code>, lng <code className="bg-white px-1 rounded">77.59</code>
                      </p>
                      <p>
                        <strong>Kolar Rural:</strong> Coordinates near lat <code className="bg-white px-1 rounded">13.15</code>, lng <code className="bg-white px-1 rounded">77.85</code>
                      </p>
                    </div>
                  </div>

                </div>

                {/* Form Inputs and Interactive Coordinate Map */}
                <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-6">
                  
                  <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">New Infrastructure Ticket</h2>
                      <p className="text-xs text-slate-500">Provide photos or describe the issue to launch AI analysis</p>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setFormIsRural(false)}
                        className={`px-2.5 py-1 text-xs font-bold rounded ${!formIsRural ? 'bg-white text-teal-700 shadow-xs' : 'text-slate-600'}`}
                      >
                        Urban Zone
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormIsRural(true)}
                        className={`px-2.5 py-1 text-xs font-bold rounded ${formIsRural ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'}`}
                      >
                        Rural Zone
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleReportSubmit} className="space-y-5">
                    
                    {/* Media Upload Box */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Upload Issue Evidence (Drag & Drop or Capture)
                      </label>
                      
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                          formImageUrl 
                            ? 'border-emerald-500 bg-emerald-50/20' 
                            : 'border-slate-300 hover:border-teal-500 hover:bg-teal-50/10'
                        }`}
                      >
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          onChange={handleFileChange} 
                          accept="image/*" 
                          className="hidden" 
                        />
                        
                        {formImageUrl ? (
                          <div className="flex items-center gap-4 w-full">
                            <div className="w-16 h-16 rounded-lg bg-slate-100 border overflow-hidden flex-shrink-0">
                              <img src={formImageUrl} alt="Uploaded evidence" className="w-full h-full object-cover" />
                            </div>
                            <div className="text-left flex-1 min-w-0">
                              <p className="text-xs font-bold text-emerald-800 truncate">Image attached successfully</p>
                              {imageAnalyzing ? (
                                <p className="text-xs text-teal-600 flex items-center gap-1.5 font-medium">
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  Running Gemini image analyzer...
                                </p>
                              ) : (
                                <p className="text-xs text-slate-500">
                                  {aiConfidence ? `AI confident: ${Math.round(aiConfidence * 100)}%` : 'Manual properties parsed.'}
                                </p>
                              )}
                            </div>
                            <button 
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setFormImageUrl(''); setAiConfidence(null); }}
                              className="text-xs font-bold text-slate-400 hover:text-rose-600 px-2 py-1 bg-white border rounded-lg shadow-2xs"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="p-3 bg-slate-100 text-slate-600 rounded-full">
                              <Upload className="w-6 h-6 text-slate-500" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-700">Click to upload file, or drag & drop</p>
                              <p className="text-xs text-slate-500 mt-1">PNG, JPG, JPEG up to 10MB. HTML5 camera capture supported.</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Auto Categorization Feedback Area */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                          Category
                        </label>
                        <select
                          value={formCategory}
                          onChange={(e) => setFormCategory(e.target.value as IssueCategory)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                        >
                          {/* Render either urban or rural-centric options prioritized */}
                          {!formIsRural ? (
                            <>
                              <option value="Pothole">Pothole (Roads/Bridges)</option>
                              <option value="Damaged Streetlight">Damaged Streetlight</option>
                              <option value="Water Leakage">Water Leakage</option>
                              <option value="Electricity Problem">Electricity Problem</option>
                              <option value="Waste Management">Waste Management</option>
                              <option value="Other">Other Category</option>
                            </>
                          ) : (
                            <>
                              <option value="Agricultural Drainage">Agricultural Drainage</option>
                              <option value="Community Tube Well">Community Tube Well</option>
                              <option value="Village Path/Road">Village Path/Road</option>
                              <option value="Rural Water Supply">Rural Water Supply</option>
                              <option value="Other">Other Category</option>
                            </>
                          )}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                          Auto-Fetch GPS Coordinates
                        </label>
                        <button
                          type="button"
                          onClick={handleAutoLocate}
                          className="w-full px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all border border-slate-300 flex items-center justify-center gap-2 h-[38px]"
                        >
                          <MapPin className="w-4 h-4 text-teal-600" />
                          Fetch Live GPS (HTML5 API)
                        </button>
                      </div>
                    </div>

                    {/* Latitude and Longitude fields with sliders */}
                    <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border">
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                          Latitude (North-South)
                        </label>
                        <input
                          type="number"
                          step="0.0001"
                          value={formLat}
                          onChange={(e) => setFormLat(Number(e.target.value))}
                          className="w-full px-2.5 py-1 text-xs border rounded-lg bg-white"
                        />
                        {/* Interactive sliders to easily tweak lat/lng to test deduplication */}
                        <input
                          type="range"
                          min={formIsRural ? RURAL_CENTER.lat - 0.01 : URBAN_CENTER.lat - 0.01}
                          max={formIsRural ? RURAL_CENTER.lat + 0.01 : URBAN_CENTER.lat + 0.01}
                          step="0.0001"
                          value={formLat}
                          onChange={(e) => setFormLat(Number(e.target.value))}
                          className="w-full mt-2 accent-teal-600"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                          Longitude (East-West)
                        </label>
                        <input
                          type="number"
                          step="0.0001"
                          value={formLng}
                          onChange={(e) => setFormLng(Number(e.target.value))}
                          className="w-full px-2.5 py-1 text-xs border rounded-lg bg-white"
                        />
                        <input
                          type="range"
                          min={formIsRural ? RURAL_CENTER.lng - 0.01 : URBAN_CENTER.lng - 0.01}
                          max={formIsRural ? RURAL_CENTER.lng + 0.01 : URBAN_CENTER.lng + 0.01}
                          step="0.0001"
                          value={formLng}
                          onChange={(e) => setFormLng(Number(e.target.value))}
                          className="w-full mt-2 accent-teal-600"
                        />
                      </div>
                      <div className="col-span-2 text-center">
                        <span className="text-[10px] font-semibold text-slate-400">
                          💡 Slide to fine-tune. Move close to another ticket to trigger the 50m Deduplication scan.
                        </span>
                      </div>
                    </div>

                    {/* Title input */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Issue Title
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Deep Pothole on Sector 5 main crossing"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>

                    {/* Description input */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Detailed Description (Optional)
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Provide details of the hazard, traffic obstruction or damage..."
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>

                    {/* Submit buttons */}
                    <button
                      type="submit"
                      className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-all shadow-md shadow-teal-100 flex items-center justify-center gap-2"
                    >
                      <Check className="w-5 h-5" />
                      Verify and File Issue Ticket
                    </button>

                  </form>

                  {/* Submission Success/Deduplication Merged Banner */}
                  {formSubmittedStatus && (
                    <div className={`p-4 rounded-xl border ${
                      formSubmittedStatus.status === 'merged' 
                        ? 'bg-amber-50 border-amber-200 text-amber-900' 
                        : formSubmittedStatus.status === 'success'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          : 'bg-rose-50 border-rose-200 text-rose-900'
                    }`}>
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {formSubmittedStatus.status === 'merged' ? (
                            <Layers className="w-5 h-5 text-amber-600" />
                          ) : formSubmittedStatus.status === 'success' ? (
                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-rose-600" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold">
                            {formSubmittedStatus.status === 'merged' ? 'AI Duplicate Grouping Triggered' : 'Transaction Processing Complete'}
                          </p>
                          <p className="text-xs mt-1 text-slate-600 leading-relaxed">
                            {formSubmittedStatus.message}
                          </p>
                          {formSubmittedStatus.issueId && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedIssueId(formSubmittedStatus.issueId!);
                                setActiveTab('feed');
                                setFormSubmittedStatus(null);
                              }}
                              className="text-xs font-bold text-teal-700 hover:underline mt-2 flex items-center gap-1"
                            >
                              Go view this ticket details on the live tracker <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                </div>

              </div>
            )}

            {/* TAB CONTENT: PUBLIC FEED & INTERACTIVE MAP */}
            {activeTab === 'feed' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Filters, Map, and List Selector */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                  
                  {/* Filter Toolbar */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                          <Filter className="w-4 h-4 text-slate-500" />
                          Refine Ongoing Issues
                        </h3>
                      </div>

                      {/* Scope filter */}
                      <div className="flex items-center gap-1.5 bg-slate-100 p-0.5 rounded-lg text-xs">
                        <button 
                          onClick={() => setFeedScope('All')}
                          className={`px-2.5 py-1 rounded font-bold transition-all ${feedScope === 'All' ? 'bg-white text-teal-800 shadow-2xs' : 'text-slate-500'}`}
                        >
                          All Zones
                        </button>
                        <button 
                          onClick={() => setFeedScope('Urban')}
                          className={`px-2.5 py-1 rounded font-bold transition-all ${feedScope === 'Urban' ? 'bg-white text-teal-800 shadow-2xs' : 'text-slate-500'}`}
                        >
                          Urban Only
                        </button>
                        <button 
                          onClick={() => setFeedScope('Rural')}
                          className={`px-2.5 py-1 rounded font-bold transition-all ${feedScope === 'Rural' ? 'bg-white text-teal-800 shadow-2xs' : 'text-slate-500'}`}
                        >
                          Rural Only
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      
                      {/* Search */}
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Search className="w-4 h-4 text-slate-400" />
                        </span>
                        <input
                          type="text"
                          placeholder="Search keyword..."
                          value={feedSearchQuery}
                          onChange={(e) => setFeedSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs bg-slate-50/50"
                        />
                      </div>

                      {/* Category filter select */}
                      <div>
                        <select
                          value={feedFilterCategory}
                          onChange={(e) => setFeedFilterCategory(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-slate-50/50"
                        >
                          <option value="All">All Categories</option>
                          <option value="Pothole">Potholes</option>
                          <option value="Water Leakage">Water Leakage</option>
                          <option value="Damaged Streetlight">Streetlights</option>
                          <option value="Electricity Problem">Electricity Problems</option>
                          <option value="Waste Management">Waste Management</option>
                          <option value="Agricultural Drainage">Irrigation/Drainage</option>
                          <option value="Community Tube Well">Tube Wells</option>
                          <option value="Village Path/Road">Village Paths</option>
                        </select>
                      </div>

                      {/* Status select */}
                      <div>
                        <select
                          value={feedFilterStatus}
                          onChange={(e) => setFeedFilterStatus(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-slate-50/50"
                        >
                          <option value="All">All Statuses</option>
                          <option value="Reported">Reported</option>
                          <option value="Verified">Verified</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      </div>

                    </div>
                  </div>

                  {/* Interactive Vector Grid Map Canvas (Beautiful stylized SVG representing coordinates) */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-teal-600" />
                        Aesthetic Interactive Vector Map ({feedScope === 'Rural' ? 'Kolar Rural' : 'Bangalore Urban'} Center)
                      </span>
                      <span className="text-slate-500 font-semibold">
                        Click pins to view status
                      </span>
                    </div>

                    {/* The styled map canvas */}
                    <div className="relative aspect-video rounded-xl bg-slate-900 overflow-hidden border border-slate-800 flex items-center justify-center">
                      
                      {/* Grid background layout styling */}
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-40"></div>
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(13,148,136,0.15),transparent_80%)]"></div>

                      {/* Center Zone labels */}
                      <div className="absolute top-4 left-4 bg-slate-850/85 text-slate-400 px-2.5 py-1 rounded text-[10px] font-mono border border-slate-800 backdrop-blur-xs">
                        {feedScope === 'Rural' ? 'REGION: KOLAR GRAM PANCHAYAT' : 'REGION: BANGALORE MUNICIPALITY'}
                      </div>

                      {/* SVG Canvas overlay mapping coordinate offsets */}
                      <svg className="absolute inset-0 w-full h-full">
                        {filteredIssues.map((issue) => {
                          // Standardize scaling.
                          // Urban center: lat 12.9716, lng 77.5946
                          // Rural center: lat 13.1500, lng 77.8500
                          const cLat = issue.isRural ? RURAL_CENTER.lat : URBAN_CENTER.lat;
                          const cLng = issue.isRural ? RURAL_CENTER.lng : URBAN_CENTER.lng;

                          // convert lat/lng offset to coordinates %
                          const xPercent = 50 + (issue.longitude - cLng) * 3500;
                          const yPercent = 50 - (issue.latitude - cLat) * 3500;

                          // check if coordinates fall inside visual boundaries
                          if (xPercent < 5 || xPercent > 95 || yPercent < 5 || yPercent > 95) return null;

                          const isSelected = selectedIssueId === issue.id;

                          // Pin Color based on status
                          let pinColor = '#f59e0b'; // Amber for Reported/Verified
                          if (issue.status === 'In Progress') pinColor = '#06b6d4'; // Cyan
                          if (issue.status === 'Resolved') pinColor = '#10b981'; // Emerald

                          return (
                            <g key={issue.id} className="cursor-pointer group" onClick={() => setSelectedIssueId(issue.id)}>
                              {/* 50-meter deduplication scanner ring radius indicator on hover or selected */}
                              <circle
                                cx={`${xPercent}%`}
                                cy={`${yPercent}%`}
                                r={isSelected ? "25" : "12"}
                                fill={pinColor}
                                fillOpacity={isSelected ? "0.15" : "0.0"}
                                stroke={pinColor}
                                strokeDasharray={isSelected ? "3 3" : "0"}
                                strokeOpacity={isSelected ? "0.6" : "0"}
                                className="transition-all duration-300"
                              />

                              {/* Glowing center dot */}
                              <circle
                                cx={`${xPercent}%`}
                                cy={`${yPercent}%`}
                                r={isSelected ? "7" : "5"}
                                fill={pinColor}
                                className="transition-all duration-300"
                              />

                              {/* Pulse ring for resolved vs critical */}
                              <circle
                                cx={`${xPercent}%`}
                                cy={`${yPercent}%`}
                                r={isSelected ? "14" : "9"}
                                fill="none"
                                stroke={pinColor}
                                strokeWidth="1.5"
                                opacity={isSelected ? "0.8" : "0.3"}
                                className="animate-ping"
                                style={{ animationDuration: isSelected ? '1.5s' : '3s' }}
                              />
                            </g>
                          );
                        })}
                      </svg>

                      {/* No issues found on map */}
                      {filteredIssues.length === 0 && (
                        <div className="relative z-10 text-center p-4">
                          <Compass className="w-8 h-8 text-slate-600 mx-auto mb-2 animate-spin" />
                          <p className="text-xs font-bold text-slate-400">No reported tickets found matching the filter</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-[10px] text-slate-500 font-bold justify-center pt-1 border-t">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-amber-500 rounded-full inline-block"></span>
                        Reported/Verified
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-cyan-500 rounded-full inline-block"></span>
                        In Progress
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block"></span>
                        Resolved
                      </span>
                      <span className="text-slate-400">|</span>
                      <span className="text-slate-400">Scanner range indicates 50m Deduplication Zone</span>
                    </div>

                  </div>

                  {/* List of Issues */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Ranked list by Priority Score ({filteredIssues.length})
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        Priority = (Upvotes * 0.7) + (Duplicates * 0.3)
                      </span>
                    </div>

                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                      {filteredIssues.map((issue) => {
                        const isSelected = selectedIssueId === issue.id;
                        const duplicatesCount = issue.duplicateReports?.length || 0;

                        return (
                          <div
                            key={issue.id}
                            onClick={() => setSelectedIssueId(issue.id)}
                            className={`p-4 rounded-xl border transition-all text-left cursor-pointer flex gap-4 ${
                              isSelected 
                                ? 'bg-white border-teal-500 shadow-md ring-1 ring-teal-500/20' 
                                : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                            }`}
                          >
                            {/* Priority badge */}
                            <div className="flex flex-col items-center justify-center bg-slate-50 border border-slate-100 rounded-lg p-2 min-w-[54px] h-fit self-start">
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Priority</span>
                              <span className="text-sm font-black text-slate-800">{issue.priorityScore}</span>
                            </div>

                            {/* Ticket Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                                  issue.isRural ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-sky-50 text-sky-800 border border-sky-200'
                                }`}>
                                  {issue.isRural ? 'Rural Area' : 'Urban Zone'}
                                </span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  issue.status === 'Resolved' 
                                    ? 'bg-emerald-100 text-emerald-800' 
                                    : issue.status === 'In Progress'
                                      ? 'bg-cyan-100 text-cyan-800'
                                      : issue.status === 'Verified'
                                        ? 'bg-indigo-100 text-indigo-800'
                                        : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {issue.status}
                                </span>
                              </div>

                              <h4 className="text-sm font-bold text-slate-900 mt-2 line-clamp-1">{issue.title}</h4>
                              <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{issue.description}</p>

                              {/* Ticket Footer metadata */}
                              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-400 font-medium">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                  {issue.category}
                                </span>
                                <div className="flex items-center gap-3">
                                  {duplicatesCount > 0 && (
                                    <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                      +{duplicatesCount} duplicate merged
                                    </span>
                                  )}
                                  <span className="flex items-center gap-1 text-slate-500">
                                    <Clock className="w-3 h-3" />
                                    {new Date(issue.reportedAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {filteredIssues.length === 0 && (
                        <div className="text-center py-12 bg-white rounded-2xl border border-dashed text-slate-500">
                          <Compass className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                          <p className="text-sm font-bold">No issues match current search filters.</p>
                          <p className="text-xs text-slate-400 mt-1">Try resetting the status/category tags or change the regional scope.</p>
                        </div>
                      )}
                    </div>

                  </div>

                </div>

                {/* Right Panel: Selected Ticket Live Tracker Detail Drawer */}
                <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-6 h-fit sticky top-24">
                  
                  {selectedIssue ? (
                    <>
                      {/* Header title */}
                      <div className="border-b border-slate-100 pb-4">
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ticket Tracker Detail</span>
                          <span className="text-xs font-mono text-slate-400">ID: {selectedIssue.id}</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 leading-snug">{selectedIssue.title}</h3>
                        
                        <div className="flex flex-wrap gap-2 mt-3">
                          <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold">
                            {selectedIssue.category}
                          </span>
                          <span className={`px-2.5 py-0.5 text-xs font-bold rounded-lg ${
                            selectedIssue.isRural ? 'bg-emerald-50 text-emerald-800' : 'bg-sky-50 text-sky-800'
                          }`}>
                            {selectedIssue.isRural ? 'Gram Panchayat' : 'Urban Corporation'}
                          </span>
                        </div>
                      </div>

                      {/* Image evidence or placeholder */}
                      <div className="aspect-video rounded-xl bg-slate-100 border border-slate-200 overflow-hidden relative flex items-center justify-center">
                        {selectedIssue.imageUrl ? (
                          <img 
                            src={selectedIssue.imageUrl} 
                            alt={selectedIssue.title} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center p-4">
                            <Camera className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                            <p className="text-xs text-slate-400">No photo was supplied during reporting</p>
                          </div>
                        )}
                        <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white px-2 py-1 rounded text-[10px] font-mono">
                          GPS: {selectedIssue.latitude.toFixed(4)}, {selectedIssue.longitude.toFixed(4)}
                        </div>
                      </div>

                      {/* Description and metadata */}
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Citizen Narrative</p>
                          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border">
                            {selectedIssue.description || "No narrative details added. Auto-categorized via image metadata."}
                          </p>
                        </div>

                        {/* Interactive Upvoter validate button */}
                        <div className="flex items-center justify-between p-3 bg-teal-50/55 rounded-xl border border-teal-100">
                          <div>
                            <p className="text-xs font-bold text-teal-950">Is this issue still unresolved?</p>
                            <p className="text-[10px] text-teal-800">Upvote to validate and escalate the municipal priority.</p>
                          </div>
                          <button
                            id={`btn-upvote-${selectedIssue.id}`}
                            onClick={() => handleUpvote(selectedIssue.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                              selectedIssue.upvotedBy?.includes(userEmail)
                                ? 'bg-teal-600 text-white shadow-xs'
                                : 'bg-white text-teal-700 border border-teal-200 hover:bg-teal-50'
                            }`}
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            {selectedIssue.upvotedBy?.includes(userEmail) ? 'Upvoted' : 'Upvote'} ({selectedIssue.upvotes})
                          </button>
                        </div>
                      </div>

                      {/* Visual Timeline Stepper */}
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Live Administrative Stepper</p>
                        <div className="space-y-4 relative pl-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                          
                          {/* Step 1: Reported */}
                          <div className="relative flex gap-3 items-start">
                            <span className="absolute -left-[14px] bg-emerald-500 text-white p-0.5 rounded-full z-10">
                              <Check className="w-2 h-2" />
                            </span>
                            <div>
                              <p className="text-xs font-bold text-slate-900">Report Registered (Master Ticket)</p>
                              <p className="text-[10px] text-slate-400">{new Date(selectedIssue.reportedAt).toLocaleString()}</p>
                            </div>
                          </div>

                          {/* Step 2: Verified */}
                          <div className="relative flex gap-3 items-start">
                            <span className={`absolute -left-[14px] p-0.5 rounded-full z-10 ${
                              ['Verified', 'In Progress', 'Resolved'].includes(selectedIssue.status)
                                ? 'bg-emerald-500 text-white'
                                : 'bg-slate-200 text-slate-400'
                            }`}>
                              {['Verified', 'In Progress', 'Resolved'].includes(selectedIssue.status) ? (
                                <Check className="w-2 h-2" />
                              ) : (
                                <span className="w-2 h-2 block rounded-full"></span>
                              )}
                            </span>
                            <div>
                              <p className={`text-xs font-bold ${
                                ['Verified', 'In Progress', 'Resolved'].includes(selectedIssue.status) ? 'text-slate-900' : 'text-slate-400'
                              }`}>
                                Engineering Inspector Verification
                              </p>
                              {['Verified', 'In Progress', 'Resolved'].includes(selectedIssue.status) && (
                                <p className="text-[10px] text-slate-500">Coordinates confirmed within sector boundaries.</p>
                              )}
                            </div>
                          </div>

                          {/* Step 3: In Progress */}
                          <div className="relative flex gap-3 items-start">
                            <span className={`absolute -left-[14px] p-0.5 rounded-full z-10 ${
                              ['In Progress', 'Resolved'].includes(selectedIssue.status)
                                ? 'bg-emerald-500 text-white'
                                : 'bg-slate-200 text-slate-400'
                            }`}>
                              {['In Progress', 'Resolved'].includes(selectedIssue.status) ? (
                                <Check className="w-2 h-2" />
                              ) : (
                                <span className="w-2 h-2 block rounded-full"></span>
                              )}
                            </span>
                            <div>
                              <p className={`text-xs font-bold ${
                                ['In Progress', 'Resolved'].includes(selectedIssue.status) ? 'text-slate-900' : 'text-slate-400'
                              }`}>
                                Maintenance Team Dispatched
                              </p>
                              {selectedIssue.status === 'In Progress' && (
                                <p className="text-[10px] text-teal-600 font-bold animate-pulse">Contractor actively working on site.</p>
                              )}
                            </div>
                          </div>

                          {/* Step 4: Resolved */}
                          <div className="relative flex gap-3 items-start">
                            <span className={`absolute -left-[14px] p-0.5 rounded-full z-10 ${
                              selectedIssue.status === 'Resolved'
                                ? 'bg-emerald-500 text-white'
                                : 'bg-slate-200 text-slate-400'
                            }`}>
                              {selectedIssue.status === 'Resolved' ? (
                                <Check className="w-2 h-2" />
                              ) : (
                                <span className="w-2 h-2 block rounded-full"></span>
                              )}
                            </span>
                            <div>
                              <p className={`text-xs font-bold ${
                                selectedIssue.status === 'Resolved' ? 'text-slate-900' : 'text-slate-400'
                              }`}>
                                Issue Resolved & Closed
                              </p>
                              {selectedIssue.status === 'Resolved' && (
                                <p className="text-[10px] text-emerald-600 font-bold">Verification photos updated. Notification sent.</p>
                              )}
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* Duplicate reports listing merged under this ticket */}
                      {selectedIssue.duplicateReports && selectedIssue.duplicateReports.length > 0 && (
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-slate-500" />
                            Merged Duplicate Submissions ({selectedIssue.duplicateReports.length})
                          </p>
                          <p className="text-[10px] text-slate-500 mb-3 leading-relaxed">
                            These reports occurred within 50 meters and were linked to prevent map pollution while accelerating prioritization score.
                          </p>

                          <div className="space-y-2 max-h-[160px] overflow-y-auto">
                            {selectedIssue.duplicateReports.map((dup, index) => (
                              <div key={dup.id || index} className="p-2.5 bg-white border border-slate-100 rounded-lg text-[11px] space-y-1">
                                <div className="flex justify-between items-center text-slate-400 font-semibold">
                                  <span>Reporter: {dup.reportedBy.split('@')[0]}</span>
                                  <span>{new Date(dup.reportedAt).toLocaleDateString()}</span>
                                </div>
                                <p className="text-slate-600 italic">"{dup.description}"</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </>
                  ) : (
                    <div className="text-center py-12 text-slate-500">
                      <Compass className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm font-bold">Select an issue from the left list or click a map pin to inspect progress and upvote.</p>
                    </div>
                  )}

                </div>

              </div>
            )}

            {/* TAB CONTENT: IMPACT DASHBOARD */}
            {activeTab === 'impact' && (
              <div className="space-y-8">
                
                {/* Stats row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Reports Registered</p>
                    <p className="text-3xl font-black text-slate-900 mt-2">1,248</p>
                    <span className="text-[10px] text-emerald-600 font-bold mt-1 inline-block">↑ 12% increase this month</span>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Verified Resolution Rate</p>
                    <p className="text-3xl font-black text-teal-600 mt-2">91.4%</p>
                    <span className="text-[10px] text-slate-400 font-medium mt-1 inline-block">Municipal & Panchayat combined</span>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average Resolution Speed</p>
                    <p className="text-3xl font-black text-slate-900 mt-2">3.8 Days</p>
                    <span className="text-[10px] text-teal-600 font-bold mt-1 inline-block">⏱ 1.4 Days faster than manual filing</span>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Duplicates Deduplicated</p>
                    <p className="text-3xl font-black text-indigo-600 mt-2">412 tickets</p>
                    <span className="text-[10px] text-slate-400 font-medium mt-1 inline-block">Prevented visual clutter and backlog</span>
                  </div>

                </div>

                {/* Graphic Charts & Category Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* Category Breakdown (Custom visual SVG Bar Chart) */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                    <div>
                      <h3 className="text-md font-bold text-slate-950">Active Issues Distribution</h3>
                      <p className="text-xs text-slate-500">Frequency distribution of infrastructure complaints</p>
                    </div>

                    <div className="space-y-4">
                      
                      {/* Item 1 */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-700">Roads & Potholes (Urban)</span>
                          <span className="text-slate-500 font-mono">42% (524 reports)</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-teal-600 rounded-full" style={{ width: '42%' }}></div>
                        </div>
                      </div>

                      {/* Item 2 */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-700">Water Pipe Burst & Leakages</span>
                          <span className="text-slate-500 font-mono">24% (299 reports)</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-500 rounded-full" style={{ width: '24%' }}></div>
                        </div>
                      </div>

                      {/* Item 3 */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-700">Damaged Streetlight Grid</span>
                          <span className="text-slate-500 font-mono">18% (224 reports)</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full" style={{ width: '18%' }}></div>
                        </div>
                      </div>

                      {/* Item 4 */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-700">Agricultural Irrigation/Canals (Rural)</span>
                          <span className="text-slate-500 font-mono">11% (137 reports)</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-600 rounded-full" style={{ width: '11%' }}></div>
                        </div>
                      </div>

                      {/* Item 5 */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-700">Solid Waste Management</span>
                          <span className="text-slate-500 font-mono">5% (64 reports)</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: '5%' }}></div>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* High Performance Trend (Visual SVG representation of a line chart) */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                    <div>
                      <h3 className="text-md font-bold text-slate-950">Resolution Rate Improvement Over Time</h3>
                      <p className="text-xs text-slate-500">Comparing manual filing (red) with CivicFix AI auto-dispatch (green)</p>
                    </div>

                    <div className="aspect-video bg-slate-50 rounded-xl border relative flex items-center justify-center p-4">
                      
                      {/* Grid background */}
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:32px_24px] opacity-40"></div>

                      <svg className="w-full h-full" viewBox="0 0 400 200">
                        {/* Manual filing path */}
                        <path
                          d="M 20,160 L 100,150 L 180,140 L 260,145 L 340,135 L 380,130"
                          fill="none"
                          stroke="#f43f5e"
                          strokeWidth="3"
                          strokeDasharray="4 4"
                        />
                        {/* CivicFix platform path */}
                        <path
                          d="M 20,150 L 100,100 L 180,70 L 260,45 L 340,30 L 380,20"
                          fill="none"
                          stroke="#0d9488"
                          strokeWidth="4"
                        />
                        {/* Labels */}
                        <text x="30" y="180" fontSize="10" fill="#94a3b8" fontWeight="bold">Jan</text>
                        <text x="110" y="180" fontSize="10" fill="#94a3b8" fontWeight="bold">Mar</text>
                        <text x="190" y="180" fontSize="10" fill="#94a3b8" fontWeight="bold">May</text>
                        <text x="270" y="180" fontSize="10" fill="#94a3b8" fontWeight="bold">Jul</text>
                        <text x="350" y="180" fontSize="10" fill="#94a3b8" fontWeight="bold">Sep</text>
                      </svg>

                      {/* Legend */}
                      <div className="absolute bottom-4 right-4 flex items-center gap-3 bg-white px-2 py-1.5 rounded-lg border text-[10px] font-bold">
                        <span className="flex items-center gap-1">
                          <span className="w-3 h-0.5 bg-rose-500 inline-block"></span>
                          Manual
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-3 h-0.5 bg-teal-600 inline-block"></span>
                          CivicFix AI
                        </span>
                      </div>

                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* TAB CONTENT: CITIZEN LEADERBOARD */}
            {activeTab === 'leaderboard' && (
              <div className="max-w-3xl mx-auto space-y-6">
                
                <div className="text-center space-y-2">
                  <Award className="w-12 h-12 text-teal-600 mx-auto" />
                  <h2 className="text-xl font-bold text-slate-900">Citizen Warden Leaderboard</h2>
                  <p className="text-xs text-slate-500 max-w-lg mx-auto">
                    Citizens accumulate points by reporting fresh tickets (50 pts), upvoting/validating neighbors' claims (5 pts), and resolving issues via community cleanups.
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                  <div className="grid grid-cols-12 bg-slate-50 px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider border-b">
                    <div className="col-span-1">Rank</div>
                    <div className="col-span-5">Citizen Contributor</div>
                    <div className="col-span-2 text-center">Reports</div>
                    <div className="col-span-2 text-center">Votes</div>
                    <div className="col-span-2 text-right">Points Balance</div>
                  </div>

                  <div className="divide-y">
                    
                    {/* User profile injected at top or highlight in list */}
                    <div className="grid grid-cols-12 px-6 py-4 items-center bg-teal-50/30 text-slate-900">
                      <div className="col-span-1 font-black text-teal-700">3</div>
                      <div className="col-span-5 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                          AG
                        </div>
                        <div>
                          <p className="text-xs font-bold flex items-center gap-1.5">
                            {userName}
                            <span className="px-1.5 py-0.5 bg-teal-100 text-teal-800 text-[9px] font-black uppercase rounded">You</span>
                          </p>
                          <span className="text-[10px] text-teal-600 font-semibold uppercase">{userBadges[0]}</span>
                        </div>
                      </div>
                      <div className="col-span-2 text-center text-xs font-bold">4</div>
                      <div className="col-span-2 text-center text-xs font-bold">18</div>
                      <div className="col-span-2 text-right font-black text-teal-700 text-xs sm:text-sm">{userPoints} pts</div>
                    </div>

                    {/* Standard items */}
                    <div className="grid grid-cols-12 px-6 py-4 items-center text-slate-800 text-xs">
                      <div className="col-span-1 font-bold">1</div>
                      <div className="col-span-5 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs">
                          RP
                        </div>
                        <div>
                          <p className="font-bold">Ramesh Patel</p>
                          <span className="text-[10px] text-slate-500 font-semibold uppercase">Pioneer Warden</span>
                        </div>
                      </div>
                      <div className="col-span-2 text-center font-semibold">8</div>
                      <div className="col-span-2 text-center font-semibold">32</div>
                      <div className="col-span-2 text-right font-bold text-slate-900">420 pts</div>
                    </div>

                    <div className="grid grid-cols-12 px-6 py-4 items-center text-slate-800 text-xs">
                      <div className="col-span-1 font-bold">2</div>
                      <div className="col-span-5 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs">
                          SR
                        </div>
                        <div>
                          <p className="font-bold">Sneha Rao</p>
                          <span className="text-[10px] text-slate-500 font-semibold uppercase">Civic Guardian</span>
                        </div>
                      </div>
                      <div className="col-span-2 text-center font-semibold">5</div>
                      <div className="col-span-2 text-center font-semibold">24</div>
                      <div className="col-span-2 text-right font-bold text-slate-900">310 pts</div>
                    </div>

                    <div className="grid grid-cols-12 px-6 py-4 items-center text-slate-800 text-xs">
                      <div className="col-span-1 font-bold">4</div>
                      <div className="col-span-5 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs">
                          PS
                        </div>
                        <div>
                          <p className="font-bold">Priya Sharma</p>
                          <span className="text-[10px] text-slate-500 font-semibold uppercase">Active Citizen</span>
                        </div>
                      </div>
                      <div className="col-span-2 text-center font-semibold">3</div>
                      <div className="col-span-2 text-center font-semibold">15</div>
                      <div className="col-span-2 text-right font-bold text-slate-900">190 pts</div>
                    </div>

                    <div className="grid grid-cols-12 px-6 py-4 items-center text-slate-800 text-xs">
                      <div className="col-span-1 font-bold">5</div>
                      <div className="col-span-5 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs">
                          KS
                        </div>
                        <div>
                          <p className="font-bold">Karan Singh</p>
                          <span className="text-[10px] text-slate-500 font-semibold uppercase">Community Hero</span>
                        </div>
                      </div>
                      <div className="col-span-2 text-center font-semibold">2</div>
                      <div className="col-span-2 text-center font-semibold">10</div>
                      <div className="col-span-2 text-right font-bold text-slate-900">150 pts</div>
                    </div>

                  </div>
                </div>

              </div>
            )}

          </div>
        )}


        {/* -------------------- ADMIN PORTAL (URBAN OR RURAL) -------------------- */}
        {(currentRole === 'urban_admin' || currentRole === 'rural_admin') && (
          <div className="flex flex-col gap-6">
            
            {/* Admin Brand Strip */}
            <div className={`p-6 rounded-3xl text-white shadow-xl relative overflow-hidden ${
              currentRole === 'urban_admin' ? 'bg-slate-900' : 'bg-emerald-950'
            }`}>
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <span className="inline-block px-3 py-1 bg-white/10 text-white font-bold text-xs uppercase tracking-wider rounded-full mb-3">
                    {currentRole === 'urban_admin' ? 'MUNICIPAL CORPORATION HEADQUARTERS' : 'GRAM PANCHAYAT SECTOR HEADS'}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    {currentRole === 'urban_admin' ? 'Urban Area SmartCity Command Center' : 'Rural Development & Well Water Board'}
                  </h1>
                  <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                    AI Auto-Sorting active. Tickets automatically rank by weight: <strong className="text-white">Priority = (Upvotes * 0.7) + (Duplicates * 0.3)</strong>. Resolving issues automatically alerts all merged citizens.
                  </p>
                </div>

                <div className="bg-white/10 p-4 rounded-2xl border border-white/10 text-xs space-y-1 w-full md:w-auto">
                  <p className="font-bold text-white uppercase tracking-wider">Active Credentials</p>
                  <p className="text-teal-300 font-semibold">admin_officer_02@civicfix.gov</p>
                  <p className="text-slate-400">Authenticated Session</p>
                </div>
              </div>
            </div>

            {/* Admin Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Outstanding Tickets</p>
                <p className="text-2xl font-black text-slate-950 mt-1">
                  {adminFilteredIssues.filter(i => i.status !== 'Resolved').length}
                </p>
                <span className="text-[10px] text-slate-400">Requires technical assessment</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Matched Duplicates Suppressed</p>
                <p className="text-2xl font-black text-indigo-700 mt-1">
                  {adminFilteredIssues.reduce((sum, i) => sum + (i.duplicateReports?.length || 0), 0)}
                </p>
                <span className="text-[10px] text-slate-400">Deduplicated from active grid</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Urgent Prioritization Weight</p>
                <p className="text-2xl font-black text-rose-600 mt-1">
                  {adminFilteredIssues.length > 0 ? Math.max(...adminFilteredIssues.map(i => i.priorityScore)) : 0}
                </p>
                <span className="text-[10px] text-slate-400">Highest priority score in dispatch queue</span>
              </div>

            </div>

            {/* Split layout: Issue Boards and Detail/Action Controller */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Side: Filterable list of scope-specific issues */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                
                {/* Admin Filters Toolbar */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Filters for Sector Database
                    </h3>
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-semibold font-mono">
                      Query matched {adminFilteredIssues.length} entries
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    
                    {/* Search */}
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Search className="w-4 h-4 text-slate-400" />
                      </span>
                      <input
                        type="text"
                        placeholder="ID or keyword..."
                        value={adminSearchQuery}
                        onChange={(e) => setAdminSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-slate-50/50"
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <select
                        value={adminSelectedCategory}
                        onChange={(e) => setAdminSelectedCategory(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-slate-50/50"
                      >
                        <option value="All">All Categories</option>
                        {currentRole === 'urban_admin' ? (
                          <>
                            <option value="Pothole">Potholes</option>
                            <option value="Water Leakage">Water Leakage</option>
                            <option value="Damaged Streetlight">Streetlights</option>
                            <option value="Electricity Problem">Electricity Problems</option>
                            <option value="Waste Management">Waste Management</option>
                          </>
                        ) : (
                          <>
                            <option value="Agricultural Drainage">Irrigation/Drainage</option>
                            <option value="Community Tube Well">Tube Wells</option>
                            <option value="Village Path/Road">Village Paths</option>
                            <option value="Rural Water Supply">Rural Water Supply</option>
                          </>
                        )}
                      </select>
                    </div>

                    {/* Status filter */}
                    <div>
                      <select
                        value={adminStatusFilter}
                        onChange={(e) => setAdminStatusFilter(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-slate-50/50"
                      >
                        <option value="All">All Statuses</option>
                        <option value="Reported">Reported</option>
                        <option value="Verified">Verified</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </div>

                  </div>
                </div>

                {/* Grid list showing sorted lists */}
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                  {adminFilteredIssues.map((issue) => {
                    const isSelected = selectedIssueId === issue.id;
                    const duplicatesCount = issue.duplicateReports?.length || 0;

                    return (
                      <div
                        key={issue.id}
                        onClick={() => setSelectedIssueId(issue.id)}
                        className={`p-4 rounded-xl border transition-all text-left cursor-pointer flex gap-4 ${
                          isSelected 
                            ? 'bg-white border-teal-500 shadow-md ring-1 ring-teal-500/20' 
                            : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                        }`}
                      >
                        {/* Priority circle */}
                        <div className="flex flex-col items-center justify-center bg-slate-50 border border-slate-100 rounded-lg p-2 min-w-[54px] h-fit self-start">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Priority</span>
                          <span className="text-sm font-black text-rose-700">{issue.priorityScore}</span>
                        </div>

                        {/* Detail Block */}
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                              {issue.id}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              issue.status === 'Resolved' 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : issue.status === 'In Progress'
                                  ? 'bg-cyan-100 text-cyan-800'
                                  : issue.status === 'Verified'
                                    ? 'bg-indigo-100 text-indigo-800'
                                    : 'bg-amber-100 text-amber-800'
                            }`}>
                              {issue.status}
                            </span>
                          </div>

                          <h4 className="text-sm font-bold text-slate-900 leading-snug">{issue.title}</h4>
                          <p className="text-xs text-slate-500 leading-relaxed truncate">{issue.description}</p>

                          <div className="flex items-center justify-between pt-2 border-t text-[11px] font-semibold text-slate-400">
                            <span>{issue.category}</span>
                            <div className="flex items-center gap-2">
                              {duplicatesCount > 0 && (
                                <span className="bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded font-bold text-[9px]">
                                  {duplicatesCount} DUPLICATE MATCHES
                                </span>
                              )}
                              <span>Upvotes: {issue.upvotes}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {adminFilteredIssues.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed text-slate-500">
                      <Compass className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm font-bold">No active issues found for this sector queue.</p>
                      <p className="text-xs text-slate-400 mt-1">Change category or search keywords.</p>
                    </div>
                  )}
                </div>

              </div>

              {/* Right Side: Admin Action Panel */}
              <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-6 h-fit sticky top-24">
                
                {selectedIssue ? (
                  <>
                    <div className="border-b pb-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assessment Console</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          selectedIssue.status === 'Resolved' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : selectedIssue.status === 'In Progress'
                              ? 'bg-cyan-100 text-cyan-800'
                              : 'bg-amber-100 text-amber-800'
                        }`}>
                          {selectedIssue.status}
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">{selectedIssue.title}</h3>
                    </div>

                    {/* Map Pin reference */}
                    <div className="space-y-1 text-xs">
                      <p className="font-bold text-slate-400 uppercase tracking-wider">Verified Coordinates</p>
                      <div className="p-3 bg-slate-50 border rounded-lg font-mono text-[11px] flex justify-between items-center text-slate-600">
                        <span>Lat: {selectedIssue.latitude}</span>
                        <span>Lng: {selectedIssue.longitude}</span>
                        <span className="px-1.5 py-0.5 bg-slate-200 rounded font-semibold text-[10px] text-slate-700">GPS OK</span>
                      </div>
                    </div>

                    {/* Narrative details */}
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Visual & Context Assessment</p>
                      <div className="p-3 bg-slate-50 border rounded-lg text-xs text-slate-600 space-y-2">
                        <p className="italic">"{selectedIssue.description || "No supplemental narrative added."}"</p>
                        <p className="text-[10px] text-slate-400">
                          Filed by citizen: <strong>{selectedIssue.reportedBy}</strong> on {new Date(selectedIssue.reportedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Image preview */}
                    {selectedIssue.imageUrl && (
                      <div className="aspect-video rounded-lg overflow-hidden border">
                        <img src={selectedIssue.imageUrl} alt="Analysis context" className="w-full h-full object-cover" />
                      </div>
                    )}

                    {/* Status workflow toggles */}
                    <div className="space-y-4 pt-4 border-t">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Filing Operations Remarks</p>
                      
                      <textarea
                        rows={2}
                        placeholder="Add engineer assessment notes or comments here (e.g. Contractor assigned)..."
                        value={adminRemarks}
                        onChange={(e) => setAdminRemarks(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                      />

                      <div className="space-y-2">
                        <p className="text-[11px] font-bold text-slate-500 uppercase">Dispatch Next State</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          
                          <button
                            onClick={() => handleUpdateStatus(selectedIssue.id, 'Verified')}
                            disabled={adminActionLoading === selectedIssue.id}
                            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all text-center ${
                              selectedIssue.status === 'Verified'
                                ? 'bg-indigo-600 text-white shadow-xs'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border'
                            }`}
                          >
                            Verify Ticket
                          </button>

                          <button
                            onClick={() => handleUpdateStatus(selectedIssue.id, 'In Progress')}
                            disabled={adminActionLoading === selectedIssue.id}
                            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all text-center ${
                              selectedIssue.status === 'In Progress'
                                ? 'bg-cyan-600 text-white shadow-xs'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border'
                            }`}
                          >
                            Dispatch Team
                          </button>

                          <button
                            onClick={() => handleUpdateStatus(selectedIssue.id, 'Resolved')}
                            disabled={adminActionLoading === selectedIssue.id}
                            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all text-center ${
                              selectedIssue.status === 'Resolved'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border'
                            }`}
                          >
                            Close Resolved
                          </button>

                        </div>
                      </div>

                      {/* Info callout on resolved action */}
                      <p className="text-[10px] text-slate-400 italic">
                        💡 Setting status to 'Resolved' immediately triggers an SMS and email notification broadcast to the main reporter and all {selectedIssue.duplicateReports?.length || 0} duplicate report owners.
                      </p>
                    </div>

                  </>
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    <Compass className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-bold">Select any incoming infrastructure claim from the left panel list to launch action panel.</p>
                  </div>
                )}

              </div>

            </div>

          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800 mt-12 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white tracking-wider">CivicFix Platform</span>
            <span className="text-slate-500">|</span>
            <span>Real-time GIS Infrastructure Tracking Engine v2.4</span>
          </div>
          <div className="flex gap-4">
            <span className="hover:text-white transition-colors">Privacy Charter</span>
            <span>•</span>
            <span className="hover:text-white transition-colors">Municipal API Sandbox</span>
            <span>•</span>
            <span className="hover:text-white transition-colors">Panchayat Portal</span>
          </div>
          <p className="text-slate-500 text-center md:text-right">
            Synced with Bangalore Municipal Corp & Kolar District Panchayat.
          </p>
        </div>
      </footer>

    </div>
  );
}
