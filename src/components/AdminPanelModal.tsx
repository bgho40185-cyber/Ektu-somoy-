import React, { useState, useEffect } from 'react';
import {
  X,
  RefreshCw,
  LogOut,
  ShoppingBag,
  Calendar,
  MessageSquare,
  TrendingUp,
  Clock,
  Phone,
  User as UserIcon,
  CheckCircle2,
  AlertCircle,
  Trash2,
  ChevronRight,
  Filter,
  ChefHat,
  MapPin,
  Tag,
  Plus,
  Video,
  Image as ImageIcon,
  Check,
  Eye,
  Play,
  Film,
  Percent,
  Camera,
  Upload,
  Loader2,
  Search,
  ArrowRight,
} from 'lucide-react';
import { OrderDetails, CafeOffer } from '../types';
import {
  ReservationData,
  InquiryData,
  subscribeToOrders,
  subscribeToReservations,
  subscribeToOffers,
  fetchAllOrdersForAdmin,
  fetchAllReservationsForAdmin,
  fetchAllInquiriesForAdmin,
  fetchAllOffers,
  updateOrderStatus,
  deleteOrderDoc,
  updateReservationStatus,
  deleteReservationDoc,
  deleteInquiryDoc,
  saveOfferDoc,
  deleteOfferDoc,
  logOutAdmin,
  ADMIN_EMAIL,
  uploadOfferMediaFile,
  compressImageFile,
  saveVideoInFirestoreChunks,
  loadVideoFromFirestoreChunks,
  cacheVideoBlobUrl,
} from '../firebase';
import { formatPrice } from '../utils/cafeHelpers';
import { useCafeStatus } from '../context/CafeStatusContext';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoggedOut: () => void;
}

type AdminTab = 'orders' | 'offers' | 'reservations';
type OrderFilter = 'all' | 'pending' | 'completed';

