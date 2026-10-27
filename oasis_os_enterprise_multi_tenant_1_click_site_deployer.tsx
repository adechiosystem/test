import React, { useState, useMemo, useEffect } from 'react';
import {
  Globe,
  Sparkles,
  Calendar as CalendarIcon,
  Star,
  Users,
  BarChart3,
  Settings,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Laptop,
  Smartphone,
  Zap,
  ArrowRight,
  Check,
  Copy,
  Search,
  SlidersHorizontal,
  ChevronRight,
  UploadCloud,
  Palette,
  Type,
  Lock,
  Layers,
  Activity,
  Send,
  MessageSquare,
  Clock,
  AlertCircle,
  X,
  Compass,
  Flame,
  TrendingUp,
  Server,
  DollarSign,
  Bot,
  Code2,
  Phone,
  CornerDownLeft,
  ChevronDown,
  Paperclip,
  Smile,
  Megaphone,
  Radio,
  Building2,
  Filter,
  CheckSquare,
  Square,
  Share2,
  MessageCircle,
  ThumbsUp,
  AlertTriangle,
  Link as LinkIcon,
  CalendarCheck,
  LogOut,
  RefreshCw,
  UserCheck,
  UserPlus,
  Shield,
  Briefcase,
  PauseCircle,
  PlayCircle,
  Plus,
  Trash2,
  Edit3,
  Eye,
  CheckCheck,
  Mail,
  Download,
  Database
} from 'lucide-react';

// --- PRODUCTION PERSISTENCE KEYS ---
const STORAGE_KEYS = {
  SUB_ACCOUNTS: 'oasis_production_sub_accounts_v1',
  CRM_RECORDS: 'oasis_production_crm_records_v1',
  APPOINTMENTS: 'oasis_production_appointments_v1',
  ACTIVE_ACCOUNT_ID: 'oasis_production_active_acc_id_v1',
  MASTER_DOMAIN: 'oasis_production_master_domain_v1'
};

// Safe helper to read from persistent storage
const loadStorage = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    console.warn(`Storage load error for [${key}]:`, err);
    return fallback;
  }
};

// Safe helper to write to persistent storage
const saveStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn(`Storage write error for [${key}]:`, err);
  }
};

export default function App() {
  // Master agency domain (customizable)
  const [masterDomain, setMasterDomain] = useState(() => 
    loadStorage(STORAGE_KEYS.MASTER_DOMAIN, 'adechiosystem.online')
  );

  // Core Production State (Starts Empty by default on clean server deployment)
  const [subAccounts, setSubAccounts] = useState(() => 
    loadStorage(STORAGE_KEYS.SUB_ACCOUNTS, [])
  );
  
  const [activeSubAccountId, setActiveSubAccountId] = useState(() => 
    loadStorage(STORAGE_KEYS.ACTIVE_ACCOUNT_ID, '')
  );

  const [crmRecords, setCrmRecords] = useState(() => 
    loadStorage(STORAGE_KEYS.CRM_RECORDS, [])
  );

  const [appointments, setAppointments] = useState(() => 
    loadStorage(STORAGE_KEYS.APPOINTMENTS, [])
  );

  // Sync to localStorage whenever state changes
  useEffect(() => {
    saveStorage(STORAGE_KEYS.SUB_ACCOUNTS, subAccounts);
  }, [subAccounts]);

  useEffect(() => {
    saveStorage(STORAGE_KEYS.CRM_RECORDS, crmRecords);
  }, [crmRecords]);

  useEffect(() => {
    saveStorage(STORAGE_KEYS.APPOINTMENTS, appointments);
  }, [appointments]);

  useEffect(() => {
    saveStorage(STORAGE_KEYS.ACTIVE_ACCOUNT_ID, activeSubAccountId);
  }, [activeSubAccountId]);

  useEffect(() => {
    saveStorage(STORAGE_KEYS.MASTER_DOMAIN, masterDomain);
  }, [masterDomain]);

  // Current view mode: 'super_admin' or 'sub_account'
  const [currentMode, setCurrentMode] = useState('super_admin');

  // Sub-Account active tab
  const [subTab, setSubTab] = useState('crm'); // 'reviews' | 'appointments' | 'crm' | 'customizer'
  const [customizerSubSection, setCustomizerSubSection] = useState('review_engine'); // 'review_engine' | 'booking_engine'

  // Super-Admin search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'trial' | 'paused'

  // Modal: Create New Sub-Account / Tenant
  const [isCreateAccountModalOpen, setIsCreateAccountModalOpen] = useState(false);
  const [newAccountForm, setNewAccountForm] = useState({
    name: '',
    slug: '',
    niche: 'Medical & Healthcare',
    plan: 'Growth Pro',
    whatsAppNumber: '',
    mrrValue: 499,
    status: 'trial', // default to trial for new signups
    trialDays: 7,
    googlePlaceUrl: ''
  });

  // CRM Multi-Select, Bulk Campaign & Lead Creation States
  const [selectedLeadIds, setSelectedLeadIds] = useState([]);
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [isBulkCampaignModalOpen, setIsBulkCampaignModalOpen] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState({
    name: '',
    phone: '',
    email: '',
    service: '',
    tag: 'New Lead',
    notes: ''
  });
  const [bulkCampaignMessage, setBulkCampaignMessage] = useState(
    'Hello {name}, greetings from {business_name}! 🌟\nWe invite you to book your session directly via:\n{booking_link}\nOr share your valued feedback via:\n{review_link}'
  );

  // Active Sub-Account Object (or null if no accounts exist)
  const currentSubAccount = useMemo(() => {
    if (subAccounts.length === 0) return null;
    return subAccounts.find((s) => s.id === activeSubAccountId) || subAccounts[0];
  }, [subAccounts, activeSubAccountId]);

  // Working drafts for Customizer
  const [reviewDraft, setReviewDraft] = useState(() => 
    currentSubAccount ? { ...currentSubAccount.reviewCustomizer } : null
  );
  const [bookingDraft, setBookingDraft] = useState(() => 
    currentSubAccount ? { ...currentSubAccount.bookingCustomizer } : null
  );

  // Sync draft whenever currentSubAccount changes
  useEffect(() => {
    if (currentSubAccount) {
      setReviewDraft({ ...currentSubAccount.reviewCustomizer });
      setBookingDraft({ ...currentSubAccount.bookingCustomizer });
      if (currentSubAccount.bookingCustomizer?.services?.length > 0) {
        setPreviewSelectedService(currentSubAccount.bookingCustomizer.services[0].id);
      }
    } else {
      setReviewDraft(null);
      setBookingDraft(null);
    }
  }, [activeSubAccountId, subAccounts]);

  // Live preview interactive simulation states
  const [previewRating, setPreviewRating] = useState(5);
  const [previewReviewNotes, setPreviewReviewNotes] = useState('');
  const [previewSelectedService, setPreviewSelectedService] = useState('');
  const [previewSelectedSlot, setPreviewSelectedSlot] = useState('11:00 AM');
  const [previewClientName, setPreviewClientName] = useState('');
  const [previewClientPhone, setPreviewClientPhone] = useState('');

  // Modals
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [broadcastTarget, setBroadcastTarget] = useState('all');
  const [broadcastMessage, setBroadcastMessage] = useState('Important announcement: System services and Google Maps integrations are running smoothly.');

  // Toast Notification System
  const [toast, setToast] = useState(null);
  const showToast = (title, message, type = 'success') => {
    setToast({ title, message, type });
    setTimeout(() => setToast(null), 4500);
  };

  // Safe Clipboard Copy Helper
  const safeCopyToClipboard = async (text, successTitle, successMsg) => {
    let copied = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        copied = true;
      }
    } catch {
      copied = false;
    }

    if (!copied) {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        copied = document.execCommand('copy');
        document.body.removeChild(textArea);
      } catch {
        copied = false;
      }
    }
    showToast(successTitle, successMsg, 'info');
  };

  // Switch Sub-Account
  const switchSubAccount = (subId) => {
    setActiveSubAccountId(subId);
    setSelectedLeadIds([]);
    const target = subAccounts.find((s) => s.id === subId);
    if (target) {
      setReviewDraft({ ...target.reviewCustomizer });
      setBookingDraft({ ...target.bookingCustomizer });
      if (target.bookingCustomizer?.services?.length > 0) {
        setPreviewSelectedService(target.bookingCustomizer.services[0].id);
      }
    }
  };

  // --- LIFECYCLE MANAGEMENT CONTROLS (Active, Free Trial, Pause) ---
  const handleSetActive = (id) => {
    setSubAccounts((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          return {
            ...s,
            status: 'active',
            statusLabel: 'Active - Paid Pro',
            isPaid: true,
            trialDaysLeft: 0
          };
        }
        return s;
      })
    );
    showToast('Subscription Active 🟢', `Sub-account [${id}] is now marked as Paid Pro.`, 'success');
  };

  const handleSetTrial = (id) => {
    setSubAccounts((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          return {
            ...s,
            status: 'trial',
            statusLabel: 'Free Trial - 7 Days Left',
            isPaid: false,
            trialDaysLeft: 7
          };
        }
        return s;
      })
    );
    showToast('Free Trial Enabled 🟡', `Sub-account [${id}] placed on a 7-day trial period.`, 'info');
  };

  const handleSetPause = (id) => {
    setSubAccounts((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          return {
            ...s,
            status: 'paused',
            statusLabel: 'Paused / Suspended',
            isPaid: false,
            trialDaysLeft: 0
          };
        }
        return s;
      })
    );
    showToast('Tenant Suspended ⛔', `Sub-account [${id}] is paused. Lock screen is active.`, 'error');
  };

  // Delete Sub-Account Completely
  const handleDeleteSubAccount = (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete tenant [${id}] ${name}? This will remove all associated CRM records and bookings.`)) {
      return;
    }
    const remaining = subAccounts.filter((s) => s.id !== id);
    setSubAccounts(remaining);
    setCrmRecords((prev) => prev.filter((r) => r.subAccountId !== id));
    setAppointments((prev) => prev.filter((a) => a.subAccountId !== id));
    if (activeSubAccountId === id) {
      setActiveSubAccountId(remaining[0]?.id || '');
    }
    showToast('Tenant Deleted 🗑️', `Account [${id}] has been removed.`, 'info');
  };

  // Real-time Financial Calculations (0 if empty)
  const statsSummary = useMemo(() => {
    const totalMrr = subAccounts.reduce(
      (acc, curr) => acc + (curr.status === 'active' ? (curr.mrrValue || 0) : 0),
      0
    );
    const activeCount = subAccounts.filter((s) => s.status === 'active').length;
    const trialCount = subAccounts.filter((s) => s.status === 'trial').length;
    const pausedCount = subAccounts.filter((s) => s.status === 'paused').length;
    return { totalMrr, activeCount, trialCount, pausedCount };
  }, [subAccounts]);

  // Filtered Sub-Accounts list for Super-Admin
  const filteredSubAccounts = useMemo(() => {
    return subAccounts.filter((acc) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        acc.id.toLowerCase().includes(q) ||
        acc.name.toLowerCase().includes(q) ||
        acc.slug.toLowerCase().includes(q) ||
        (acc.subdomain && acc.subdomain.toLowerCase().includes(q));

      const matchesStatus = statusFilter === 'all' || acc.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [subAccounts, searchQuery, statusFilter]);

  // Dynamic URLs for active sub-account
  const smartReviewUrl = currentSubAccount
    ? `https://${masterDomain}/r/${currentSubAccount.slug}`
    : `https://${masterDomain}/r/setup`;
  const smartBookingUrl = currentSubAccount
    ? `https://${masterDomain}/book/${currentSubAccount.slug}`
    : `https://${masterDomain}/book/setup`;

  // Sub-account specific CRM records and appointments
  const currentSubCrm = useMemo(() => {
    if (!currentSubAccount) return [];
    return crmRecords.filter((r) => r.subAccountId === currentSubAccount.id);
  }, [crmRecords, currentSubAccount]);

  const currentSubAppointments = useMemo(() => {
    if (!currentSubAccount) return [];
    return appointments.filter((a) => a.subAccountId === currentSubAccount.id);
  }, [appointments, currentSubAccount]);

  // Derived real-time review stats for active sub-account
  const currentSubReviewsStats = useMemo(() => {
    if (!currentSubAccount) return { googleCount: 0, shieldedCount: 0, rating: 5.0, totalVerified: 0 };
    const googleReviews = currentSubCrm.filter((r) => r.type === 'Review').length;
    const shieldedReviews = currentSubCrm.filter((r) => r.type === 'Review_Shielded').length;
    return {
      googleCount: googleReviews,
      shieldedCount: shieldedReviews,
      rating: googleReviews > 0 ? 5.0 : 5.0,
      totalVerified: googleReviews + shieldedReviews
    };
  }, [currentSubCrm, currentSubAccount]);

  // Create New Sub-Account
  const handleCreateSubAccount = (e) => {
    e.preventDefault();
    if (!newAccountForm.name.trim()) {
      showToast('Validation Error', 'Business name is required.', 'error');
      return;
    }

    const cleanSlug = (newAccountForm.slug || newAccountForm.name)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || `acc-${Date.now().toString().slice(-4)}`;

    const nextId = `ACC-${(1001 + subAccounts.length)}`;
    const cleanPhone = newAccountForm.whatsAppNumber.replace(/[^0-9]/g, '');

    const newSubAccount = {
      id: nextId,
      slug: cleanSlug,
      name: newAccountForm.name.trim(),
      niche: newAccountForm.niche,
      subdomain: `${cleanSlug}.${masterDomain}`,
      customDomain: '',
      plan: newAccountForm.plan,
      status: newAccountForm.status,
      statusLabel: newAccountForm.status === 'active' ? 'Active - Paid Pro' : `Free Trial - ${newAccountForm.trialDays || 7} Days Left`,
      isPaid: newAccountForm.status === 'active',
      mrrValue: Number(newAccountForm.mrrValue) || 499,
      mrr: `$${Number(newAccountForm.mrrValue) || 499}/mo`,
      trialDaysLeft: newAccountForm.status === 'trial' ? (newAccountForm.trialDays || 7) : 0,
      whatsAppNumber: newAccountForm.whatsAppNumber.trim() || '+1000000000',
      cleanWhatsAppNumber: cleanPhone || '1000000000',
      currency: 'USD',
      googleRating: 5.0,
      totalReviews: 0,
      reviewCustomizer: {
        displayName: newAccountForm.name.trim(),
        tagline: `Official Services & Client Satisfaction Portal`,
        googlePlaceUrl: newAccountForm.googlePlaceUrl.trim() || 'https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID',
        threshold: 4,
        heading: `How was your experience at ${newAccountForm.name.trim()}?`,
        subtitle: 'Your feedback empowers our team to deliver excellence on every visit.',
        thankYouGoogleHeading: 'Thank you for your 5-star rating! 🌟',
        thankYouGoogleText: 'We are thrilled! Please take a moment to post your review directly to Google Maps to help others discover us.',
        apologyHeading: 'We apologize for any inconvenience 💬',
        apologyText: 'Your satisfaction is our priority. Please share your notes and management will reach out directly to resolve this.',
        primaryColor: '#6366F1'
      },
      bookingCustomizer: {
        portalTitle: `${newAccountForm.name.trim()} - Booking Portal`,
        portalSubtitle: 'Choose your desired service and preferred slot. Instant confirmation dispatched via WhatsApp.',
        heroNotice: 'Please arrive 10 minutes prior to your scheduled session.',
        openTime: '09:00',
        closeTime: '19:00',
        slotInterval: 30,
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        confirmationNote: 'Your appointment is booked! Confirmation details dispatched to your WhatsApp.',
        services: [
          { id: `srv-${Date.now()}-1`, name: 'Initial Consultation', duration: 30, price: 50, category: 'General' },
          { id: `srv-${Date.now()}-2`, name: 'Standard Full Session', duration: 45, price: 100, category: 'Main' }
        ]
      }
    };

    const updatedAccounts = [newSubAccount, ...subAccounts];
    setSubAccounts(updatedAccounts);
    setActiveSubAccountId(newSubAccount.id);
    setIsCreateAccountModalOpen(false);

    // Reset Form
    setNewAccountForm({
      name: '',
      slug: '',
      niche: 'Medical & Healthcare',
      plan: 'Growth Pro',
      whatsAppNumber: '',
      mrrValue: 499,
      status: 'trial',
      trialDays: 7,
      googlePlaceUrl: ''
    });

    showToast(
      'Tenant Created Successfully! 🚀',
      `Account [${newSubAccount.id}] ${newSubAccount.name} is now live on ${masterDomain}.`,
      'success'
    );
  };

  // Save changes from Customizer into active sub-account state
  const handleSaveCustomizer = () => {
    if (!currentSubAccount) return;
    setSubAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === currentSubAccount.id) {
          return {
            ...acc,
            reviewCustomizer: { ...reviewDraft },
            bookingCustomizer: { ...bookingDraft }
          };
        }
        return acc;
      })
    );
    showToast(
      'Customizer Saved & Published! 🚀',
      `Live settings updated for ${currentSubAccount.name} on ${masterDomain}.`,
      'success'
    );
  };

  // Add Lead Manually to CRM
  const handleAddNewLead = (e) => {
    e.preventDefault();
    if (!currentSubAccount) return;
    if (!newLeadForm.name.trim() || !newLeadForm.phone.trim()) {
      showToast('Validation Error', 'Please enter at least client name and phone number.', 'error');
      return;
    }

    const cleanNumber = newLeadForm.phone.replace(/[^0-9]/g, '');
    const newEntry = {
      id: `crm-${Date.now()}`,
      subAccountId: currentSubAccount.id,
      clientName: newLeadForm.name.trim(),
      phone: newLeadForm.phone.trim(),
      cleanPhone: cleanNumber || currentSubAccount.cleanWhatsAppNumber,
      email: newLeadForm.email.trim() || 'lead@client.com',
      type: 'Lead_Manual',
      activity: newLeadForm.service
        ? `Interested in: ${newLeadForm.service} (${newLeadForm.notes || 'Manually logged'})`
        : (newLeadForm.notes || 'New inquiry logged directly into CRM'),
      date: 'Just Now',
      badge: newLeadForm.tag || 'New Lead',
      badgeColor: newLeadForm.tag === 'VIP' ? 'amber' : newLeadForm.tag === 'Interested' ? 'emerald' : 'indigo',
      stars: null
    };

    setCrmRecords([newEntry, ...crmRecords]);
    setIsAddLeadModalOpen(false);
    setNewLeadForm({ name: '', phone: '', email: '', service: '', tag: 'New Lead', notes: '' });
    showToast('Lead Captured 👤✨', `${newEntry.clientName} added to CRM.`, 'success');
  };

  const handleDeleteLead = (leadId, leadName) => {
    setCrmRecords((prev) => prev.filter((r) => r.id !== leadId));
    setSelectedLeadIds((prev) => prev.filter((id) => id !== leadId));
    showToast('Lead Deleted 🗑️', `${leadName} removed from CRM records.`, 'info');
  };

  const handleToggleSelectLead = (id) => {
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllLeads = () => {
    if (selectedLeadIds.length === currentSubCrm.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(currentSubCrm.map((r) => r.id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedLeadIds.length === 0) return;
    const count = selectedLeadIds.length;
    setCrmRecords((prev) => prev.filter((r) => !selectedLeadIds.includes(r.id)));
    setSelectedLeadIds([]);
    showToast('Bulk Deletion Complete 🗑️', `${count} leads removed from CRM.`, 'info');
  };

  const handleExecuteBulkCampaign = () => {
    const selectedRecords = currentSubCrm.filter((r) => selectedLeadIds.includes(r.id));
    if (selectedRecords.length === 0) return;

    const firstClient = selectedRecords[0];
    const customizedFirstMsg = bulkCampaignMessage
      .replace(/{name}/g, firstClient.clientName)
      .replace(/{business_name}/g, currentSubAccount.name)
      .replace(/{booking_link}/g, smartBookingUrl)
      .replace(/{review_link}/g, smartReviewUrl);

    window.open(`https://wa.me/${firstClient.cleanPhone}?text=${encodeURIComponent(customizedFirstMsg)}`, '_blank');

    showToast(
      'Campaign Dispatched 🚀📱',
      `Campaign launched for ${selectedRecords.length} selected contacts. WhatsApp dialog opened.`,
      'success'
    );
    setIsBulkCampaignModalOpen(false);
  };

  // Add Service in Booking Draft
  const handleAddService = () => {
    if (!bookingDraft) return;
    const newId = `srv-${Date.now()}`;
    const newService = {
      id: newId,
      name: 'New Custom Service',
      duration: 30,
      price: 75,
      category: 'General'
    };
    setBookingDraft((prev) => ({
      ...prev,
      services: [...prev.services, newService]
    }));
    showToast('Service Added', 'Configure name, price, and duration, then save changes.', 'info');
  };

  // Delete Service in Booking Draft
  const handleDeleteService = (serviceId) => {
    if (!bookingDraft || bookingDraft.services.length <= 1) {
      showToast('Alert', 'At least one service must remain available for booking.', 'error');
      return;
    }
    setBookingDraft((prev) => ({
      ...prev,
      services: prev.services.filter((s) => s.id !== serviceId)
    }));
    showToast('Service Removed', 'The service has been removed from catalog.', 'info');
  };

  // Simulate Live Booking
  const handleSimulateBooking = (e) => {
    e.preventDefault();
    if (!currentSubAccount) return;
    const clientName = previewClientName.trim() || 'Direct Client';
    const clientPhone = previewClientPhone.trim() || currentSubAccount.whatsAppNumber;
    const selectedSrvObj = bookingDraft?.services?.find((s) => s.id === previewSelectedService) || bookingDraft?.services?.[0] || { name: 'Consultation' };

    const newCrmEntry = {
      id: `crm-${Date.now()}`,
      subAccountId: currentSubAccount.id,
      clientName: clientName,
      phone: clientPhone,
      cleanPhone: clientPhone.replace(/[^0-9]/g, ''),
      type: 'Booking',
      activity: `Booked: ${selectedSrvObj.name} via portal (${previewSelectedSlot})`,
      date: 'Just Now',
      badge: 'Confirmed Booking',
      badgeColor: 'emerald',
      stars: null
    };
    setCrmRecords([newCrmEntry, ...crmRecords]);

    const newAppointment = {
      id: `apt-${Date.now()}`,
      subAccountId: currentSubAccount.id,
      name: clientName,
      phone: clientPhone,
      service: selectedSrvObj.name,
      date: 'Today',
      time: previewSelectedSlot,
      status: 'Confirmed',
      channel: 'Smart Booking Portal'
    };
    setAppointments([newAppointment, ...appointments]);

    setPreviewClientName('');
    setPreviewClientPhone('');

    showToast(
      'Booking Logged to CRM 🎉',
      `Session booked for ${clientName} (${selectedSrvObj.name}) and saved.`,
      'success'
    );
  };

  // Simulate Live Review
  const handleSimulateReview = () => {
    if (!currentSubAccount || !reviewDraft) return;
    const isGoogleBound = previewRating >= reviewDraft.threshold;
    const clientName = 'Rating Respondent';

    const newCrmEntry = {
      id: `crm-${Date.now()}`,
      subAccountId: currentSubAccount.id,
      clientName: clientName,
      phone: currentSubAccount.whatsAppNumber,
      cleanPhone: currentSubAccount.cleanWhatsAppNumber,
      type: isGoogleBound ? 'Review' : 'Review_Shielded',
      activity: isGoogleBound
        ? `Rated ${previewRating}★ and forwarded to Google Maps review`
        : `Rated ${previewRating}★ (Private feedback intercepted to protect public rating)`,
      date: 'Just Now',
      badge: isGoogleBound ? '5★ Google Review' : 'Private Complaint Caught',
      badgeColor: isGoogleBound ? 'amber' : 'rose',
      stars: previewRating
    };
    setCrmRecords([newCrmEntry, ...crmRecords]);

    if (isGoogleBound) {
      showToast(
        '5-Star Rating! Forwarding to Google 🌟',
        `Rated ${previewRating}★. Directing visitor to Google Maps page.`,
        'success'
      );
      window.open(reviewDraft.googlePlaceUrl, '_blank', 'noopener,noreferrer');
    } else {
      showToast(
        'Reputation Shield Active 🛡️',
        'Feedback captured internally. Shielded from Google Maps and recorded in CRM.',
        'info'
      );
    }
  };

  // Reset to Complete Zero-State (Clear Storage)
  const handleSystemPurge = () => {
    if (!window.confirm('Warning: This will wipe all saved sub-accounts, CRM records, and appointments from local storage. Are you sure?')) {
      return;
    }
    localStorage.removeItem(STORAGE_KEYS.SUB_ACCOUNTS);
    localStorage.removeItem(STORAGE_KEYS.CRM_RECORDS);
    localStorage.removeItem(STORAGE_KEYS.APPOINTMENTS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_ACCOUNT_ID);
    setSubAccounts([]);
    setCrmRecords([]);
    setAppointments([]);
    setActiveSubAccountId('');
    showToast('Clean Slate Initiated 🧹', 'All data purged. Platform reset to zero state.', 'info');
  };

  return (
    <div className="min-h-screen bg-[#05070D] text-slate-100 font-sans selection:bg-indigo-600 selection:text-white flex flex-col antialiased">
      
      {/* --- FLOATING TOAST SYSTEM --- */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-[#0C101E]/95 border border-indigo-500/40 text-slate-200 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-4">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
            {toast.type === 'error' ? <AlertTriangle className="w-4 h-4 text-rose-400" /> : <Sparkles className="w-4 h-4" />}
          </div>
          <div>
            <div className="text-xs font-bold text-white uppercase tracking-wider">{toast.title}</div>
            <div className="text-xs text-slate-400 mt-0.5">{toast.message}</div>
          </div>
          <button onClick={() => setToast(null)} className="ml-2 text-slate-500 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* --- MASTER TOP NAVIGATION BAR --- */}
      <header className="h-16 border-b border-slate-800/80 bg-[#07090E]/95 backdrop-blur-xl sticky top-0 z-40 px-4 lg:px-7 flex items-center justify-between">
        
        {/* Branding & Mode Switcher */}
        <div className="flex items-center gap-4">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setCurrentMode('super_admin')}
          >
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-600/30 ring-1 ring-white/20">
              <Compass className="w-5 h-5 text-white" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#07090E]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm tracking-tight text-white uppercase font-mono">OASIS OS</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  {masterDomain}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Enterprise Multi-Tenant SaaS Engine</p>
            </div>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="hidden md:flex items-center bg-[#0C101E] border border-slate-800 p-1 rounded-xl ml-3">
            <button
              onClick={() => setCurrentMode('super_admin')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currentMode === 'super_admin'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Super-Admin</span>
            </button>

            <button
              onClick={() => {
                if (subAccounts.length === 0) {
                  showToast('No Tenants Created', 'Create your first sub-account in Super-Admin to launch workspace.', 'error');
                  return;
                }
                setCurrentMode('sub_account');
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currentMode === 'sub_account'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Tenant Workspace</span>
            </button>
          </div>
        </div>

        {/* Dynamic Context Selector & Controls */}
        <div className="flex items-center gap-3">
          
          {/* Sub-Account Selector Dropdown */}
          {subAccounts.length > 0 ? (
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5">
              <span className="text-[11px] text-slate-500 font-semibold hidden sm:inline">Active Tenant:</span>
              <select
                value={activeSubAccountId}
                onChange={(e) => {
                  switchSubAccount(e.target.value);
                  showToast('Active Account Switched', `Managing [${e.target.value}]`, 'info');
                }}
                className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
              >
                {subAccounts.map((sub) => (
                  <option key={sub.id} value={sub.id} className="bg-[#090D18] text-white">
                    [{sub.id}] {sub.name} ({sub.status.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <button
              onClick={() => setIsCreateAccountModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all animate-pulse"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Create First Tenant</span>
            </button>
          )}

          {/* Super-Admin Broadcast & Clean Reset */}
          {currentMode === 'super_admin' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsBroadcastModalOpen(true)}
                disabled={subAccounts.length === 0}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:pointer-events-none text-white font-bold text-xs shadow-md transition-all"
              >
                <Megaphone className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Broadcast</span>
              </button>

              <button
                onClick={handleSystemPurge}
                title="Wipe database back to complete zero state"
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-900 text-slate-400 hover:text-rose-200 border border-slate-700 transition-all"
              >
                <Database className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Quick Exit to Super-Admin if in Sub-Account mode */}
          {currentMode === 'sub_account' && (
            <button
              onClick={() => setCurrentMode('super_admin')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all"
            >
              <LogOut className="w-3.5 h-3.5 text-indigo-400" />
              <span>Super-Admin</span>
            </button>
          )}

          <div className="h-6 w-px bg-slate-800" />

          {/* Agency Badge */}
          <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-bold flex items-center justify-center text-xs">
            HQ
          </div>
        </div>
      </header>

      {/* --- SUB-ACCOUNT WORKSPACE STATUS BANNER --- */}
      {currentMode === 'sub_account' && currentSubAccount && (
        <div className={`border-b px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs ${
          currentSubAccount.status === 'paused'
            ? 'bg-rose-950/80 border-rose-500/40 text-rose-200'
            : currentSubAccount.status === 'active'
            ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-200'
            : 'bg-amber-950/80 border-amber-500/30 text-amber-200'
        }`}>
          <div className="flex items-center gap-2.5">
            <span className="flex h-2.5 w-2.5 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                currentSubAccount.status === 'paused' ? 'bg-rose-400' : currentSubAccount.status === 'active' ? 'bg-emerald-400' : 'bg-amber-400'
              }`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                currentSubAccount.status === 'paused' ? 'bg-rose-500' : currentSubAccount.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'
              }`} />
            </span>
            <span className="text-slate-300">
              Active Tenant: <strong className="text-white text-sm">[{currentSubAccount.id}] {currentSubAccount.name}</strong>
            </span>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
              currentSubAccount.status === 'paused'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                : currentSubAccount.status === 'active'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
            }`}>
              {currentSubAccount.statusLabel}
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-300 text-[11px] font-mono">
            <span>Slug: <strong className="text-indigo-400">/{currentSubAccount.slug}</strong></span>
            <span>•</span>
            <span>WhatsApp: <strong className="text-emerald-400">{currentSubAccount.whatsAppNumber}</strong></span>
          </div>
        </div>
      )}

      {/* --- 1-CLICK DEDICATED LINKS TOOLBAR --- */}
      {currentMode === 'sub_account' && currentSubAccount && currentSubAccount.status !== 'paused' && (
        <div className="border-b border-indigo-500/30 bg-[#0A0E1C] px-6 py-3">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
            
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                <LinkIcon className="w-4 h-4" />
              </span>
              <div>
                <span className="text-xs font-bold text-white tracking-wide">
                  Tenant Live Production Endpoints ({masterDomain})
                </span>
                <p className="text-[11px] text-slate-400">Ready to share directly with clients of {currentSubAccount.name}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              
              {/* SMART REVIEW LINK PILL */}
              <div className="flex items-center gap-1.5 bg-[#05070D] border border-amber-500/30 rounded-xl px-2.5 py-1.5">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="text-[11px] font-mono text-amber-300 font-bold">{smartReviewUrl}</span>
                <button
                  onClick={() => safeCopyToClipboard(smartReviewUrl, 'Review Link Copied! 📋', smartReviewUrl)}
                  title="Copy Review Link"
                  className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all ml-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    const clean = currentSubAccount.cleanWhatsAppNumber;
                    const msg = `Hello from ${currentSubAccount.name}! 🌟\nWe would love to hear your feedback on your recent visit:\n${smartReviewUrl}\nThank you for choosing us! ✨`;
                    window.open(`https://wa.me/${clean}?text=${encodeURIComponent(msg)}`, '_blank');
                    showToast('Review Link Opened in WhatsApp', smartReviewUrl, 'success');
                  }}
                  title="Send via WhatsApp"
                  className="p-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white transition-all"
                >
                  <Phone className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* SMART BOOKING LINK PILL */}
              <div className="flex items-center gap-1.5 bg-[#05070D] border border-indigo-500/30 rounded-xl px-2.5 py-1.5">
                <CalendarCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[11px] font-mono text-indigo-300 font-bold">{smartBookingUrl}</span>
                <button
                  onClick={() => safeCopyToClipboard(smartBookingUrl, 'Booking Link Copied! 📋', smartBookingUrl)}
                  title="Copy Booking Link"
                  className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all ml-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    const clean = currentSubAccount.cleanWhatsAppNumber;
                    const msg = `Welcome to ${currentSubAccount.name}! 🗓️\nYou can now reserve your appointment directly through our verified portal:\n${smartBookingUrl}\nWe look forward to serving you! 🌿`;
                    window.open(`https://wa.me/${clean}?text=${encodeURIComponent(msg)}`, '_blank');
                    showToast('Booking Link Opened in WhatsApp', smartBookingUrl, 'info');
                  }}
                  title="Send via WhatsApp"
                  className="p-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white transition-all"
                >
                  <Phone className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* --- MAIN WORKSPACE VIEWPORT --- */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* ========================================================================= */}
        {/* VIEW 1: SUPER-ADMIN PORTAL (CLEAN SLATE READY)                            */}
        {/* ========================================================================= */}
        {currentMode === 'super_admin' ? (
          <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
            
            {/* Super-Admin Financial Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl bg-[#090D18] border border-slate-800 shadow-xl">
                <span className="text-xs text-slate-400 font-medium">Agency Active MRR</span>
                <div className="text-3xl font-black text-white mt-1">
                  ${statsSummary.totalMrr.toLocaleString()}<span className="text-xs text-slate-400 font-normal">/mo</span>
                </div>
                <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Calculated from live paid accounts
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-[#090D18] border border-slate-800 shadow-xl">
                <span className="text-xs text-slate-400 font-medium">Active Paid Clients</span>
                <div className="text-3xl font-black text-emerald-400 mt-1">{statsSummary.activeCount}</div>
                <div className="text-xs text-slate-400 mt-1">Paying subscriber tenants</div>
              </div>

              <div className="p-5 rounded-3xl bg-[#090D18] border border-slate-800 shadow-xl">
                <span className="text-xs text-slate-400 font-medium">Active Free Trials</span>
                <div className="text-3xl font-black text-amber-400 mt-1">{statsSummary.trialCount}</div>
                <div className="text-xs text-slate-400 mt-1">In onboarding trial period</div>
              </div>

              <div className="p-5 rounded-3xl bg-[#090D18] border border-slate-800 shadow-xl">
                <span className="text-xs text-slate-400 font-medium">Suspended Accounts</span>
                <div className="text-3xl font-black text-rose-400 mt-1">{statsSummary.pausedCount}</div>
                <div className="text-xs text-slate-400 mt-1">Locked / Paused tenants</div>
              </div>
            </div>

            {/* Sub-Accounts Directory Table or Empty Onboarding Hero */}
            <div className="rounded-3xl bg-[#090D18] border border-slate-800 shadow-2xl overflow-hidden">
              
              <div className="p-5 border-b border-slate-800 bg-[#0C1120] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-indigo-400" />
                      Client Tenants & Subscription Lifecycle Management
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Search by <strong>Account ID</strong> (e.g. ACC-1001) or business name with instant Active, Trial, and Pause toggles.
                    </p>
                  </div>

                  <button
                    onClick={() => setIsCreateAccountModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all self-start sm:self-auto hover:scale-105"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Add New Sub-Account</span>
                  </button>
                </div>

                {/* Search Bar by ID & Filter Pills */}
                {subAccounts.length > 0 && (
                  <div className="flex flex-col md:flex-row items-center gap-3 pt-1">
                    <div className="relative flex-1 w-full">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by Account ID (ACC-1001...), client business name, or slug..."
                        className="w-full bg-[#05070D] border border-slate-700/80 rounded-2xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-inner"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 bg-[#05070D] p-1 rounded-2xl border border-slate-800">
                      {[
                        { id: 'all', label: `All (${subAccounts.length})` },
                        { id: 'active', label: `Paid (${statsSummary.activeCount})` },
                        { id: 'trial', label: `Trial (${statsSummary.trialCount})` },
                        { id: 'paused', label: `Paused (${statsSummary.pausedCount})` }
                      ].map((pill) => (
                        <button
                          key={pill.id}
                          onClick={() => setStatusFilter(pill.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            statusFilter === pill.id
                              ? 'bg-indigo-600 text-white shadow-md'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {pill.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Table Body or Zero-State Hero */}
              {subAccounts.length === 0 ? (
                <div className="p-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
                    <Building2 className="w-8 h-8" />
                  </div>
                  <div className="max-w-md mx-auto space-y-1">
                    <h3 className="text-base font-bold text-white">Your SaaS Platform is Clean & Ready for Production</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      No dummy or test accounts are loaded. Click below to provision your first business client sub-account with instant review gates and booking portals.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsCreateAccountModalOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-xl shadow-indigo-600/30 transition-all hover:scale-105"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Your First Client Sub-Account</span>
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#05070D] text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                      <tr>
                        <th className="py-3.5 px-5">Account ID</th>
                        <th className="py-3.5 px-5">Business Client</th>
                        <th className="py-3.5 px-5">Subdomain & Slug</th>
                        <th className="py-3.5 px-5">Status</th>
                        <th className="py-3.5 px-5">MRR</th>
                        <th className="py-3.5 px-5 text-center">Lifecycle Controls</th>
                        <th className="py-3.5 px-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-medium">
                      {filteredSubAccounts.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-8 text-slate-500">
                            No account matches your search query: "{searchQuery}".
                          </td>
                        </tr>
                      ) : (
                        filteredSubAccounts.map((account) => (
                          <tr key={account.id} className="hover:bg-slate-900/50 transition-colors">
                            
                            {/* ID */}
                            <td className="py-4 px-5">
                              <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                                {account.id}
                              </span>
                            </td>

                            {/* Client Name */}
                            <td className="py-4 px-5">
                              <div className="font-bold text-white text-sm">{account.name}</div>
                              <div className="text-[11px] text-slate-400">{account.niche}</div>
                            </td>

                            {/* Subdomain & Endpoint */}
                            <td className="py-4 px-5 font-mono">
                              <div className="text-indigo-400">{account.subdomain}</div>
                              <div className="text-slate-500 text-[10px]">Slug: /{account.slug}</div>
                            </td>

                            {/* Status */}
                            <td className="py-4 px-5">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                                  account.status === 'active'
                                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                                    : account.status === 'trial'
                                    ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                                    : 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                                }`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  account.status === 'active'
                                    ? 'bg-emerald-400'
                                    : account.status === 'trial'
                                    ? 'bg-amber-400 animate-ping'
                                    : 'bg-rose-400'
                                }`} />
                                {account.statusLabel}
                              </span>
                            </td>

                            {/* MRR */}
                            <td className="py-4 px-5 font-mono font-bold text-white text-sm">
                              {account.mrr}
                            </td>

                            {/* LIFECYCLE 1-CLICK BUTTONS */}
                            <td className="py-4 px-5">
                              <div className="flex items-center justify-center gap-1.5">
                                
                                <button
                                  onClick={() => handleSetActive(account.id)}
                                  title="Mark as Paid Pro"
                                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 border ${
                                    account.status === 'active'
                                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/30 ring-1 ring-emerald-400'
                                      : 'bg-slate-900 text-slate-400 hover:text-emerald-300 border-slate-800'
                                  }`}
                                >
                                  <PlayCircle className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>Active</span>
                                </button>

                                <button
                                  onClick={() => handleSetTrial(account.id)}
                                  title="Set on 7-Day Free Trial"
                                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 border ${
                                    account.status === 'trial'
                                      ? 'bg-amber-600 text-white border-amber-500 shadow-md shadow-amber-600/30 ring-1 ring-amber-400'
                                      : 'bg-slate-900 text-slate-400 hover:text-amber-300 border-slate-800'
                                  }`}
                                >
                                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                  <span>Free Trial</span>
                                </button>

                                <button
                                  onClick={() => handleSetPause(account.id)}
                                  title="Suspend account immediately"
                                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 border ${
                                    account.status === 'paused'
                                      ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/30 ring-1 ring-rose-400'
                                      : 'bg-slate-900 text-slate-400 hover:text-rose-300 border-slate-800'
                                  }`}
                                >
                                  <PauseCircle className="w-3.5 h-3.5 text-rose-400" />
                                  <span>Pause</span>
                                </button>

                              </div>
                            </td>

                            {/* Actions (Login / Delete) */}
                            <td className="py-4 px-5 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => {
                                    switchSubAccount(account.id);
                                    setCurrentMode('sub_account');
                                    setSubTab('crm');
                                    if (account.status === 'paused') {
                                      showToast('Notice: Account Paused ⛔', 'This sub-account is currently suspended.', 'error');
                                    } else {
                                      showToast('Switched to Tenant 👤', `Managing [${account.id}] ${account.name}`, 'success');
                                    }
                                  }}
                                  className={`px-3 py-1.5 rounded-xl font-bold text-xs shadow-md transition-all ${
                                    account.status === 'paused'
                                      ? 'bg-rose-950 text-rose-300 border border-rose-500/40 hover:bg-rose-900'
                                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white'
                                  }`}
                                >
                                  {account.status === 'paused' ? 'View Lock' : 'Login as Client'}
                                </button>

                                <button
                                  onClick={() => handleDeleteSubAccount(account.id, account.name)}
                                  title="Delete Tenant"
                                  className="p-1.5 rounded-xl bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-500/40"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

            </div>

          </div>
        ) : (
          
          // =========================================================================
          // VIEW 2: SUB-ACCOUNT WORKSPACE (TENANT VIEW)
          // =========================================================================
          <div className="flex-1 flex overflow-hidden relative">
            
            {/* If there are no accounts created yet */}
            {!currentSubAccount ? (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="max-w-md w-full text-center space-y-4">
                  <Building2 className="w-12 h-12 text-slate-600 mx-auto" />
                  <h3 className="text-base font-bold text-white">No Active Sub-Account Selected</h3>
                  <p className="text-xs text-slate-400">Return to Super-Admin to add or choose a client sub-account.</p>
                  <button
                    onClick={() => setCurrentMode('super_admin')}
                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
                  >
                    Go to Super-Admin
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* --- SUSPENSION LOCK SCREEN (If Paused) --- */}
                {currentSubAccount.status === 'paused' && (
                  <div className="absolute inset-0 z-30 bg-[#05070D]/95 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="max-w-lg w-full bg-[#0C101E] border border-rose-500/50 rounded-3xl p-8 text-center shadow-2xl shadow-rose-950/50 space-y-6">
                      
                      <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
                        <Lock className="w-8 h-8" />
                      </div>

                      <div className="space-y-2">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          ACCOUNT ID: {currentSubAccount.id} • STATUS: SUSPENDED
                        </span>
                        <h2 className="text-2xl font-black text-white tracking-tight">
                          Account Temporarily Suspended
                        </h2>
                        <h3 className="text-sm font-semibold text-rose-300">
                          Access has been paused by platform administration
                        </h3>
                        <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto pt-2">
                          This tenant workspace has been paused. To restore live booking portals, review gates, and CRM pipelines, please contact agency administration.
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#05070D] border border-slate-800 text-xs space-y-2 text-slate-400">
                        <div className="flex justify-between">
                          <span>Business:</span>
                          <strong className="text-white">{currentSubAccount.name}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Assigned Domain:</span>
                          <span className="font-mono text-indigo-400">{currentSubAccount.subdomain}</span>
                        </div>
                      </div>

                      <div className="space-y-2.5 pt-2">
                        <button
                          onClick={() => {
                            window.open(`https://wa.me/1000000000?text=${encodeURIComponent(`Hello, we would like to inquire about reactivating our sub-account [${currentSubAccount.id}] ${currentSubAccount.name}`)}`, '_blank');
                          }}
                          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02]"
                        >
                          <Phone className="w-4 h-4" />
                          <span>Contact Support via WhatsApp</span>
                        </button>

                        <button
                          onClick={() => setCurrentMode('super_admin')}
                          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all"
                        >
                          Return to Super-Admin Portal
                        </button>
                      </div>

                    </div>
                  </div>
                )}

                {/* SUB-ACCOUNT SIDEBAR */}
                <aside className="w-64 border-r border-slate-800/80 bg-[#06080F] flex flex-col justify-between py-5 px-3 shrink-0">
                  <div className="space-y-6">
                    <div>
                      <div className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2.5">
                        Tenant Modules
                      </div>
                      <nav className="space-y-1">
                        
                        {/* 1. REVIEWS DASHBOARD */}
                        <button
                          onClick={() => setSubTab('reviews')}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                            subTab === 'reviews'
                              ? 'bg-gradient-to-r from-indigo-600/30 to-purple-600/10 text-white border border-indigo-500/50 shadow-lg'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-1.5 rounded-lg ${subTab === 'reviews' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            </div>
                            <span>Smart Reviews (Results)</span>
                          </div>
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                            {currentSubReviewsStats.googleCount}
                          </span>
                        </button>

                        {/* 2. APPOINTMENTS DASHBOARD */}
                        <button
                          onClick={() => setSubTab('appointments')}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                            subTab === 'appointments'
                              ? 'bg-gradient-to-r from-indigo-600/30 to-purple-600/10 text-white border border-indigo-500/50 shadow-lg'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-1.5 rounded-lg ${subTab === 'appointments' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                              <CalendarCheck className="w-4 h-4 text-emerald-400" />
                            </div>
                            <span>Appointments</span>
                          </div>
                          <span className="text-[10px] font-mono text-emerald-300 font-bold px-1.5 py-0.5 rounded bg-emerald-500/20">
                            {currentSubAppointments.length}
                          </span>
                        </button>

                        {/* 3. CRM LOGS TABLE */}
                        <button
                          onClick={() => setSubTab('crm')}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                            subTab === 'crm'
                              ? 'bg-gradient-to-r from-indigo-600/30 to-purple-600/10 text-white border border-indigo-500/50 shadow-lg'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-1.5 rounded-lg ${subTab === 'crm' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                              <Users className="w-4 h-4 text-indigo-400" />
                            </div>
                            <span>CRM & Sync Logs</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-slate-800">
                            {currentSubCrm.length}
                          </span>
                        </button>

                        {/* 4. COMPREHENSIVE CUSTOMIZER */}
                        <button
                          onClick={() => setSubTab('customizer')}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                            subTab === 'customizer'
                              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-600/30'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-1.5 rounded-lg ${subTab === 'customizer' ? 'bg-white text-indigo-600' : 'bg-slate-800 text-slate-400'}`}>
                              <SlidersHorizontal className="w-4 h-4" />
                            </div>
                            <span className="font-bold">Full Customizer</span>
                          </div>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                            Live
                          </span>
                        </button>

                      </nav>
                    </div>
                  </div>

                  {/* Tenant ID Footer */}
                  <div className="p-3.5 rounded-2xl bg-[#090C16] border border-slate-800 space-y-1">
                    <div className="text-[10px] uppercase font-bold text-slate-500">ID: {currentSubAccount.id}</div>
                    <div className="text-xs font-bold text-white truncate">{currentSubAccount.name}</div>
                    <div className="text-[11px] font-mono text-indigo-400 truncate">{smartReviewUrl}</div>
                  </div>
                </aside>

                {/* SUB-ACCOUNT MAIN CONTENT AREA */}
                <main className="flex-1 overflow-y-auto bg-[#05070D] flex flex-col p-6 lg:p-8">
                  
                  {/* ========================================================================= */}
                  {/* MODULE 1: REVIEWS RESULTS-DRIVEN DASHBOARD                                */}
                  {/* ========================================================================= */}
                  {subTab === 'reviews' && (
                    <div className="max-w-6xl mx-auto w-full space-y-8">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
                            <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
                            Smart Reviews Results for {currentSubAccount.name}
                          </h1>
                          <p className="text-xs text-slate-400 mt-1">
                            Clean outcome overview: 5★ ratings directed to Google vs shielded private complaints.
                          </p>
                        </div>

                        <button
                          onClick={() => setSubTab('customizer')}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Configure Review Gate</span>
                        </button>
                      </div>

                      {/* 3 Core Results Metric Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        
                        <div className="p-6 rounded-3xl bg-gradient-to-br from-[#090D18] to-[#0D1528] border border-emerald-500/30 shadow-xl space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">5-Star Reviews Pushed to Google</span>
                            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                              <CheckCircle2 className="w-5 h-5" />
                            </div>
                          </div>
                          <div className="text-4xl font-black text-white">{currentSubReviewsStats.googleCount}</div>
                          <p className="text-xs text-slate-400">Verified positive ratings directed to Google Maps.</p>
                        </div>

                        <div className="p-6 rounded-3xl bg-gradient-to-br from-[#090D18] to-[#0D1528] border border-rose-500/30 shadow-xl space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-rose-400 font-bold uppercase tracking-wider">Shielded Complaints Intercepted</span>
                            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
                              <ShieldCheck className="w-5 h-5" />
                            </div>
                          </div>
                          <div className="text-4xl font-black text-white">{currentSubReviewsStats.shieldedCount}</div>
                          <p className="text-xs text-slate-400">Sub-threshold ratings held internally to safeguard online score.</p>
                        </div>

                        <div className="p-6 rounded-3xl bg-gradient-to-br from-[#090D18] to-[#0D1528] border border-amber-500/30 shadow-xl space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">System Satisfaction Score</span>
                            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                              <Star className="w-5 h-5 fill-amber-400" />
                            </div>
                          </div>
                          <div className="text-4xl font-black text-white">
                            {currentSubReviewsStats.totalVerified > 0 ? '5.0 ★' : 'No Data Yet'}
                          </div>
                          <p className="text-xs text-slate-400">Calculated across {currentSubReviewsStats.totalVerified} recorded reviews.</p>
                        </div>

                      </div>

                      {/* Endpoint Dispatch Box */}
                      <div className="p-6 rounded-3xl bg-[#090D18] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h3 className="text-sm font-bold text-white">Smart Review Endpoint for this Tenant</h3>
                          <p className="text-xs font-mono text-amber-300 mt-1">{smartReviewUrl}</p>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => safeCopyToClipboard(smartReviewUrl, 'Link Copied!', smartReviewUrl)}
                            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold"
                          >
                            Copy Link
                          </button>
                          <button
                            onClick={() => {
                              const clean = currentSubAccount.cleanWhatsAppNumber;
                              const msg = `Hello from ${currentSubAccount.name}! 🌟\nWe would appreciate your quick feedback:\n${smartReviewUrl}\nThank you! ✨`;
                              window.open(`https://wa.me/${clean}?text=${encodeURIComponent(msg)}`, '_blank');
                            }}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                          >
                            Send via WhatsApp ↗
                          </button>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* ========================================================================= */}
                  {/* MODULE 2: APPOINTMENTS RESULTS-DRIVEN DASHBOARD                            */}
                  {/* ========================================================================= */}
                  {subTab === 'appointments' && (
                    <div className="max-w-6xl mx-auto w-full space-y-8">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
                            <CalendarCheck className="w-6 h-6 text-emerald-400" />
                            Appointments for {currentSubAccount.name}
                          </h1>
                          <p className="text-xs text-slate-400 mt-1">
                            Clean outcome overview: Confirmed client bookings and schedule status.
                          </p>
                        </div>

                        <button
                          onClick={() => setSubTab('customizer')}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Configure Services & Hours</span>
                        </button>
                      </div>

                      {/* Metric Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="p-5 rounded-3xl bg-[#090D18] border border-slate-800">
                          <span className="text-xs text-slate-400 font-semibold">Total Bookings Recorded</span>
                          <div className="text-3xl font-black text-white mt-1">{currentSubAppointments.length}</div>
                          <p className="text-xs text-emerald-400 mt-1">Captured via portal</p>
                        </div>

                        <div className="p-5 rounded-3xl bg-[#090D18] border border-slate-800">
                          <span className="text-xs text-slate-400 font-semibold">Active Services</span>
                          <div className="text-3xl font-black text-indigo-400 mt-1">
                            {currentSubAccount.bookingCustomizer?.services?.length || 0}
                          </div>
                          <p className="text-xs text-slate-400 mt-1">Available for client reservation</p>
                        </div>

                        <div className="p-5 rounded-3xl bg-[#090D18] border border-slate-800">
                          <span className="text-xs text-slate-400 font-semibold">Operating Schedule</span>
                          <div className="text-2xl font-black text-emerald-400 mt-1 font-mono">
                            {currentSubAccount.bookingCustomizer?.openTime} - {currentSubAccount.bookingCustomizer?.closeTime}
                          </div>
                          <p className="text-xs text-slate-400 mt-1">Slot interval: {currentSubAccount.bookingCustomizer?.slotInterval}m</p>
                        </div>
                      </div>

                      {/* Appointments List */}
                      <div className="rounded-3xl bg-[#090D18] border border-slate-800 overflow-hidden shadow-2xl">
                        <div className="p-4 border-b border-slate-800 bg-[#0C1120] flex items-center justify-between">
                          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                            Booked Sessions List
                          </h3>
                          <span className="text-xs text-emerald-400 font-mono">Real-Time Sync</span>
                        </div>

                        {currentSubAppointments.length === 0 ? (
                          <div className="p-10 text-center space-y-2">
                            <CalendarCheck className="w-8 h-8 text-slate-600 mx-auto opacity-50" />
                            <div className="text-sm font-semibold text-slate-400">No appointments booked yet</div>
                            <p className="text-xs text-slate-500">
                              Share your booking URL ({smartBookingUrl}) or use the Full Customizer simulator to test.
                            </p>
                          </div>
                        ) : (
                          <div className="divide-y divide-slate-800/60">
                            {currentSubAppointments.map((apt) => (
                              <div key={apt.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-900/40">
                                <div>
                                  <div className="text-sm font-bold text-white">{apt.name}</div>
                                  <div className="text-xs text-indigo-300 mt-0.5">{apt.service} • {apt.time}</div>
                                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">{apt.phone}</div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                                    {apt.status}
                                  </span>
                                  <button
                                    onClick={() => {
                                      const clean = apt.phone.replace(/[^0-9]/g, '');
                                      const msg = `Hello ${apt.name}! Confirming your appointment today at ${apt.time} for ${apt.service} at ${currentSubAccount.name}. See you soon! 🌿`;
                                      window.open(`https://wa.me/${clean}?text=${encodeURIComponent(msg)}`, '_blank');
                                    }}
                                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                                  >
                                    WhatsApp Reminder
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>
                  )}

                  {/* ========================================================================= */}
                  {/* MODULE 3: AUTOMATED REAL-TIME CRM TABLE                                   */}
                  {/* ========================================================================= */}
                  {subTab === 'crm' && (
                    <div className="max-w-6xl mx-auto w-full space-y-6">
                      
                      {/* Top Bar with Add Lead & Bulk Action Triggers */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
                            <Users className="w-6 h-6 text-indigo-400" />
                            CRM & Client Contacts for {currentSubAccount.name}
                          </h1>
                          <p className="text-xs text-slate-400 mt-1">
                            Real-time database of intake inquiries, reviews, and multi-recipient campaign broadcasts.
                          </p>
                        </div>

                        <div className="flex items-center gap-2.5 self-start sm:self-auto">
                          <button
                            onClick={() => setIsAddLeadModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
                          >
                            <UserPlus className="w-4 h-4" />
                            <span>+ Add New Lead</span>
                          </button>
                        </div>
                      </div>

                      {/* STICKY BULK ACTIONS BAR */}
                      {selectedLeadIds.length > 0 && (
                        <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/90 via-[#0C1226] to-purple-950/90 border border-indigo-500/50 shadow-2xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
                          <div className="flex items-center gap-3">
                            <span className="w-7 h-7 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-xs text-white shadow-md">
                              {selectedLeadIds.length}
                            </span>
                            <div>
                              <div className="text-xs font-bold text-white">
                                Selected {selectedLeadIds.length} of {currentSubCrm.length} leads
                              </div>
                              <div className="text-[11px] text-slate-400">
                                Dispatch tailored bulk WhatsApp template or delete selected contacts.
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setIsBulkCampaignModalOpen(true)}
                              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all hover:scale-105"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Bulk WhatsApp Campaign ({selectedLeadIds.length})</span>
                            </button>

                            <button
                              onClick={handleBulkDelete}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 font-bold text-xs transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete Selected</span>
                            </button>

                            <button
                              onClick={() => setSelectedLeadIds([])}
                              className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold"
                            >
                              Deselect All
                            </button>
                          </div>
                        </div>
                      )}

                      {/* CRM Table */}
                      <div className="rounded-3xl bg-[#090D18] border border-slate-800 overflow-hidden shadow-2xl">
                        <div className="p-4 border-b border-slate-800 bg-[#0C1120] flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">Leads & Interactions Stream</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                              {currentSubCrm.length} Contacts
                            </span>
                          </div>
                          <span className="text-[11px] text-emerald-400 font-mono">100% Real-Time Persistent Sync</span>
                        </div>

                        <table className="w-full text-left text-xs">
                          <thead className="bg-[#05070D] text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                            <tr>
                              <th className="py-3 px-4 w-10 text-center">
                                <input
                                  type="checkbox"
                                  checked={currentSubCrm.length > 0 && selectedLeadIds.length === currentSubCrm.length}
                                  onChange={handleSelectAllLeads}
                                  className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 focus:ring-0 cursor-pointer accent-indigo-600"
                                />
                              </th>
                              <th className="py-3 px-4">Client Name</th>
                              <th className="py-3 px-4">Phone & WhatsApp</th>
                              <th className="py-3 px-4">Activity & Intake</th>
                              <th className="py-3 px-4">Timestamp</th>
                              <th className="py-3 px-4 text-center">Badge</th>
                              <th className="py-3 px-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60 font-medium">
                            {currentSubCrm.length === 0 ? (
                              <tr>
                                <td colSpan={7} className="text-center py-10 text-slate-500">
                                  <Users className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-40" />
                                  <div className="text-sm font-semibold text-slate-400">No leads recorded yet for this tenant</div>
                                  <p className="text-xs text-slate-500 mt-1">
                                    Click "+ Add New Lead" or share your endpoints to begin capturing clients automatically.
                                  </p>
                                </td>
                              </tr>
                            ) : (
                              currentSubCrm.map((rec) => {
                                const isSelected = selectedLeadIds.includes(rec.id);
                                return (
                                  <tr
                                    key={rec.id}
                                    className={`transition-colors ${
                                      isSelected ? 'bg-indigo-950/30' : 'hover:bg-slate-900/40'
                                    }`}
                                  >
                                    <td className="py-3.5 px-4 text-center">
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => handleToggleSelectLead(rec.id)}
                                        className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 focus:ring-0 cursor-pointer accent-indigo-600"
                                      />
                                    </td>

                                    <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                                      <div className="w-7 h-7 rounded-full bg-slate-800 text-indigo-300 font-bold flex items-center justify-center text-[10px]">
                                        {rec.clientName.substring(0, 1)}
                                      </div>
                                      <span>{rec.clientName}</span>
                                    </td>

                                    <td className="py-3.5 px-4 font-mono text-slate-300">
                                      <div className="flex items-center gap-1">
                                        <span>{rec.phone}</span>
                                        <button
                                          onClick={() => safeCopyToClipboard(rec.phone, 'Phone Copied', rec.phone)}
                                          title="Copy Phone"
                                          className="text-slate-500 hover:text-white p-0.5"
                                        >
                                          <Copy className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </td>

                                    <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate" title={rec.activity}>
                                      {rec.activity}
                                    </td>

                                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                                      {rec.date}
                                    </td>
                                    
                                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                                        rec.badgeColor === 'emerald'
                                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                                          : rec.badgeColor === 'amber'
                                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                                          : rec.badgeColor === 'rose'
                                          ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                                          : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                                      }`}>
                                        {rec.badge}
                                      </span>
                                    </td>

                                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                      <div className="flex items-center justify-end gap-1.5">
                                        <button
                                          onClick={() => {
                                            window.open(`https://wa.me/${rec.cleanPhone}?text=${encodeURIComponent(`Hello ${rec.clientName}, greetings from ${currentSubAccount.name}!`)}`, '_blank');
                                          }}
                                          title="Chat on WhatsApp"
                                          className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 transition-all"
                                        >
                                          <Phone className="w-3.5 h-3.5" />
                                        </button>

                                        <button
                                          onClick={() => handleDeleteLead(rec.id, rec.clientName)}
                                          title="Delete Lead"
                                          className="p-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 transition-all"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* ========================================================================= */}
                  {/* MODULE 4: COMPREHENSIVE FULL-DETAIL CUSTOMIZER                            */}
                  {/* ========================================================================= */}
                  {subTab === 'customizer' && reviewDraft && bookingDraft && (
                    <div className="max-w-7xl mx-auto w-full space-y-8">
                      
                      {/* Top Bar */}
                      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0C1124] to-[#0A0E1C] border border-indigo-500/30 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/15 border border-indigo-500/30 px-3 py-0.5 rounded-full">
                            Tenant Self-Service Engine
                          </span>
                          <h1 className="text-2xl font-black text-white mt-1">
                            Smart Reviews & Appointment Booking Customizer
                          </h1>
                          <p className="text-xs text-slate-300 mt-0.5">
                            Fine-tune prices, services, operating hours, and Google Maps routing rules with real-time live preview.
                          </p>
                        </div>

                        <button
                          onClick={handleSaveCustomizer}
                          className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-xl shadow-emerald-600/30 transition-all hover:scale-105 shrink-0"
                        >
                          <CheckCheck className="w-4 h-4" />
                          <span>Save & Publish Changes</span>
                        </button>
                      </div>

                      {/* Engine Selector */}
                      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                        <button
                          onClick={() => setCustomizerSubSection('review_engine')}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            customizerSubSection === 'review_engine'
                              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                              : 'bg-slate-900 text-slate-400 hover:text-white'
                          }`}
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>Smart Review Settings</span>
                        </button>

                        <button
                          onClick={() => setCustomizerSubSection('booking_engine')}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            customizerSubSection === 'booking_engine'
                              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                              : 'bg-slate-900 text-slate-400 hover:text-white'
                          }`}
                        >
                          <CalendarCheck className="w-3.5 h-3.5" />
                          <span>Booking Engine Settings</span>
                        </button>
                      </div>

                      {/* REVIEW ENGINE CUSTOMIZER */}
                      {customizerSubSection === 'review_engine' && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                          
                          <div className="lg:col-span-7 space-y-6">
                            <div className="p-6 rounded-3xl bg-[#090D18] border border-slate-800 shadow-xl space-y-5">
                              
                              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                                <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                                Review Routing & Business Identity
                              </h3>

                              <div>
                                <label className="text-xs text-slate-400 font-semibold block mb-1">
                                  Display Business Name
                                </label>
                                <input
                                  type="text"
                                  value={reviewDraft.displayName}
                                  onChange={(e) => setReviewDraft({ ...reviewDraft, displayName: e.target.value })}
                                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white font-bold focus:outline-none focus:border-amber-500"
                                />
                              </div>

                              <div>
                                <label className="text-xs text-slate-400 font-semibold block mb-1">
                                  Tagline & Subtitle
                                </label>
                                <input
                                  type="text"
                                  value={reviewDraft.tagline}
                                  onChange={(e) => setReviewDraft({ ...reviewDraft, tagline: e.target.value })}
                                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                                />
                              </div>

                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <label className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                                    <Globe className="w-3.5 h-3.5 text-amber-400" />
                                    <span>Google Maps Direct Write-a-Review URL</span>
                                  </label>
                                  <span className="text-[10px] text-amber-400 font-mono">Editable Link</span>
                                </div>
                                <div className="flex gap-2">
                                  <input
                                    type="url"
                                    value={reviewDraft.googlePlaceUrl}
                                    onChange={(e) => setReviewDraft({ ...reviewDraft, googlePlaceUrl: e.target.value })}
                                    placeholder="https://search.google.com/local/writereview?placeid=..."
                                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-amber-300 font-mono focus:outline-none focus:border-amber-500"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => window.open(reviewDraft.googlePlaceUrl, '_blank')}
                                    className="px-3.5 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 text-xs font-bold transition-all"
                                  >
                                    Test Link ↗
                                  </button>
                                </div>
                              </div>

                              <div>
                                <label className="text-xs text-slate-400 font-semibold block mb-2">
                                  Routing Filter Threshold
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                  <button
                                    type="button"
                                    onClick={() => setReviewDraft({ ...reviewDraft, threshold: 4 })}
                                    className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all ${
                                      reviewDraft.threshold === 4
                                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md'
                                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                                    }`}
                                  >
                                    <div className="flex items-center gap-1.5">
                                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                      <span>4 & 5 Stars (Standard)</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-normal mt-1">
                                      Forwards 4 and 5 stars to Google; holds 1–3 stars internally.
                                    </p>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setReviewDraft({ ...reviewDraft, threshold: 5 })}
                                    className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all ${
                                      reviewDraft.threshold === 5
                                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md'
                                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                                    }`}
                                  >
                                    <div className="flex items-center gap-1.5">
                                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                      <span>5 Stars Only (Strict)</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-normal mt-1">
                                      Forwards only perfect 5-star reviews; intercepts all others.
                                    </p>
                                  </button>
                                </div>
                              </div>

                              <div className="space-y-4 pt-2 border-t border-slate-800">
                                <div>
                                  <label className="text-xs text-slate-400 font-semibold block mb-1">
                                    Rating Question Heading
                                  </label>
                                  <input
                                    type="text"
                                    value={reviewDraft.heading}
                                    onChange={(e) => setReviewDraft({ ...reviewDraft, heading: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                                  />
                                </div>

                                <div>
                                  <label className="text-xs text-slate-400 font-semibold block mb-1">
                                    5-Star Thank You Message (Google CTA)
                                  </label>
                                  <textarea
                                    rows={2}
                                    value={reviewDraft.thankYouGoogleText}
                                    onChange={(e) => setReviewDraft({ ...reviewDraft, thankYouGoogleText: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-emerald-300"
                                  />
                                </div>

                                <div>
                                  <label className="text-xs text-slate-400 font-semibold block mb-1">
                                    Sub-Threshold Intercept Message (1 to 3 Stars)
                                  </label>
                                  <textarea
                                    rows={2}
                                    value={reviewDraft.apologyText}
                                    onChange={(e) => setReviewDraft({ ...reviewDraft, apologyText: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-rose-300"
                                  />
                                </div>
                              </div>

                            </div>
                          </div>

                          {/* Live Simulator */}
                          <div className="lg:col-span-5 sticky top-24">
                            <div className="p-4 rounded-3xl bg-[#090D18] border border-slate-800 shadow-2xl space-y-4">
                              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                                <div className="flex items-center gap-2">
                                  <Smartphone className="w-4 h-4 text-amber-400" />
                                  <span className="text-xs font-bold text-white">Live Mobile Simulator</span>
                                </div>
                                <span className="text-[10px] font-mono text-emerald-400">Interactive</span>
                              </div>

                              <div className="w-full max-w-xs mx-auto rounded-[32px] border-4 border-slate-700 bg-[#07090E] p-4 shadow-2xl space-y-4 text-center">
                                <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto" />
                                
                                <div className="text-[10px] font-mono text-slate-500 truncate">
                                  {smartReviewUrl}
                                </div>

                                <div className="space-y-1">
                                  <div className="text-sm font-black text-white">{reviewDraft.displayName}</div>
                                  <p className="text-[10px] text-slate-400 leading-tight">{reviewDraft.tagline}</p>
                                </div>

                                <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                                  <h4 className="text-xs font-bold text-white">{reviewDraft.heading}</h4>
                                  
                                  <div className="flex justify-center items-center gap-1.5 py-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <button
                                        key={star}
                                        type="button"
                                        onClick={() => setPreviewRating(star)}
                                        className="p-1 hover:scale-125 transition-transform"
                                      >
                                        <Star
                                          className={`w-7 h-7 ${
                                            star <= previewRating
                                              ? 'text-amber-400 fill-amber-400 drop-shadow-md'
                                              : 'text-slate-700'
                                          }`}
                                        />
                                      </button>
                                    ))}
                                  </div>

                                  {previewRating >= reviewDraft.threshold ? (
                                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-300 text-left space-y-1.5 animate-in fade-in">
                                      <div className="font-bold flex items-center gap-1 text-emerald-400">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        <span>{reviewDraft.thankYouGoogleHeading}</span>
                                      </div>
                                      <p className="leading-tight text-slate-300">{reviewDraft.thankYouGoogleText}</p>
                                      <button
                                        type="button"
                                        onClick={handleSimulateReview}
                                        className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] shadow-md transition-all mt-1"
                                      >
                                        Post Review on Google Maps ↗
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[10px] text-rose-300 text-left space-y-1.5 animate-in fade-in">
                                      <div className="font-bold flex items-center gap-1 text-rose-400">
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                        <span>{reviewDraft.apologyHeading}</span>
                                      </div>
                                      <p className="leading-tight text-slate-300">{reviewDraft.apologyText}</p>
                                      <textarea
                                        rows={2}
                                        placeholder="Type your notes here for management..."
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-[10px] text-white"
                                      />
                                      <button
                                        type="button"
                                        onClick={handleSimulateReview}
                                        className="w-full py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] shadow-md transition-all"
                                      >
                                        Submit Private Feedback
                                      </button>
                                    </div>
                                  )}
                                </div>

                                <div className="text-[9px] text-slate-600 font-mono">
                                  Syncs directly to tenant CRM
                                </div>
                              </div>
                            </div>
                          </div>

                        </div>
                      )}

                      {/* BOOKING ENGINE CUSTOMIZER */}
                      {customizerSubSection === 'booking_engine' && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                          
                          <div className="lg:col-span-7 space-y-6">
                            
                            <div className="p-6 rounded-3xl bg-[#090D18] border border-slate-800 shadow-xl space-y-4">
                              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                                <CalendarCheck className="w-4 h-4 text-indigo-400" />
                                Portal Header & Instructions
                              </h3>

                              <div>
                                <label className="text-xs text-slate-400 font-semibold block mb-1">
                                  Portal Title
                                </label>
                                <input
                                  type="text"
                                  value={bookingDraft.portalTitle}
                                  onChange={(e) => setBookingDraft({ ...bookingDraft, portalTitle: e.target.value })}
                                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white font-bold"
                                />
                              </div>

                              <div>
                                <label className="text-xs text-slate-400 font-semibold block mb-1">
                                  Portal Subtitle
                                </label>
                                <input
                                  type="text"
                                  value={bookingDraft.portalSubtitle}
                                  onChange={(e) => setBookingDraft({ ...bookingDraft, portalSubtitle: e.target.value })}
                                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-300"
                                />
                              </div>

                              <div>
                                <label className="text-xs text-slate-400 font-semibold block mb-1">
                                  Hero Notice / Arrival Instruction
                                </label>
                                <input
                                  type="text"
                                  value={bookingDraft.heroNotice}
                                  onChange={(e) => setBookingDraft({ ...bookingDraft, heroNotice: e.target.value })}
                                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-indigo-300"
                                />
                              </div>
                            </div>

                            {/* Services Manager */}
                            <div className="p-6 rounded-3xl bg-[#090D18] border border-slate-800 shadow-xl space-y-4">
                              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                                <div>
                                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-emerald-400" />
                                    Services Catalog & Pricing
                                  </h3>
                                  <p className="text-[11px] text-slate-400">Add, edit, or remove services, durations, and rates</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={handleAddService}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Add Service</span>
                                </button>
                              </div>

                              <div className="space-y-3">
                                {bookingDraft.services.map((srv, index) => (
                                  <div key={srv.id} className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs font-bold text-indigo-400">Service #{index + 1}</span>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteService(srv.id)}
                                        className="text-rose-400 hover:text-rose-300 p-1"
                                        title="Delete Service"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                      <div className="sm:col-span-2">
                                        <label className="text-[10px] text-slate-400 block mb-0.5">Service Name</label>
                                        <input
                                          type="text"
                                          value={srv.name}
                                          onChange={(e) => {
                                            const updated = [...bookingDraft.services];
                                            updated[index].name = e.target.value;
                                            setBookingDraft({ ...bookingDraft, services: updated });
                                          }}
                                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                                        />
                                      </div>
                                      <div>
                                        <label className="text-[10px] text-slate-400 block mb-0.5">Category</label>
                                        <input
                                          type="text"
                                          value={srv.category}
                                          onChange={(e) => {
                                            const updated = [...bookingDraft.services];
                                            updated[index].category = e.target.value;
                                            setBookingDraft({ ...bookingDraft, services: updated });
                                          }}
                                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-300"
                                        />
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                      <div>
                                        <label className="text-[10px] text-slate-400 block mb-0.5">Price ($)</label>
                                        <input
                                          type="number"
                                          value={srv.price}
                                          onChange={(e) => {
                                            const updated = [...bookingDraft.services];
                                            updated[index].price = Number(e.target.value);
                                            setBookingDraft({ ...bookingDraft, services: updated });
                                          }}
                                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-emerald-400 font-mono font-bold"
                                        />
                                      </div>
                                      <div>
                                        <label className="text-[10px] text-slate-400 block mb-0.5">Duration (Minutes)</label>
                                        <input
                                          type="number"
                                          value={srv.duration}
                                          onChange={(e) => {
                                            const updated = [...bookingDraft.services];
                                            updated[index].duration = Number(e.target.value);
                                            setBookingDraft({ ...bookingDraft, services: updated });
                                          }}
                                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-indigo-300 font-mono"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Schedule & Hours */}
                            <div className="p-6 rounded-3xl bg-[#090D18] border border-slate-800 shadow-xl space-y-4">
                              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                                <Clock className="w-4 h-4 text-indigo-400" />
                                Working Hours & Slot Intervals
                              </h3>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                  <label className="text-xs text-slate-400 font-semibold block mb-1">Opening Time</label>
                                  <input
                                    type="time"
                                    value={bookingDraft.openTime}
                                    onChange={(e) => setBookingDraft({ ...bookingDraft, openTime: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-slate-400 font-semibold block mb-1">Closing Time</label>
                                  <input
                                    type="time"
                                    value={bookingDraft.closeTime}
                                    onChange={(e) => setBookingDraft({ ...bookingDraft, closeTime: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-slate-400 font-semibold block mb-1">Slot Interval</label>
                                  <select
                                    value={bookingDraft.slotInterval}
                                    onChange={(e) => setBookingDraft({ ...bookingDraft, slotInterval: Number(e.target.value) })}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                                  >
                                    <option value={15}>15 Minutes</option>
                                    <option value={30}>30 Minutes</option>
                                    <option value={45}>45 Minutes</option>
                                    <option value={60}>60 Minutes</option>
                                  </select>
                                </div>
                              </div>

                              <div>
                                <label className="text-xs text-slate-400 font-semibold block mb-1.5">
                                  Confirmation Note
                                </label>
                                <textarea
                                  rows={2}
                                  value={bookingDraft.confirmationNote}
                                  onChange={(e) => setBookingDraft({ ...bookingDraft, confirmationNote: e.target.value })}
                                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-emerald-300"
                                />
                              </div>
                            </div>

                          </div>

                          {/* Live Simulator */}
                          <div className="lg:col-span-5 sticky top-24">
                            <div className="p-4 rounded-3xl bg-[#090D18] border border-slate-800 shadow-2xl space-y-4">
                              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                                <div className="flex items-center gap-2">
                                  <Smartphone className="w-4 h-4 text-indigo-400" />
                                  <span className="text-xs font-bold text-white">Live Booking Simulator</span>
                                </div>
                                <span className="text-[10px] font-mono text-emerald-400">Interactive</span>
                              </div>

                              <div className="w-full max-w-xs mx-auto rounded-[32px] border-4 border-slate-700 bg-[#07090E] p-4 shadow-2xl space-y-3.5 text-left">
                                <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto" />
                                
                                <div className="text-[10px] font-mono text-slate-500 text-center truncate">
                                  {smartBookingUrl}
                                </div>

                                <div className="space-y-0.5 text-center">
                                  <h4 className="text-xs font-black text-white">{bookingDraft.portalTitle}</h4>
                                  <p className="text-[10px] text-slate-400">{bookingDraft.portalSubtitle}</p>
                                </div>

                                {bookingDraft.heroNotice && (
                                  <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[9px] text-indigo-300 text-center">
                                    💡 {bookingDraft.heroNotice}
                                  </div>
                                )}

                                <div className="space-y-1">
                                  <label className="text-[10px] text-slate-400 font-bold block">Select Service:</label>
                                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                                    {bookingDraft.services.map((s) => (
                                      <div
                                        key={s.id}
                                        onClick={() => setPreviewSelectedService(s.id)}
                                        className={`p-2 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                                          previewSelectedService === s.id
                                            ? 'bg-indigo-600/30 border-indigo-500 text-white font-bold'
                                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                                        }`}
                                      >
                                        <div>
                                          <div className="text-[11px]">{s.name}</div>
                                          <div className="text-[9px] text-slate-400">{s.duration} mins</div>
                                        </div>
                                        <span className="text-emerald-400 font-mono font-bold">${s.price}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <label className="text-[10px] text-slate-400 font-bold block">Available Slots:</label>
                                  <div className="grid grid-cols-3 gap-1 text-center">
                                    {['10:00 AM', '11:30 AM', '02:00 PM', '04:30 PM', '06:00 PM', '07:30 PM'].map((slot) => (
                                      <button
                                        key={slot}
                                        type="button"
                                        onClick={() => setPreviewSelectedSlot(slot)}
                                        className={`py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all ${
                                          previewSelectedSlot === slot
                                            ? 'bg-indigo-600 text-white shadow-md'
                                            : 'bg-slate-900 text-slate-400 hover:text-white'
                                        }`}
                                      >
                                        {slot}
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                <form onSubmit={handleSimulateBooking} className="space-y-2 pt-1 border-t border-slate-800">
                                  <input
                                    type="text"
                                    required
                                    placeholder="Your full name..."
                                    value={previewClientName}
                                    onChange={(e) => setPreviewClientName(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-[10px] text-white"
                                  />
                                  <input
                                    type="tel"
                                    required
                                    placeholder="WhatsApp phone number..."
                                    value={previewClientPhone}
                                    onChange={(e) => setPreviewClientPhone(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-[10px] text-white font-mono"
                                  />
                                  <button
                                    type="submit"
                                    className="w-full py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg transition-all"
                                  >
                                    Book Session (Sync to CRM)
                                  </button>
                                </form>

                              </div>
                            </div>
                          </div>

                        </div>
                      )}

                    </div>
                  )}

                </main>
              </>
            )}

          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* MODAL: CREATE FIRST / NEW SUB-ACCOUNT (PRODUCTION ONBOARDING)              */}
      {/* ========================================================================= */}
      {isCreateAccountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#090D18] border border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-800 bg-[#0C1120] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Create New Tenant Sub-Account</h3>
                  <p className="text-[11px] text-slate-400">Provisions isolated booking, review, and CRM endpoints</p>
                </div>
              </div>
              <button onClick={() => setIsCreateAccountModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubAccount} className="p-6 space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Business / Client Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Al-Nour Aesthetics & Dental Center..."
                  value={newAccountForm.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const autoSlug = name
                      .toLowerCase()
                      .replace(/[^a-z0-9]/g, '-')
                      .replace(/-+/g, '-')
                      .replace(/^-|-$/g, '');
                    setNewAccountForm({ ...newAccountForm, name, slug: autoSlug });
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Tenant URL Slug *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. al-nour..."
                    value={newAccountForm.slug}
                    onChange={(e) => setNewAccountForm({ ...newAccountForm, slug: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-indigo-300 font-mono focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block truncate">
                    /{newAccountForm.slug || 'slug'} on {masterDomain}
                  </span>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Industry / Niche</label>
                  <select
                    value={newAccountForm.niche}
                    onChange={(e) => setNewAccountForm({ ...newAccountForm, niche: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Medical & Healthcare">Medical & Healthcare</option>
                    <option value="Legal & Advisory">Legal & Advisory</option>
                    <option value="Luxury Salons & Spas">Luxury Salons & Spas</option>
                    <option value="Automotive & Detailing">Automotive & Detailing</option>
                    <option value="Consulting & Agency">Consulting & Agency</option>
                    <option value="Fitness & Personal Training">Fitness & Personal Training</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">WhatsApp Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+966501234567 or +1..."
                    value={newAccountForm.whatsAppNumber}
                    onChange={(e) => setNewAccountForm({ ...newAccountForm, whatsAppNumber: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-emerald-400 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Initial Status</label>
                  <select
                    value={newAccountForm.status}
                    onChange={(e) => setNewAccountForm({ ...newAccountForm, status: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="trial">Free Trial (7 Days)</option>
                    <option value="active">Active Paid Pro</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Monthly Plan (MRR $)</label>
                  <input
                    type="number"
                    value={newAccountForm.mrrValue}
                    onChange={(e) => setNewAccountForm({ ...newAccountForm, mrrValue: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Plan Tier</label>
                  <select
                    value={newAccountForm.plan}
                    onChange={(e) => setNewAccountForm({ ...newAccountForm, plan: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Growth Pro">Growth Pro ($499/mo)</option>
                    <option value="Enterprise Tier">Enterprise Tier ($799/mo)</option>
                    <option value="Starter Plan">Starter Plan ($299/mo)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Google Maps Write-a-Review URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://search.google.com/local/writereview?placeid=..."
                  value={newAccountForm.googlePlaceUrl}
                  onChange={(e) => setNewAccountForm({ ...newAccountForm, googlePlaceUrl: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-amber-300 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreateAccountModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold shadow-lg shadow-emerald-600/30"
                >
                  Create & Launch Tenant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD NEW CRM LEAD                                                   */}
      {/* ========================================================================= */}
      {isAddLeadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#090D18] border border-slate-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-800 bg-[#0C1120] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Add New Contact</h3>
                  <p className="text-[11px] text-slate-400">Saved to {currentSubAccount?.name} CRM</p>
                </div>
              </div>
              <button onClick={() => setIsAddLeadModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewLead} className="p-6 space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe..."
                  value={newLeadForm.name}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">WhatsApp Phone *</label>
                <input
                  type="tel"
                  required
                  placeholder="+1 (555) 000-0000 or international..."
                  value={newLeadForm.phone}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-emerald-400 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="client@mail.com"
                    value={newLeadForm.email}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, email: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Lead Tag</label>
                  <select
                    value={newLeadForm.tag}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, tag: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="New Lead">New Lead</option>
                    <option value="Interested">Interested</option>
                    <option value="VIP">VIP</option>
                    <option value="Appointment Needed">Appointment Needed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Target Service</label>
                <input
                  type="text"
                  placeholder="e.g. Initial Consultation..."
                  value={newLeadForm.service}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, service: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Notes</label>
                <textarea
                  rows={2}
                  placeholder="Client intake requirements or context..."
                  value={newLeadForm.notes}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, notes: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddLeadModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold shadow-md shadow-indigo-600/30"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: BULK WHATSAPP CAMPAIGN                                              */}
      {/* ========================================================================= */}
      {isBulkCampaignModalOpen && currentSubAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#090D18] border border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-800 bg-[#0C1120] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Bulk WhatsApp Campaign</h3>
                  <p className="text-[11px] text-slate-400">Selected: {selectedLeadIds.length} contacts</p>
                </div>
              </div>
              <button onClick={() => setIsBulkCampaignModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="text-slate-400 font-semibold block mb-1.5">Smart Insert Variables:</label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { tag: '{name}', label: 'Client Name' },
                    { tag: '{business_name}', label: 'Business Name' },
                    { tag: '{booking_link}', label: 'Booking URL' },
                    { tag: '{review_link}', label: 'Review URL' }
                  ].map((v) => (
                    <button
                      key={v.tag}
                      type="button"
                      onClick={() => setBulkCampaignMessage((prev) => prev + ' ' + v.tag)}
                      className="px-2 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono transition-all"
                    >
                      + {v.tag}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Message Content:</label>
                <textarea
                  rows={5}
                  value={bulkCampaignMessage}
                  onChange={(e) => setBulkCampaignMessage(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white leading-relaxed focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
                <div className="text-[10px] uppercase font-bold text-emerald-400">Preview:</div>
                <p className="text-[11px] text-slate-300 whitespace-pre-line leading-relaxed font-sans">
                  {bulkCampaignMessage
                    .replace(/{name}/g, currentSubCrm.find((r) => selectedLeadIds.includes(r.id))?.clientName || 'Valued Client')
                    .replace(/{business_name}/g, currentSubAccount.name)
                    .replace(/{booking_link}/g, smartBookingUrl)
                    .replace(/{review_link}/g, smartReviewUrl)}
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-[#0C1120] flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  safeCopyToClipboard(bulkCampaignMessage, 'Template Copied! 📋', 'Ready to paste.');
                }}
                className="px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsBulkCampaignModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecuteBulkCampaign}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all hover:scale-105"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Launch Campaign ({selectedLeadIds.length})</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: BROADCAST ANNOUNCEMENT                                             */}
      {/* ========================================================================= */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#090D18] border border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-800 bg-[#0C1120] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Broadcast Announcement</h3>
                  <p className="text-xs text-slate-400">Dispatches notification to all client tenants</p>
                </div>
              </div>
              <button onClick={() => setIsBroadcastModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="text-slate-400 font-semibold block mb-1.5">Target Audience</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'all', label: `All (${subAccounts.length})` },
                    { id: 'trial', label: `Trial (${statsSummary.trialCount})` },
                    { id: 'paid', label: `Paid (${statsSummary.activeCount})` }
                  ].map((aud) => (
                    <button
                      key={aud.id}
                      onClick={() => setBroadcastTarget(aud.id)}
                      className={`py-2 rounded-xl border text-center font-semibold transition-all ${
                        broadcastTarget === aud.id
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                          : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      {aud.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1.5">Announcement Content</label>
                <textarea
                  rows={4}
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white"
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-[#0C1120] flex items-center justify-end gap-3">
              <button
                onClick={() => setIsBroadcastModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  showToast('Broadcast Dispatched! 📢', `Announcement sent to selected tenants.`, 'success');
                  setIsBroadcastModalOpen(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md"
              >
                Send Broadcast
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}