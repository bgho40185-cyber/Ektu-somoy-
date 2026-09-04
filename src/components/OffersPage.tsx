import React, { useState, useEffect } from 'react';
import {
  Tag,
  Sparkles,
  Copy,
  Check,
  Clock,
  Coffee,
  ArrowRight,
  Gift,
  Percent,
  Play,
  Video,
  Film,
  AlertCircle,
  Share2,
  Loader2,
} from 'lucide-react';
import { CafeOffer } from '../types';
import { subscribeToOffers, fetchAllOffers, loadVideoFromFirestoreChunks } from '../firebase';

interface OffersPageProps {
  onApplyCoupon: (code: string) => void;
  onExploreMenu: () => void;
  onOpenCart: () => void;
}

// Dedicated Video Player Banner for offers supporting direct streaming, YouTube, Vimeo, and chunked cloud videos
const OffersVideoBanner: React.FC<{ offer: CafeOffer }> = ({ offer }) => {
  const [videoSrc, setVideoSrc] = useState<string>(() => {
    if (offer.mediaUrl && !offer.mediaUrl.startsWith('firestore-chunks://')) {
      return offer.mediaUrl;
    }
    return '';
  });
  const [isLoading, setIsLoading] = useState<boolean>(!videoSrc && !!offer.videoChunksCount);

  useEffect(() => {
    if (videoSrc) return;
    if (offer.videoChunksCount) {
      let isMounted = true;
      setIsLoading(true);
      loadVideoFromFirestoreChunks(offer.id, offer.videoChunksCount, offer.videoMimeType)
        .then((url) => {
          if (isMounted) {
            setVideoSrc(url);
            setIsLoading(false);
          }
        })
        .catch((err) => {
          console.error('Failed to load video chunks:', err);
          if (isMounted) setIsLoading(false);
        });
      return () => {
        isMounted = false;
      };
    }
  }, [offer.id, offer.videoChunksCount, offer.videoMimeType, videoSrc]);

  const isYouTubeOrVimeo =
    videoSrc &&
    (videoSrc.includes('youtube.com') ||
      videoSrc.includes('youtu.be') ||
      videoSrc.includes('vimeo.com'));
  const embedUrl = isYouTubeOrVimeo ? getEmbedVideoUrl(videoSrc) : null;

  if (isLoading) {
    return (
      <div className="relative aspect-video w-full bg-black flex flex-col items-center justify-center gap-2 text-zinc-400 border-b border-white/10">
        <Loader2 className="w-6 h-6 animate-spin text-[#C29B6B]" />
        <span className="text-xs font-mono text-zinc-300">Loading promo video...</span>
      </div>
    );
  }

  if (embedUrl) {
    return (
      <div className="relative aspect-video w-full bg-black overflow-hidden border-b border-white/10">
        <iframe
          src={embedUrl}
          title={offer.title}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  if (videoSrc) {
    return (
      <div className="relative aspect-video w-full bg-black overflow-hidden border-b border-white/10">
        <video
          src={videoSrc}
          controls
          playsInline
          preload="metadata"
          className="w-full h-full object-contain bg-black"
          poster="/icon.png"
        />
      </div>
    );
  }

  return null;
};

// Helper to convert regular YouTube/Shorts URLs to embed URLs
function getEmbedVideoUrl(url?: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // YouTube standard watch
  const ytMatch = trimmed.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=0&rel=0`;
  }

  // Vimeo
  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  return trimmed;
}

export const OffersPage: React.FC<OffersPageProps> = ({
  onApplyCoupon,
  onExploreMenu,
  onOpenCart,
}) => {
  const [offers, setOffers] = useState<CafeOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    // Real-time updates from Firestore (handles initial data + updates seamlessly)
    const unsubscribe = subscribeToOffers((updated) => {
      setOffers(updated || []);
      setIsLoading(false);
    });

    const fallbackTimer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => {
      clearTimeout(fallbackTimer);
      unsubscribe();
    };
  }, []);

  const activeOffers = offers.filter((o) => o.isActive);

  const handleCopy = (code?: string) => {
    if (!code) return;
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    onApplyCoupon(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2500);
  };

  return (
    <section id="offers-page" className="py-8 sm:py-14 max-w-7xl mx-auto px-4 sm:px-8 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2 sm:space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900/60 border border-white/10 text-[10px] sm:text-xs font-semibold text-[#C29B6B] uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5 text-[#C29B6B]" />
          <span>Exclusive Cafe Privileges</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-light tracking-tight text-[#E5E7EB]">
          Offers & <span className="text-[#C29B6B] italic font-normal">Privileges</span>
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed">
          Unlock artisan rewards, limited seasonal coupons, and curated cafe specials designed to make your time at Ektu Shomoy even sweeter.
        </p>
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#C29B6B] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-zinc-400 font-mono">Checking active offers & videos...</p>
        </div>
      ) : activeOffers.length === 0 ? (
        /* Empty State: Shows strictly nothing when admin hasn't posted any active offer/video */
        <div className="max-w-xl mx-auto py-16 px-6 text-center rounded-3xl bg-zinc-950/40 border border-white/5 space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-[#C29B6B]/10 border border-[#C29B6B]/20 text-[#C29B6B] flex items-center justify-center mx-auto shadow-inner">
            <Tag className="w-8 h-8 stroke-[1.5]" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg sm:text-xl font-medium text-white">
              No Active Offers Right Now
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed">
              We currently don&apos;t have any active offers or video promos running. Please check back soon as our team regularly posts exclusive discount drops, seasonal brews, and special videos!
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onExploreMenu}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#C29B6B] hover:bg-[#b08856] text-black font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#C29B6B]/10"
            >
              <Coffee className="w-4 h-4" />
              <span>Explore Cafe Menu</span>
            </button>
            <button
              onClick={onOpenCart}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-300 font-medium text-xs tracking-wider uppercase transition-colors"
            >
              <span>View Cart</span>
            </button>
          </div>
        </div>
      ) : (
        /* Dynamic Live Offers posted by Admin */
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-medium text-[#E5E7EB] flex items-center gap-2">
              <Percent className="w-4 h-4 text-[#C29B6B]" />
              <span>Active Cafe Offers & Videos ({activeOffers.length})</span>
            </h2>
            <span className="text-[11px] text-zinc-500 font-mono">Live From Admin</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeOffers.map((offer) => {
              const isCopied = offer.code && copiedCode === offer.code;
              const isYouTubeOrVimeo =
                offer.mediaUrl &&
                (offer.mediaUrl.includes('youtube.com') ||
                  offer.mediaUrl.includes('youtu.be') ||
                  offer.mediaUrl.includes('vimeo.com'));
              const embedUrl =
                offer.mediaType === 'video' && isYouTubeOrVimeo
                  ? getEmbedVideoUrl(offer.mediaUrl)
                  : null;
              const isDirectVideo =
                offer.mediaType === 'video' &&
                offer.mediaUrl &&
                !isYouTubeOrVimeo;

              return (
                <div
                  key={offer.id}
                  className="rounded-2xl bg-[#0E1015] border border-white/10 hover:border-[#C29B6B]/50 transition-all overflow-hidden flex flex-col justify-between group shadow-xl"
                >
                  {/* Media Banner if provided */}
                  {offer.mediaType === 'video' && offer.mediaUrl && (
                    <div className="relative aspect-video w-full bg-black overflow-hidden border-b border-white/10">
                      {isDirectVideo ? (
                        <video
                          src={offer.mediaUrl}
                          controls
                          playsInline
                          preload="metadata"
                          className="w-full h-full object-contain bg-black"
                          poster="/icon.png"
                        />
                      ) : embedUrl ? (
                        <iframe
                          src={embedUrl}
                          title={offer.title}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <a
                          href={offer.mediaUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full h-full flex flex-col items-center justify-center gap-2 text-zinc-400 hover:text-[#C29B6B] transition-colors"
                        >
                          <Play className="w-10 h-10 p-2.5 rounded-full bg-white/10" />
                          <span className="text-xs font-mono">Click to watch video</span>
                        </a>
                      )}
                    </div>
                  )}

                  {offer.mediaType === 'image' && offer.mediaUrl && (
                    <div className="relative aspect-[16/9] w-full bg-zinc-950 overflow-hidden border-b border-white/10">
                      <img
                        src={offer.mediaUrl}
                        alt={offer.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                  )}

                  {/* Body Details */}
                  <div className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {offer.discountBadge ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold bg-[#C29B6B]/20 text-[#C29B6B] border border-[#C29B6B]/30">
                              {offer.discountBadge}
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold bg-amber-500/15 text-amber-300 border border-amber-500/20">
                              Special Offer
                            </span>
                          )}

                          {offer.mediaType === 'video' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-red-500/10 text-red-400 border border-red-500/20">
                              <Film className="w-3 h-3" />
                              Video Promo
                            </span>
                          )}
                        </div>

                        {offer.validUntil && (
                          <div className="inline-flex items-center gap-1 text-[11px] text-zinc-500 font-mono">
                            <Clock className="w-3 h-3 text-[#C29B6B]" />
                            <span>Valid till: {offer.validUntil}</span>
                          </div>
                        )}
                      </div>

                      <h3 className="text-base sm:text-lg font-medium text-white group-hover:text-[#C29B6B] transition-colors leading-snug">
                        {offer.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed whitespace-pre-line">
                        {offer.description}
                      </p>

                      {offer.minOrder && (
                        <p className="text-[11px] text-zinc-500 font-mono">
                          Condition: {offer.minOrder}
                        </p>
                      )}
                    </div>

                    {/* Action Bar / Coupon Code */}
                    <div className="pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-3">
                      {offer.code ? (
                        <div className="flex items-center gap-2">
                          <div className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-dashed border-[#C29B6B]/40 font-mono font-bold text-xs text-[#C29B6B] tracking-wider">
                            {offer.code}
                          </div>
                          <button
                            onClick={() => handleCopy(offer.code)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                              isCopied
                                ? 'bg-emerald-500 text-black'
                                : 'bg-[#C29B6B] hover:bg-[#b08856] text-black active:scale-95'
                            }`}
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Applied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Apply</span>
                              </>
                            )}
                          </button>
                        </div>
                      ) : (
                        <div className="text-[11px] text-emerald-400 font-medium">
                          Auto-applicable at counter / checkout
                        </div>
                      )}

                      <button
                        onClick={onExploreMenu}
                        className="px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 text-xs font-semibold uppercase tracking-wider flex items-center gap-1 transition-colors"
                      >
                        <Coffee className="w-3.5 h-3.5" />
                        <span>Order Now</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};