// Video Player for Admin Card list supporting direct URLs and chunked videos
const AdminCardVideoPlayer: React.FC<{ offer: CafeOffer }> = ({ offer }) => {
  const [videoSrc, setVideoSrc] = useState<string>(() => {
    if (offer.mediaUrl && !offer.mediaUrl.startsWith('firestore-chunks://')) {
      return offer.mediaUrl;
    }
    return '';
  });
  const [loading, setLoading] = useState<boolean>(!videoSrc && !!offer.videoChunksCount);

  useEffect(() => {
    if (videoSrc) return;
    if (offer.videoChunksCount) {
      let isMounted = true;
      loadVideoFromFirestoreChunks(offer.id, offer.videoChunksCount, offer.videoMimeType)
        .then((url) => {
          if (isMounted) {
            setVideoSrc(url);
            setLoading(false);
          }
        })
        .catch(() => {
          if (isMounted) setLoading(false);
        });
      return () => {
        isMounted = false;
      };
    }
  }, [offer.id, offer.videoChunksCount, offer.videoMimeType, videoSrc]);

  if (loading) {
    return (
      <div className="w-full h-28 flex items-center justify-center gap-2 bg-black text-zinc-400 text-xs font-mono">
        <Loader2 className="w-4 h-4 animate-spin text-[#C29B6B]" />
        <span>Loading video...</span>
      </div>
    );
  }

  if (!videoSrc) {
    return (
      <div className="w-full h-24 flex items-center justify-center bg-black text-zinc-400 text-xs font-mono">
        <span>Video Attached</span>
      </div>
    );
  }

  return (
    <video
      src={videoSrc}
      controls
      playsInline
      className="w-full max-h-36 object-contain bg-black"
    />
  );
};

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  onLoggedOut,
}) => {
  const { isOpen: isCafeOpenStatus, toggleCafeStatus, isLoading: isStatusLoading } = useCafeStatus();
  const [activeTab, setActiveTab] = useState<AdminTab>('orders');
  const [orderFilter, setOrderFilter] = useState<OrderFilter>('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orders, setOrders] = useState<OrderDetails[]>([]);
  const [reservations, setReservations] = useState<ReservationData[]>([]);
  const [inquiries, setInquiries] = useState<InquiryData[]>([]);
  const [offers, setOffers] = useState<CafeOffer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Offer Creation & Edit State
  const [isOfferFormOpen, setIsOfferFormOpen] = useState(false);
  const [editingOfferId, setEditingOfferId] = useState<string | null>(null);
  const [offerForm, setOfferForm] = useState<{
    title: string;
    description: string;
    code: string;
    discountBadge: string;
    mediaType: 'none' | 'video' | 'image';
    mediaUrl: string;
    validUntil: string;
    minOrder: string;
    isActive: boolean;
  }>({
    title: '',
    description: '',
    code: '',
    discountBadge: 'SPECIAL DEAL',
    mediaType: 'none',
    mediaUrl: '',
    validUntil: '',
    minOrder: '',
    isActive: true,
  });

  // Direct Gallery File Upload State
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string>('');
  const [pendingVideoFile, setPendingVideoFile] = useState<File | null>(null);
  const [pendingPhotoFile, setPendingPhotoFile] = useState<File | null>(null);
  const [isPublishingOffer, setIsPublishingOffer] = useState<boolean>(false);
  const [publishStatusText, setPublishStatusText] = useState<string>('');

  // Load real-time orders, reservations, and offers
  useEffect(() => {
    if (!isOpen) return;

    setIsLoading(true);
    // Initial fetch with per-resource graceful fallback
    Promise.all([
      fetchAllOrdersForAdmin()
        .then((res) => setOrders(res || []))
        .catch((e) => {
          console.warn('Orders fetch note:', e);
          return [];
        }),
      fetchAllReservationsForAdmin()
        .then((res) => setReservations(res || []))
        .catch((e) => {
          console.warn('Reservations fetch note:', e);
          return [];
        }),
      fetchAllInquiriesForAdmin()
        .then((res) => setInquiries(res || []))
        .catch((e) => {
          console.warn('Inquiries fetch note:', e);
          return [];
        }),
      fetchAllOffers()
        .then((res) => setOffers(res || []))
        .catch((e) => {
          console.warn('Offers fetch note:', e);
          return [];
        }),
    ])
      .catch((err) => console.warn('Admin initial fetch note:', err))
      .finally(() => setIsLoading(false));

    // Subscriptions
    const unsubOrders = subscribeToOrders((updatedOrders) => {
      setOrders(updatedOrders);
    });

    const unsubReservations = subscribeToReservations((updatedReservations) => {
      setReservations(updatedReservations);
    });

    const unsubOffers = subscribeToOffers((updatedOffers) => {
      setOffers(updatedOffers || []);
    });

    return () => {
      unsubOrders();
      unsubReservations();
      unsubOffers();
    };
  }, [isOpen]);

  const triggerToast = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const [ord, res, inq, off] = await Promise.all([
        fetchAllOrdersForAdmin(),
        fetchAllReservationsForAdmin(),
        fetchAllInquiriesForAdmin(),
        fetchAllOffers(),
      ]);
      setOrders(ord || []);
      setReservations(res || []);
      setInquiries(inq || []);
      setOffers(off || []);
      triggerToast('Refreshed data from Cloud Firestore');
    } catch {
      triggerToast('Error refreshing data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await logOutAdmin();
    onLoggedOut();
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderDetails['orderStatus']) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.orderId === orderId ? { ...o, orderStatus: newStatus } : o))
      );
      triggerToast(`Order #${orderId} marked as ${newStatus.toUpperCase()}`);
    } catch {
      triggerToast('Failed to update status in Firestore');
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm(`Are you sure you want to delete order #${orderId}?`)) return;
    try {
      await deleteOrderDoc(orderId);
      setOrders((prev) => prev.filter((o) => o.orderId !== orderId));
      triggerToast(`Order #${orderId} deleted`);
    } catch {
      triggerToast('Failed to delete order');
    }
  };

  const handleReservationStatus = async (bookingId: string, status: 'confirmed' | 'cancelled') => {
    try {
      await updateReservationStatus(bookingId, status);
      setReservations((prev) =>
        prev.map((r) => (r.bookingId === bookingId ? { ...r, status } : r))
      );
      triggerToast(`Booking #${bookingId} marked as ${status.toUpperCase()}`);
    } catch {
      triggerToast('Failed to update booking status');
    }
  };

  const handleDeleteReservation = async (bookingId: string) => {
    if (!window.confirm(`Delete reservation #${bookingId}?`)) return;
    try {
      await deleteReservationDoc(bookingId);
      setReservations((prev) => prev.filter((r) => r.bookingId !== bookingId));
      triggerToast(`Reservation #${bookingId} removed`);
    } catch {
      triggerToast('Failed to delete reservation');
    }
  };

  const handleDeleteInquiry = async (inquiryId: string) => {
    try {
      await deleteInquiryDoc(inquiryId);
      setInquiries((prev) => prev.filter((i) => i.id !== inquiryId));
      triggerToast('Message removed');
    } catch {
      triggerToast('Failed to delete message');
    }
  };

  // --- Offers Management Handlers ---
  const handlePhotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    setSelectedFileName(`${file.name} (${sizeInMb} MB)`);
    setPendingPhotoFile(file);
    setPendingVideoFile(null);

    // Instant local preview
    const localUrl = URL.createObjectURL(file);
    setMediaPreviewUrl(localUrl);

    // Prepare compressed photo in background for reliable fallback
    try {
      const base64Data = await compressImageFile(file, 1200, 0.85);
      setOfferForm((prev) => ({
        ...prev,
        mediaType: 'image',
        mediaUrl: base64Data,
      }));
    } catch {
      setOfferForm((prev) => ({
        ...prev,
        mediaType: 'image',
        mediaUrl: localUrl,
      }));
    }
    triggerToast('Photo attached! Click Publish to App to save.');
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    setPendingVideoFile(file);
    setPendingPhotoFile(null);
    setSelectedFileName(`${file.name} (${sizeInMb} MB)`);

    // Instant local video preview for player with NO loading wait
    const localUrl = URL.createObjectURL(file);
    setMediaPreviewUrl(localUrl);
    setOfferForm((prev) => ({
      ...prev,
      mediaType: 'video',
      mediaUrl: localUrl,
    }));
    triggerToast('Video attached from gallery! Click Publish to App to publish.');
  };

  const handleRemoveMedia = () => {
    setSelectedFileName('');
    setMediaPreviewUrl('');
    setPendingVideoFile(null);
    setPendingPhotoFile(null);
    setOfferForm((prev) => ({
      ...prev,
      mediaType: 'none',
      mediaUrl: '',
    }));
  };

  const handleOpenNewOfferForm = () => {
    setEditingOfferId(null);
    setSelectedFileName('');
    setMediaPreviewUrl('');
    setPendingVideoFile(null);
    setPendingPhotoFile(null);
    setIsPublishingOffer(false);
    setPublishStatusText('');
    setOfferForm({
      title: '',
      description: '',
      code: '',
      discountBadge: '20% OFF',
      mediaType: 'none',
      mediaUrl: '',
      validUntil: '',
      minOrder: '',
      isActive: true,
    });
    setIsOfferFormOpen(true);
  };

  const handleEditOffer = (offer: CafeOffer) => {
    setEditingOfferId(offer.id);
    setSelectedFileName(offer.mediaUrl ? 'Attached Media' : '');
    setMediaPreviewUrl(offer.mediaUrl || '');
    setPendingVideoFile(null);
    setPendingPhotoFile(null);
    setIsPublishingOffer(false);
    setPublishStatusText('');
    setOfferForm({
      title: offer.title,
      description: offer.description,
      code: offer.code || '',
      discountBadge: offer.discountBadge || '',
      mediaType: offer.mediaType || 'none',
      mediaUrl: offer.mediaUrl || '',
      validUntil: offer.validUntil || '',
      minOrder: offer.minOrder || '',
      isActive: offer.isActive,
    });
    setIsOfferFormOpen(true);
  };

  const handleSaveOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerForm.title.trim() || !offerForm.description.trim()) {
      triggerToast('Please fill in title and description');
      return;
    }

    setIsPublishingOffer(true);
    setPublishStatusText('Publishing to app...');

    const offerId = editingOfferId || `offer-${Date.now()}`;
    const newOffer: CafeOffer = {
      id: offerId,
      title: offerForm.title.trim(),
      description: offerForm.description.trim(),
      mediaType: offerForm.mediaType,
      isActive: offerForm.isActive,
      createdAt: new Date().toISOString(),
    };

    if (offerForm.code.trim()) newOffer.code = offerForm.code.trim().toUpperCase();
    if (offerForm.discountBadge.trim()) newOffer.discountBadge = offerForm.discountBadge.trim();
    if (offerForm.validUntil.trim()) newOffer.validUntil = offerForm.validUntil.trim();
    if (offerForm.minOrder.trim()) newOffer.minOrder = offerForm.minOrder.trim();

    try {
      // 1. Process Video if new video was chosen from device
      if (offerForm.mediaType === 'video' && pendingVideoFile) {
        setPublishStatusText('Uploading video...');

        let cloudUrl: string | null = null;
        try {
          cloudUrl = await uploadOfferMediaFile(pendingVideoFile, 'videos');
          newOffer.mediaUrl = cloudUrl;
        } catch (storageErr) {
          console.warn('Storage upload fallback to Firestore chunks:', storageErr);
        }

        // If Cloud Storage is not available, save directly in Firestore chunks
        if (!cloudUrl) {
          setPublishStatusText('Saving video to cloud database...');
          const chunkRes = await saveVideoInFirestoreChunks(offerId, pendingVideoFile);
          newOffer.videoChunksCount = chunkRes.chunksCount;
          newOffer.videoMimeType = chunkRes.mimeType;
          newOffer.videoFileName = chunkRes.fileName;
          newOffer.videoSizeMb = chunkRes.sizeMb;
          newOffer.mediaUrl = `firestore-chunks://${offerId}`;
        }

        // Cache local object URL in memory cache so current user immediately sees it
        if (mediaPreviewUrl) {
          cacheVideoBlobUrl(offerId, mediaPreviewUrl);
        }
      } else if (offerForm.mediaType === 'image' && pendingPhotoFile) {
        setPublishStatusText('Saving photo...');
        try {
          const cloudUrl = await uploadOfferMediaFile(pendingPhotoFile, 'photos');
          newOffer.mediaUrl = cloudUrl;
        } catch {
          // If storage fails, base64 data URL is preserved
          if (offerForm.mediaUrl) {
            newOffer.mediaUrl = offerForm.mediaUrl;
          }
        }
      } else if (offerForm.mediaUrl.trim()) {
        newOffer.mediaUrl = offerForm.mediaUrl.trim();
      }

      await saveOfferDoc(newOffer);
      setIsOfferFormOpen(false);
      setEditingOfferId(null);
      setPendingVideoFile(null);
      setPendingPhotoFile(null);
      triggerToast(
        editingOfferId
          ? 'Offer updated successfully!'
          : '🎉 Video promo published live to Offers page!'
      );
    } catch (err: any) {
      console.error('Save offer error:', err);
      triggerToast(err.message || 'Failed to save offer');
    } finally {
      setIsPublishingOffer(false);
      setPublishStatusText('');
    }
  };

  const handleToggleOfferActive = async (offer: CafeOffer) => {
    const updated = { ...offer, isActive: !offer.isActive };
    try {
      await saveOfferDoc(updated);
      triggerToast(
        updated.isActive
          ? `Offer "${offer.title}" is now LIVE on Offers section`
          : `Offer "${offer.title}" paused (Hidden from users)`
      );
    } catch {
      triggerToast('Failed to update status');
    }
  };

  const handleDeleteOffer = async (offerId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this offer/video?')) return;
    try {
      await deleteOfferDoc(offerId);
      triggerToast('Offer deleted from database');
    } catch {
      triggerToast('Failed to delete offer');
    }
  };

  if (!isOpen) return null;

  // Safe timestamp formatter avoiding Invalid Date on raw time strings or ISO dates
  const formatOrderTimestamp = (createdAt: string | undefined) => {
    if (!createdAt) return 'Just now';
    const trimmed = createdAt.trim();
    // If it's already a time string like "16:01" or "04:01 PM"
    if (/^\d{1,2}:\d{2}(\s*(AM|PM|am|pm))?$/.test(trimmed)) {
      return trimmed;
    }
    const d = new Date(trimmed);
    if (isNaN(d.getTime())) {
      return trimmed;
    }
    return `${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • ${d.toLocaleDateString([], { month: 'short', day: 'numeric' })}`;
  };

  // Filtered orders taking into account status filter (all / pending / completed) and search query
  const filteredOrders = orders.filter((o) => {
    if (orderFilter === 'pending' && o.orderStatus === 'completed') return false;
    if (orderFilter === 'completed' && o.orderStatus !== 'completed') return false;
    if (orderSearchQuery.trim()) {
      const q = orderSearchQuery.toLowerCase();
      const matchId = (o.orderId || '').toLowerCase().includes(q);
      const matchName = (o.customerName || '').toLowerCase().includes(q);
      const matchPhone = (o.customerPhone || '').toLowerCase().includes(q);
      const matchTable = (o.tableNumber || '').toLowerCase().includes(q);
      const matchItems = (o.items || []).some((item) => item.name.toLowerCase().includes(q));
      return matchId || matchName || matchPhone || matchTable || matchItems;
    }
    return true;
  });

  const orderCounts: Record<OrderFilter, number> = {
    all: orders.length,
    pending: orders.filter((o) => o.orderStatus !== 'completed').length,
    completed: orders.filter((o) => o.orderStatus === 'completed').length,
  };

  const totalRevenue = orders
    .filter((o) => o.paymentStatus === 'paid' || o.orderStatus === 'completed')
    .reduce((acc, curr) => acc + (curr.total || 0), 0);

  const activeOrdersCount = orders.filter((o) => o.orderStatus !== 'completed').length;

  const activeOffersCount = offers.filter((o) => o.isActive).length;

  return (
    <div
      id="admin-panel-fullpage"
      className="fixed inset-0 z-50 w-full h-full min-h-screen flex flex-col bg-[#0A0B0E] text-zinc-200 overflow-hidden animate-in fade-in duration-200"
    >
      {/* Top Gold Accent Bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-amber-600 via-[#C29B6B] to-amber-400 shrink-0" />

        {/* Top Navigation Bar - Responsive & Clean */}
        <div className="px-3.5 sm:px-6 py-3 bg-zinc-950 border-b border-white/10 flex items-center justify-between gap-3">
          {/* Brand & Admin Identity */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#C29B6B] flex items-center justify-center text-black font-bold shadow-md shrink-0">
              <ChefHat className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-semibold text-white tracking-wide truncate">
                  Admin Control Hub
                </h2>
                <button
                  id="admin-cafe-status-toggle-btn"
                  type="button"
                  onClick={() => toggleCafeStatus()}
                  disabled={isStatusLoading}
                  title={isCafeOpenStatus ? "Cafe is currently OPEN (Click to mark Closed on Website)" : "Cafe is currently CLOSED (Click to mark Open on Website)"}
                  className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold tracking-wider transition-all duration-300 border shadow-xs cursor-pointer select-none active:scale-95 shrink-0 ${
                    isCafeOpenStatus
                      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/60'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-750'
                  }`}
                >
                  {/* Slider Switch Track */}
                  <div
                    className={`w-7 h-4 rounded-full p-0.5 transition-colors duration-300 flex items-center ${
                      isCafeOpenStatus ? 'bg-emerald-500 justify-end' : 'bg-zinc-600 justify-start'
                    }`}
                  >
                    <span
                      className={`w-3 h-3 rounded-full bg-white shadow-xs transform transition-transform duration-300 ${
                        isCafeOpenStatus ? 'scale-100' : 'scale-90 bg-zinc-200'
                      }`}
                    />
                  </div>
                  <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-wider">
                    {isCafeOpenStatus ? 'OPEN' : 'CLOSED'}
                  </span>
                </button>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono truncate">
                {ADMIN_EMAIL}
              </p>
            </div>
          </div>

          {/* Quick Actions Cluster */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="h-8 sm:h-9 px-2.5 sm:px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-zinc-300 hover:text-white flex items-center gap-1.5 transition-all disabled:opacity-50 active:scale-95"
              title="Refresh database records"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#C29B6B]' : ''}`} />
              <span className="hidden sm:inline font-medium">Sync</span>
            </button>

            <button
              onClick={handleSignOut}
              className="h-8 sm:h-9 px-2.5 sm:px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-xs text-red-300 hover:text-red-200 flex items-center gap-1.5 transition-all active:scale-95"
              title="Sign out of admin session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-medium">Sign Out</span>
            </button>

            <button
              onClick={onClose}
              className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-all active:scale-95"
              title="Close dashboard"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Action Toast Notification */}
        {actionMessage && (
          <div className="bg-[#C29B6B] text-black px-4 py-1.5 text-xs font-semibold text-center shadow-md animate-in slide-in-from-top duration-150">
            {actionMessage}
          </div>
        )}

        {/* Modern Interactive KPI Summary Grid */}
        <div className="px-3.5 sm:px-6 py-2.5 sm:py-3 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 bg-zinc-950/60 border-b border-white/5">
          {/* 1. Total Sales Card */}
          <div className="p-2.5 sm:p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#C29B6B]/15 text-[#C29B6B] flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase tracking-wider text-zinc-400 block font-medium">Total Sales</span>
              <span className="text-xs sm:text-base font-semibold font-mono text-white truncate block">
                {formatPrice(totalRevenue)}
              </span>
            </div>
          </div>

          {/* 2. Total Orders Card (Interactive tab switcher) */}
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`p-2.5 sm:p-3 rounded-xl border flex items-center gap-2.5 sm:gap-3 text-left transition-all hover:border-[#C29B6B]/40 active:scale-[0.99] ${
              activeTab === 'orders'
                ? 'bg-[#C29B6B]/10 border-[#C29B6B]/50 ring-1 ring-[#C29B6B]/30'
                : 'bg-white/[0.02] border-white/5'
            }`}
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase tracking-wider text-zinc-400 block font-medium">Orders</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-base font-semibold font-mono text-white">
                  {orders.length}
                </span>
                {activeOrdersCount > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-medium">
                    {activeOrdersCount} new
                  </span>
                )}
              </div>
            </div>
          </button>

          {/* 3. Offers & Videos Card (Interactive tab switcher) */}
          <button
            type="button"
            onClick={() => setActiveTab('offers')}
            className={`p-2.5 sm:p-3 rounded-xl border flex items-center gap-2.5 sm:gap-3 text-left transition-all hover:border-[#C29B6B]/40 active:scale-[0.99] ${
              activeTab === 'offers'
                ? 'bg-[#C29B6B]/10 border-[#C29B6B]/50 ring-1 ring-[#C29B6B]/30'
                : 'bg-white/[0.02] border-white/5'
            }`}
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
              <Tag className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase tracking-wider text-zinc-400 block font-medium">Offers & Videos</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-base font-semibold font-mono text-white">
                  {offers.length}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-medium">
                  {activeOffersCount} live
                </span>
              </div>
            </div>
          </button>

          {/* 4. Table Bookings Card (Interactive tab switcher) */}
          <button
            type="button"
            onClick={() => setActiveTab('reservations')}
            className={`p-2.5 sm:p-3 rounded-xl border flex items-center gap-2.5 sm:gap-3 text-left transition-all hover:border-[#C29B6B]/40 active:scale-[0.99] ${
              activeTab === 'reservations'
                ? 'bg-[#C29B6B]/10 border-[#C29B6B]/50 ring-1 ring-[#C29B6B]/30'
                : 'bg-white/[0.02] border-white/5'
            }`}
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase tracking-wider text-zinc-400 block font-medium">Bookings</span>
              <span className="text-xs sm:text-base font-semibold font-mono text-white">
                {reservations.length}
              </span>
            </div>
          </button>
        </div>

        {/* Tab Navigation Segmented Bar - Modern & Responsive */}
        <div className="px-3.5 sm:px-6 py-2.5 bg-zinc-950 border-b border-white/10 flex items-center justify-start gap-2 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1.5 bg-zinc-900/90 p-1 rounded-xl border border-white/5 shrink-0">
            {/* Orders Tab */}
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'orders'
                  ? 'bg-[#C29B6B] text-black font-semibold shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
              <span>Orders</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                  activeTab === 'orders' ? 'bg-black/20 text-black' : 'bg-white/10 text-zinc-300'
                }`}
              >
                {orders.length}
              </span>
            </button>

            {/* Offers & Video Deals Tab */}
            <button
              onClick={() => setActiveTab('offers')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'offers'
                  ? 'bg-[#C29B6B] text-black font-semibold shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Tag className="w-3.5 h-3.5 shrink-0" />
              <span>Offers & Deals</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                  activeTab === 'offers' ? 'bg-black/20 text-black' : 'bg-white/10 text-zinc-300'
                }`}
              >
                {offers.length}
              </span>
            </button>

            {/* Table Bookings Tab */}
            <button
              onClick={() => setActiveTab('reservations')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'reservations'
                  ? 'bg-[#C29B6B] text-black font-semibold shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span>Bookings</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                  activeTab === 'reservations' ? 'bg-black/20 text-black' : 'bg-white/10 text-zinc-300'
                }`}
              >
                {reservations.length}
              </span>
            </button>
          </div>
        </div>

        {/* Tab Content Panels */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* ========================================================= */}
          {/* 1. OFFERS & VIDEO POSTS MANAGEMENT TAB (NEW SECTION)      */}
          {/* ========================================================= */}
          {activeTab === 'offers' && (
            <div className="space-y-6">
              {/* Header Banner & Action Button */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-zinc-900/60 border border-white/10">
                <div className="space-y-1">
                  <h3 className="text-sm sm:text-base font-medium text-white flex items-center gap-2">
                    <span>Offers & Video Deals Control Center</span>
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Offers, coupon codes, and cafe promo videos posted here appear live in the customer
                    Offers tab.
                  </p>
                </div>

                <button
                  onClick={handleOpenNewOfferForm}
                  className="px-4 py-2 rounded-xl bg-[#C29B6B] hover:bg-[#b08856] text-black font-semibold text-xs tracking-wider uppercase flex items-center gap-1.5 transition-all shadow-md shadow-[#C29B6B]/20 whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span>Post New Offer / Video</span>
                </button>
              </div>

              {/* Offer Creation / Edit Modal / Accordion */}
              {isOfferFormOpen && (
                <div className="p-5 rounded-2xl bg-zinc-950 border border-[#C29B6B]/40 shadow-xl space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Tag className="w-4 h-4 text-[#C29B6B]" />
                      <span>{editingOfferId ? 'Edit Offer / Video Post' : 'Create New Offer / Video Post'}</span>
                    </h4>
                    <button
                      onClick={() => {
                        setIsOfferFormOpen(false);
                        setEditingOfferId(null);
                      }}
                      className="text-zinc-400 hover:text-white p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveOffer} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Title */}
                      <div className="space-y-1">
                        <label className="text-xs text-zinc-300 font-medium">Offer Title *</label>
                        <input
                          type="text"
                          required
                          value={offerForm.title}
                          onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })}
                          placeholder="e.g. 20% Off Cold Brews & Cheesecakes"
                          className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#C29B6B]"
                        />
                      </div>

                      {/* Badge */}
                      <div className="space-y-1">
                        <label className="text-xs text-zinc-300 font-medium">Highlight Badge</label>
                        <input
                          type="text"
                          value={offerForm.discountBadge}
                          onChange={(e) => setOfferForm({ ...offerForm, discountBadge: e.target.value })}
                          placeholder="e.g. 20% OFF, WEEKEND DEAL, BUY 1 GET 1"
                          className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#C29B6B]"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-1">
                      <label className="text-xs text-zinc-300 font-medium">Description & Terms *</label>
                      <textarea
                        rows={3}
                        required
                        value={offerForm.description}
                        onChange={(e) => setOfferForm({ ...offerForm, description: e.target.value })}
                        placeholder="Detail what guests get, valid times, and terms of the offer..."
                        className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#C29B6B]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Coupon Code */}
                      <div className="space-y-1">
                        <label className="text-xs text-zinc-300 font-medium">Coupon Code (Optional)</label>
                        <input
                          type="text"
                          value={offerForm.code}
                          onChange={(e) => setOfferForm({ ...offerForm, code: e.target.value.toUpperCase() })}
                          placeholder="e.g. MONSOON20"
                          className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs font-mono text-[#C29B6B] placeholder:text-zinc-600 focus:outline-none focus:border-[#C29B6B]"
                        />
                      </div>

                      {/* Valid Until */}
                      <div className="space-y-1">
                        <label className="text-xs text-zinc-300 font-medium">Valid Until (Optional)</label>
                        <input
                          type="text"
                          value={offerForm.validUntil}
                          onChange={(e) => setOfferForm({ ...offerForm, validUntil: e.target.value })}
                          placeholder="e.g. 30 Sep 2026 / Every Sunday"
                          className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#C29B6B]"
                        />
                      </div>

                      {/* Minimum Order */}
                      <div className="space-y-1">
                        <label className="text-xs text-zinc-300 font-medium">Min. Order Requirement</label>
                        <input
                          type="text"
                          value={offerForm.minOrder}
                          onChange={(e) => setOfferForm({ ...offerForm, minOrder: e.target.value })}
                          placeholder="e.g. Min bill ₹299"
                          className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#C29B6B]"
                        />
                      </div>
                    </div>

                    {/* Direct Gallery Media Upload (Video or Photo) */}
                    <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/10 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div>
                          <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                            <span>Media Attachment (গ্যালারি থেকে ভিডিও বা ফটো)</span>
                          </label>
                          <p className="text-[11px] text-zinc-400">
                            Select directly from your phone gallery or files — no URL needed
                          </p>
                        </div>

                        {/* Media Selector Buttons */}
                        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-950 border border-white/10 self-start sm:self-auto">
                          <button
                            type="button"
                            onClick={() => {
                              if (offerForm.mediaType !== 'image') {
                                setOfferForm({ ...offerForm, mediaType: 'image' });
                              }
                            }}
                            className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                              offerForm.mediaType === 'image'
                                ? 'bg-[#C29B6B] text-black font-semibold shadow-sm'
                                : 'text-zinc-400 hover:text-white'
                            }`}
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span>Photo</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (offerForm.mediaType !== 'video') {
                                setOfferForm({ ...offerForm, mediaType: 'video' });
                              }
                            }}
                            className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                              offerForm.mediaType === 'video'
                                ? 'bg-[#C29B6B] text-black font-semibold shadow-sm'
                                : 'text-zinc-400 hover:text-white'
                            }`}
                          >
                            <Film className="w-3.5 h-3.5" />
                            <span>Video</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleRemoveMedia}
                            className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
                              offerForm.mediaType === 'none'
                                ? 'bg-zinc-800 text-white font-semibold'
                                : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                          >
                            <span>None</span>
                          </button>
                        </div>
                      </div>

                      {/* Photo Upload Mode */}
                      {offerForm.mediaType === 'image' && (
                        <div className="space-y-3 pt-1">
                          <input
                            type="file"
                            id="photo-upload-input"
                            accept="image/*"
                            onChange={handlePhotoFileChange}
                            className="hidden"
                          />

                          {/* Preview if attached */}
                          {mediaPreviewUrl || offerForm.mediaUrl ? (
                            <div className="relative rounded-xl overflow-hidden border border-[#C29B6B]/40 bg-zinc-950 group">
                              <img
                                src={mediaPreviewUrl || offerForm.mediaUrl}
                                alt="Selected preview"
                                className="w-full max-h-60 object-cover"
                              />
                              <div className="absolute top-2.5 right-2.5 flex items-center gap-2">
                                <label
                                  htmlFor="photo-upload-input"
                                  className="px-3 py-1.5 rounded-lg bg-black/85 hover:bg-black text-[#C29B6B] text-xs font-semibold border border-[#C29B6B]/50 cursor-pointer shadow-lg flex items-center gap-1.5 backdrop-blur-sm transition-all"
                                >
                                  <Camera className="w-3.5 h-3.5" />
                                  <span>Change Photo</span>
                                </label>
                                <button
                                  type="button"
                                  onClick={handleRemoveMedia}
                                  className="p-1.5 rounded-lg bg-red-600/90 hover:bg-red-600 text-white text-xs shadow-lg backdrop-blur-sm transition-all"
                                  title="Remove photo"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                              <div className="p-2.5 text-xs text-zinc-300 bg-zinc-900/95 border-t border-white/5 flex items-center justify-between">
                                <span className="truncate max-w-[240px] font-mono text-[11px]">
                                  {selectedFileName || 'Photo from Gallery'}
                                </span>
                                <span className="text-emerald-400 text-[11px] font-mono flex items-center gap-1 font-semibold">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                                </span>
                              </div>
                            </div>
                          ) : (
                            /* Big Clickable Gallery Upload Box */
                            <label
                              htmlFor="photo-upload-input"
                              className="flex flex-col items-center justify-center p-6 sm:p-8 border-2 border-dashed border-[#C29B6B]/40 hover:border-[#C29B6B] bg-zinc-950/70 hover:bg-zinc-900/60 rounded-xl cursor-pointer transition-all group text-center"
                            >
                              <div className="w-12 h-12 rounded-full bg-[#C29B6B]/15 group-hover:bg-[#C29B6B]/25 flex items-center justify-center text-[#C29B6B] mb-2.5 transition-all">
                                <ImageIcon className="w-6 h-6 stroke-[1.8]" />
                              </div>
                              <span className="text-xs sm:text-sm font-semibold text-white group-hover:text-[#C29B6B] transition-colors">
                                Choose Photo from Gallery / Device
                              </span>
                              <span className="text-[11px] text-zinc-400 mt-1">
                                মোবাইল গ্যালারি থেকে সরাসরি ছবি সিলেক্ট করুন (JPG, PNG, WEBP)
                              </span>
                            </label>
                          )}
                        </div>
                      )}

                      {/* Video Upload Mode */}
                      {offerForm.mediaType === 'video' && (
                        <div className="space-y-3 pt-1">
                          <input
                            type="file"
                            id="video-upload-input"
                            accept="video/*"
                            onChange={handleVideoFileChange}
                            className="hidden"
                          />

                          {/* Preview if attached */}
                          {mediaPreviewUrl || offerForm.mediaUrl ? (
                            <div className="relative rounded-xl overflow-hidden border border-[#C29B6B]/40 bg-black">
                              <video
                                src={mediaPreviewUrl || offerForm.mediaUrl}
                                controls
                                playsInline
                                className="w-full max-h-64 bg-black"
                              />
                              <div className="p-2.5 bg-zinc-900 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                                  <span className="text-xs text-zinc-200 font-mono truncate max-w-[200px] sm:max-w-[320px]">
                                    {selectedFileName || 'Video attached from Gallery'}
                                  </span>
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/30 shrink-0">
                                    Ready
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <label
                                    htmlFor="video-upload-input"
                                    className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[#C29B6B] text-xs font-semibold border border-white/10 cursor-pointer flex items-center gap-1.5 transition-all"
                                  >
                                    <Film className="w-3.5 h-3.5" />
                                    <span>Change Video</span>
                                  </label>
                                  <button
                                    type="button"
                                    onClick={handleRemoveMedia}
                                    className="p-1.5 rounded-lg bg-red-600/90 hover:bg-red-600 text-white text-xs transition-colors"
                                    title="Remove video"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            /* Big Clickable Gallery Upload Box for Video */
                            <label
                              htmlFor="video-upload-input"
                              className="flex flex-col items-center justify-center p-6 sm:p-8 border-2 border-dashed border-[#C29B6B]/40 hover:border-[#C29B6B] bg-zinc-950/70 hover:bg-zinc-900/60 rounded-xl cursor-pointer transition-all group text-center"
                            >
                              <div className="w-12 h-12 rounded-full bg-[#C29B6B]/15 group-hover:bg-[#C29B6B]/25 flex items-center justify-center text-[#C29B6B] mb-2.5 transition-all">
                                <Film className="w-6 h-6 stroke-[1.8]" />
                              </div>
                              <span className="text-xs sm:text-sm font-semibold text-white group-hover:text-[#C29B6B] transition-colors">
                                Choose Video from Gallery / Device
                              </span>
                              <span className="text-[11px] text-zinc-400 mt-1">
                                মোবাইল গ্যালারি থেকে সরাসরি ভিডিও ফাইল আপলোড করুন (MP4, MOV, WebM)
                              </span>
                            </label>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Live Toggle & Actions */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-white/10">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={offerForm.isActive}
                          onChange={(e) => setOfferForm({ ...offerForm, isActive: e.target.checked })}
                          className="w-4 h-4 rounded text-[#C29B6B] accent-[#C29B6B] bg-zinc-900 border-white/20"
                        />
                        <span className="text-xs text-zinc-300 font-medium">
                          Active & Visible on Customer Offers Page
                        </span>
                      </label>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={isPublishingOffer}
                          onClick={() => {
                            setIsOfferFormOpen(false);
                            setEditingOfferId(null);
                          }}
                          className="px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isPublishingOffer}
                          className={`px-5 py-2.5 rounded-xl font-semibold text-xs tracking-wider uppercase flex items-center gap-2 transition-all shadow-md ${
                            isPublishingOffer
                              ? 'bg-[#C29B6B]/80 text-black cursor-wait'
                              : 'bg-[#C29B6B] hover:bg-[#b08856] text-black shadow-[#C29B6B]/20 active:scale-95'
                          }`}
                        >
                          {isPublishingOffer ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin text-black" />
                              <span>{publishStatusText || 'Publishing...'}</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-4 h-4" />
                              <span>{editingOfferId ? 'Update Offer' : 'Publish to App'}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {/* Offers List */}
              {offers.length === 0 ? (
                <div className="text-center py-16 px-4 rounded-2xl bg-zinc-950/40 border border-white/5 space-y-3">
                  <Tag className="w-10 h-10 text-zinc-600 mx-auto" />
                  <h4 className="text-sm font-medium text-white">No Offers or Video Posts Created Yet</h4>
                  <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                    Because there are currently no offers posted, the customer-facing Offers tab
                    displays a clean empty notice. Tap &quot;Post New Offer / Video&quot; above to create
                    your first promotional deal or video post!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {offers.map((offer) => (
                    <div
                      key={offer.id}
                      className={`p-4 rounded-xl bg-zinc-900/60 border transition-all flex flex-col justify-between gap-3 ${
                        offer.isActive
                          ? 'border-[#C29B6B]/40 shadow-md shadow-[#C29B6B]/5'
                          : 'border-white/10 opacity-70'
                      }`}
                    >
                      <div className="space-y-2">
                        {/* Top info badge & status toggle */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                                offer.isActive
                                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                              }`}
                            >
                              {offer.isActive ? '● Live on App' : '○ Paused / Hidden'}
                            </span>

                            {offer.discountBadge && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#C29B6B]/20 text-[#C29B6B] border border-[#C29B6B]/30 font-bold">
                                {offer.discountBadge}
                              </span>
                            )}
                          </div>

                          <span className="text-[10px] text-zinc-500 font-mono">
                            {offer.mediaType === 'video'
                              ? '🎥 Video Promo'
                              : offer.mediaType === 'image'
                              ? '🖼️ Image Banner'
                              : '📄 Text Voucher'}
                          </span>
                        </div>

                        <h4 className="text-sm font-semibold text-white leading-snug">{offer.title}</h4>
                        <p className="text-xs text-zinc-400 line-clamp-2">{offer.description}</p>

                        {/* Extra metadata */}
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-400 font-mono pt-1">
                          {offer.code && (
                            <span className="px-2 py-0.5 rounded bg-black/60 border border-white/10 text-[#C29B6B] font-bold">
                              Code: {offer.code}
                            </span>
                          )}
                          {offer.validUntil && <span>Valid: {offer.validUntil}</span>}
                          {offer.minOrder && <span>({offer.minOrder})</span>}
                        </div>

                        {/* Media Preview in Admin Card */}
                        {(offer.mediaUrl || offer.videoChunksCount) && (
                          <div className="mt-2 rounded-lg overflow-hidden border border-white/10 bg-black max-h-36 relative">
                            {offer.mediaType === 'video' ? (
                              <AdminCardVideoPlayer offer={offer} />
                            ) : (
                              <img
                                src={offer.mediaUrl}
                                alt={offer.title}
                                className="w-full max-h-36 object-cover"
                              />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Bottom action buttons */}
                      <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleToggleOfferActive(offer)}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                            offer.isActive
                              ? 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300'
                              : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300'
                          }`}
                        >
                          {offer.isActive ? 'Hide from Users' : 'Make Live'}
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleEditOffer(offer)}
                            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-zinc-300 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteOffer(offer.id)}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                            title="Delete offer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* 2. ORDERS TAB                                             */}
          {/* ========================================================= */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {/* Responsive Toolbar: Status Filter Chips & Search Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-zinc-950/80 border border-white/5">
                {/* Filter Pills with Live Counter Badges */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                  {(
                    [
                      { id: 'all', label: 'All Orders' },
                      { id: 'pending', label: 'Pending' },
                      { id: 'completed', label: 'Completed' },
                    ] as const
                  ).map((f) => {
                    const isSelected = orderFilter === f.id;
                    return (
                      <button
                        key={f.id}
                        onClick={() => setOrderFilter(f.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs capitalize whitespace-nowrap flex items-center gap-1.5 transition-all ${
                          isSelected
                            ? 'bg-[#C29B6B] text-black font-semibold shadow-md'
                            : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <span>{f.label}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                            isSelected ? 'bg-black/20 text-black' : 'bg-white/10 text-zinc-300'
                          }`}
                        >
                          {orderCounts[f.id]}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-64 shrink-0">
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search by ID, name, table..."
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#C29B6B] transition-colors"
                  />
                  {orderSearchQuery && (
                    <button
                      onClick={() => setOrderSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-0.5"
                      title="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Orders List / Empty State */}
              {filteredOrders.length === 0 ? (
                <div className="text-center py-16 px-4 rounded-2xl bg-zinc-950/40 border border-dashed border-white/10 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 text-zinc-500 flex items-center justify-center mx-auto">
                    <ShoppingBag className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white">
                      {orderSearchQuery
                        ? `No orders matching "${orderSearchQuery}"`
                        : `No ${orderFilter === 'all' ? '' : orderFilter} orders found`}
                    </h4>
                    <p className="text-xs text-zinc-400 font-light mt-1 max-w-sm mx-auto">
                      {orderSearchQuery
                        ? 'Try searching with a different order ID, customer name, phone number, or menu item.'
                        : 'When customers place orders via the website or counter, they sync here in real-time.'}
                    </p>
                  </div>
                  {orderSearchQuery && (
                    <button
                      onClick={() => setOrderSearchQuery('')}
                      className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-zinc-200 font-medium transition-colors"
                    >
                      Clear Search Filter
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
                  {filteredOrders.map((order) => {
                    const isCompleted = order.orderStatus === 'completed';

                    return (
                      <div
                        key={order.orderId}
                        className="p-4 rounded-2xl bg-zinc-900/70 border border-white/10 hover:border-white/20 transition-all space-y-3.5"
                      >
                        {/* Header: Order ID, Dining Type, Timestamp, Status Badge */}
                        <div className="flex items-start justify-between gap-2 border-b border-white/5 pb-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-sm font-bold text-white">
                                #{order.orderId}
                              </span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 text-zinc-300 border border-white/10 capitalize font-medium">
                                {order.orderType}
                                {order.tableNumber ? ` • Table ${order.tableNumber}` : ''}
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-400 mt-1 flex items-center gap-1.5">
                              <Clock className="w-3 h-3 text-[#C29B6B]" />
                              <span>{formatOrderTimestamp(order.createdAt)}</span>
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-medium uppercase tracking-wider border ${
                                isCompleted
                                  ? 'bg-zinc-800 text-zinc-400 border-zinc-700'
                                  : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                              }`}
                            >
                              {isCompleted ? 'Completed' : 'Pending'}
                            </span>
                            <button
                              onClick={() => handleDeleteOrder(order.orderId)}
                              className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors"
                              title="Delete Order"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Customer Info Card */}
                        <div className="grid grid-cols-2 gap-2 text-xs bg-black/40 p-2.5 rounded-xl border border-white/5">
                          <div>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Customer</p>
                            <p className="font-medium text-white truncate mt-0.5">{order.customerName}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Phone</p>
                            <a
                              href={`tel:${order.customerPhone}`}
                              className="font-medium text-[#C29B6B] hover:underline flex items-center gap-1 mt-0.5"
                            >
                              <Phone className="w-3 h-3 shrink-0" />
                              <span className="truncate">{order.customerPhone}</span>
                            </a>
                          </div>
                          {order.customerAddress && (
                            <div className="col-span-2 pt-1.5 border-t border-white/5">
                              <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Delivery Address</p>
                              <p className="text-zinc-300 text-[11px] leading-tight flex items-start gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 text-[#C29B6B] shrink-0 mt-0.5" />
                                <span>{order.customerAddress}</span>
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Ordered Items List */}
                        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 scrollbar-thin">
                          {order.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between text-xs py-1 border-b border-white/5 last:border-0"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="w-5 h-5 rounded-md bg-[#C29B6B]/15 text-[#C29B6B] font-mono text-[10px] flex items-center justify-center font-bold shrink-0">
                                  {item.quantity}x
                                </span>
                                <div className="min-w-0">
                                  <p className="font-medium text-zinc-200 truncate">{item.name}</p>
                                  {item.selectedSize && (
                                    <p className="text-[10px] text-zinc-500">Size: {item.selectedSize}</p>
                                  )}
                                </div>
                              </div>
                              <span className="font-mono text-zinc-300 shrink-0 font-medium">
                                {formatPrice(item.unitPrice * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Total & Payment Details */}
                        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                          <div>
                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-medium">Payment</span>
                            <span className="font-mono font-medium text-zinc-300 capitalize flex items-center gap-1 mt-0.5">
                              <span>{order.paymentMethod}</span>
                              <span>•</span>
                              <span
                                className={
                                  order.paymentStatus === 'paid' ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'
                                }
                              >
                                {order.paymentStatus}
                              </span>
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-medium">Total Bill</span>
                            <span className="font-mono text-sm sm:text-base font-bold text-[#C29B6B]">
                              {formatPrice(order.total)}
                            </span>
                          </div>
                        </div>

                        {/* Single Action Button: Only Completed as requested */}
                        <div className="pt-3 border-t border-white/5">
                          {!isCompleted ? (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(order.orderId, 'completed')}
                              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 bg-[#C29B6B] hover:bg-[#b18a5a] text-black transition-all shadow-md active:scale-[0.99]"
                            >
                              <Check className="w-4 h-4 stroke-[2.5]" />
                              <span>Completed</span>
                            </button>
                          ) : (
                            <div className="w-full py-2.5 px-3 rounded-xl bg-zinc-800/60 border border-zinc-700/60 text-zinc-400 text-xs font-medium flex items-center justify-center gap-2">
                              <Check className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
                              <span className="text-zinc-200 font-semibold tracking-wide">Completed</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* 3. TABLE RESERVATIONS TAB                                 */}
          {/* ========================================================= */}
          {activeTab === 'reservations' && (
            <div>
              {reservations.length === 0 ? (
                <div className="text-center py-16 space-y-2">
                  <Calendar className="w-10 h-10 text-zinc-600 mx-auto" />
                  <p className="text-sm text-zinc-400 font-light">No table bookings recorded yet.</p>
                  <p className="text-xs text-zinc-600">
                    When guests reserve tables online, requests will appear here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {reservations.map((res) => (
                    <div
                      key={res.bookingId}
                      className="p-4 rounded-xl bg-zinc-900/60 border border-white/10 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-medium text-white">{res.name}</h4>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-zinc-300">
                              #{res.bookingId}
                            </span>
                          </div>
                          <p className="text-xs text-[#C29B6B] mt-0.5 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            <a href={`tel:${res.phone}`} className="hover:underline">
                              {res.phone}
                            </a>
                          </p>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono ${
                            res.status === 'confirmed'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-red-500/15 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {res.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs bg-black/30 p-2.5 rounded-lg border border-white/5">
                        <div>
                          <p className="text-[10px] text-zinc-500">Date</p>
                          <p className="font-mono text-zinc-200">{res.date}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-zinc-500">Time</p>
                          <p className="font-mono text-zinc-200">{res.timeSlot}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-zinc-500">Guests</p>
                          <p className="font-mono text-zinc-200">{res.guests} Guests</p>
                        </div>
                      </div>

                      {res.specialRequests && (
                        <p className="text-xs text-zinc-400 bg-white/[0.02] p-2 rounded border border-white/5">
                          <span className="text-zinc-500">Note:</span> {res.specialRequests}
                        </p>
                      )}

                      <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleReservationStatus(res.bookingId, 'confirmed')}
                            className="px-2.5 py-1 rounded bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-xs transition-colors"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => handleReservationStatus(res.bookingId, 'cancelled')}
                            className="px-2.5 py-1 rounded bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs transition-colors"
                          >
                            Cancel
                          </button>
                        </div>

                        <button
                          onClick={() => handleDeleteReservation(res.bookingId)}
                          className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };
