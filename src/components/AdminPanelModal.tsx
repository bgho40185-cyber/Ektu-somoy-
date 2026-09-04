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
  Sparkles,
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

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoggedOut: () => void;
}

type AdminTab = 'orders' | 'offers' | 'reservations' | 'inquiries';
type OrderFilter = 'all' | 'received' | 'preparing' | 'ready' | 'completed';

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
  const [activeTab, setActiveTab] = useState<AdminTab>('orders');
  const [orderFilter, setOrderFilter] = useState<OrderFilter>('all');
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

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    if (orderFilter === 'all') return true;
    return o.orderStatus === orderFilter;
  });

  const totalRevenue = orders
    .filter((o) => o.paymentStatus === 'paid' || o.orderStatus === 'completed')
    .reduce((acc, curr) => acc + (curr.total || 0), 0);

  const activeOrdersCount = orders.filter(
    (o) => o.orderStatus === 'received' || o.orderStatus === 'preparing'
  ).length;

  const activeOffersCount = offers.filter((o) => o.isActive).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        id="admin-panel-modal"
        className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-[#0A0B0E] border border-white/10 rounded-2xl shadow-2xl overflow-hidden text-zinc-200"
      >
        {/* Top Gold Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-600 via-[#C29B6B] to-amber-400" />

        {/* Top Navigation Bar */}
        <div className="px-4 sm:px-6 py-3.5 bg-zinc-950/80 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#C29B6B] flex items-center justify-center text-black font-bold text-sm shadow-md">
              <ChefHat className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-medium tracking-wide text-white">
                  Ektu Shomoy Admin Panel
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Sync
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono">Admin: {ADMIN_EMAIL}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors disabled:opacity-50"
              title="Refresh Firestore records"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#C29B6B]' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={handleSignOut}
              className="px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-xs text-red-300 hover:text-red-200 flex items-center gap-1.5 transition-colors"
              title="Log out of Admin Portal"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
              title="Close Admin Window"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Toast */}
        {actionMessage && (
          <div className="bg-[#C29B6B] text-black px-4 py-1.5 text-xs font-semibold text-center shadow-md animate-in slide-in-from-top duration-150">
            {actionMessage}
          </div>
        )}

        {/* Metrics Row */}
        <div className="px-4 sm:px-6 py-3.5 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 bg-zinc-900/40 border-b border-white/5">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#C29B6B]/15 text-[#C29B6B] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-zinc-400">Total Sales</p>
              <p className="text-sm sm:text-base font-light font-mono text-white">
                {formatPrice(totalRevenue)}
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-zinc-400">Total Orders</p>
              <p className="text-sm sm:text-base font-light font-mono text-white">
                {orders.length}
                {activeOrdersCount > 0 && (
                  <span className="ml-1 text-xs text-amber-400 font-sans">
                    ({activeOrdersCount} pending)
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-zinc-400">Offers & Videos</p>
              <p className="text-sm sm:text-base font-light font-mono text-white">
                {offers.length}
                <span className="ml-1 text-xs text-emerald-400 font-sans">
                  ({activeOffersCount} live)
                </span>
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-zinc-400">Table Bookings</p>
              <p className="text-sm sm:text-base font-light font-mono text-white">
                {reservations.length}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 sm:px-6 pt-3 flex items-center justify-between border-b border-white/10 overflow-x-auto">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3 py-2 text-xs font-medium border-b-2 flex items-center gap-1.5 transition-all ${
                activeTab === 'orders'
                  ? 'border-[#C29B6B] text-[#C29B6B]'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Orders ({orders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('offers')}
              className={`px-3 py-2 text-xs font-medium border-b-2 flex items-center gap-1.5 transition-all ${
                activeTab === 'offers'
                  ? 'border-[#C29B6B] text-[#C29B6B]'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Offers & Video Deals ({offers.length})</span>
              {activeOffersCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-[#C29B6B] text-black font-bold">
                  {activeOffersCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('reservations')}
              className={`px-3 py-2 text-xs font-medium border-b-2 flex items-center gap-1.5 transition-all ${
                activeTab === 'reservations'
                  ? 'border-[#C29B6B] text-[#C29B6B]'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Table Bookings ({reservations.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('inquiries')}
              className={`px-3 py-2 text-xs font-medium border-b-2 flex items-center gap-1.5 transition-all ${
                activeTab === 'inquiries'
                  ? 'border-[#C29B6B] text-[#C29B6B]'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Messages ({inquiries.length})</span>
            </button>
          </div>

          {/* Sub-filter for orders */}
          {activeTab === 'orders' && (
            <div className="hidden sm:flex items-center gap-1 pb-1 text-[11px]">
              {(['all', 'received', 'preparing', 'ready', 'completed'] as OrderFilter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setOrderFilter(f)}
                  className={`px-2 py-1 rounded-md capitalize transition-colors ${
                    orderFilter === f
                      ? 'bg-[#C29B6B] text-black font-semibold'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          )}
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
                    <Sparkles className="w-4 h-4 text-[#C29B6B]" />
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
                            <Sparkles className="w-3.5 h-3.5 text-[#C29B6B]" />
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
            <div>
              {/* Mobile Filter */}
              <div className="sm:hidden flex items-center gap-1 mb-3 overflow-x-auto pb-1 text-xs">
                {(['all', 'received', 'preparing', 'ready', 'completed'] as OrderFilter[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setOrderFilter(f)}
                    className={`px-2.5 py-1 rounded-md capitalize whitespace-nowrap ${
                      orderFilter === f
                        ? 'bg-[#C29B6B] text-black font-semibold'
                        : 'bg-white/5 text-zinc-400'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {filteredOrders.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <ShoppingBag className="w-10 h-10 text-zinc-600 mx-auto" />
                  <p className="text-sm text-zinc-400 font-light">
                    No orders match the filter &quot;{orderFilter}&quot;.
                  </p>
                  <p className="text-xs text-zinc-600">
                    When customers place orders from the menu, they appear here live.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
                  {filteredOrders.map((order) => {
                    const statusColors = {
                      received: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
                      preparing: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
                      ready: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
                      completed: 'bg-zinc-800 text-zinc-400 border-zinc-700',
                    };

                    return (
                      <div
                        key={order.orderId}
                        className="p-4 rounded-xl bg-zinc-900/60 border border-white/10 hover:border-white/20 transition-all space-y-3"
                      >
                        {/* Top: Order Id, Date, Dining Type, Status */}
                        <div className="flex items-start justify-between gap-2 border-b border-white/5 pb-2.5">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-semibold text-white">
                                #{order.orderId}
                              </span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-zinc-300 border border-white/10 capitalize">
                                {order.orderType}
                                {order.tableNumber ? ` • Table ${order.tableNumber}` : ''}
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-400 mt-0.5 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-[#C29B6B]" />
                              <span>
                                {new Date(order.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                                {' • '}
                                {new Date(order.createdAt).toLocaleDateString([], {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-medium uppercase tracking-wider border ${
                                statusColors[order.orderStatus]
                              }`}
                            >
                              {order.orderStatus}
                            </span>
                            <button
                              onClick={() => handleDeleteOrder(order.orderId)}
                              className="p-1 rounded hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors"
                              title="Delete Order"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Customer Info */}
                        <div className="grid grid-cols-2 gap-2 text-xs bg-black/30 p-2.5 rounded-lg border border-white/5">
                          <div>
                            <p className="text-[10px] text-zinc-500 uppercase">Customer</p>
                            <p className="font-medium text-white truncate">{order.customerName}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-zinc-500 uppercase">Phone</p>
                            <a
                              href={`tel:${order.customerPhone}`}
                              className="font-medium text-[#C29B6B] hover:underline flex items-center gap-1"
                            >
                              <Phone className="w-3 h-3" />
                              {order.customerPhone}
                            </a>
                          </div>
                          {order.customerAddress && (
                            <div className="col-span-2 pt-1 border-t border-white/5">
                              <p className="text-[10px] text-zinc-500 uppercase">Delivery Address</p>
                              <p className="text-zinc-300 text-[11px] leading-tight flex items-start gap-1">
                                <MapPin className="w-3 h-3 text-[#C29B6B] shrink-0 mt-0.5" />
                                {order.customerAddress}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Ordered Items List */}
                        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                          {order.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between text-xs py-1 border-b border-white/5 last:border-0"
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-md bg-white/5 text-zinc-300 font-mono text-[10px] flex items-center justify-center font-bold">
                                  {item.quantity}x
                                </span>
                                <div>
                                  <p className="font-medium text-zinc-200">{item.name}</p>
                                  {item.selectedSize && (
                                    <p className="text-[10px] text-zinc-500">Size: {item.selectedSize}</p>
                                  )}
                                </div>
                              </div>
                              <span className="font-mono text-zinc-400">
                                {formatPrice(item.unitPrice * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Total & Payment Details */}
                        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                          <div>
                            <span className="text-[10px] text-zinc-500 uppercase block">Payment</span>
                            <span className="font-mono font-medium text-zinc-300 uppercase">
                              {order.paymentMethod} •{' '}
                              <span
                                className={
                                  order.paymentStatus === 'paid' ? 'text-emerald-400' : 'text-amber-400'
                                }
                              >
                                {order.paymentStatus}
                              </span>
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] text-zinc-500 uppercase block">Total Bill</span>
                            <span className="font-mono text-sm font-semibold text-[#C29B6B]">
                              {formatPrice(order.total)}
                            </span>
                          </div>
                        </div>

                        {/* Order Status Action Buttons */}
                        <div className="pt-2 flex flex-wrap items-center gap-1.5 border-t border-white/5">
                          <span className="text-[10px] text-zinc-500 uppercase font-mono mr-1">
                            Set Status:
                          </span>
                          {(['received', 'preparing', 'ready', 'completed'] as OrderDetails['orderStatus'][]).map(
                            (st) => (
                              <button
                                key={st}
                                onClick={() => handleStatusChange(order.orderId, st)}
                                className={`px-2.5 py-1 rounded text-[11px] font-medium capitalize transition-all ${
                                  order.orderStatus === st
                                    ? 'bg-[#C29B6B] text-black font-semibold'
                                    : 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white'
                                }`}
                              >
                                {st}
                              </button>
                            )
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

          {/* ========================================================= */}
          {/* 4. CONTACT INQUIRIES TAB                                  */}
          {/* ========================================================= */}
          {activeTab === 'inquiries' && (
            <div>
              {inquiries.length === 0 ? (
                <div className="text-center py-16 space-y-2">
                  <MessageSquare className="w-10 h-10 text-zinc-600 mx-auto" />
                  <p className="text-sm text-zinc-400 font-light">No guest inquiries yet.</p>
                  <p className="text-xs text-zinc-600">
                    Messages submitted from the Contact page will sync here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {inquiries.map((inq) => (
                    <div
                      key={inq.id}
                      className="p-4 rounded-xl bg-zinc-900/60 border border-white/10 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-medium text-white">{inq.name}</h4>
                          <span className="text-[10px] font-mono text-zinc-500">
                            {new Date(inq.createdAt || '').toLocaleString('en-IN', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 flex items-center gap-2">
                          <span>Phone: {inq.phone}</span>
                          {inq.email && <span>• Email: {inq.email}</span>}
                          {inq.subject && <span>• Topic: {inq.subject}</span>}
                        </p>
                        <p className="text-xs text-zinc-200 bg-black/40 p-3 rounded-lg border border-white/5 whitespace-pre-wrap">
                          {inq.message}
                        </p>
                      </div>

                      <button
                        onClick={() => inq.id && handleDeleteInquiry(inq.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs flex items-center gap-1 transition-colors self-end sm:self-start shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
