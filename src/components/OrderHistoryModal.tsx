import React from 'react';
import { X, Receipt, ChevronRight, ShoppingBag, Cloud, LogIn, LogOut, CheckCircle } from 'lucide-react';
import { OrderDetails } from '../types';
import { formatPrice } from '../utils/cafeHelpers';
import { User } from 'firebase/auth';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: OrderDetails[];
  onSelectOrder: (order: OrderDetails) => void;
  currentUser?: User | null;
  onSignInWithGoogle?: () => void;
  onSignOut?: () => void;
}

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({
  isOpen,
  onClose,
  orders,
  onSelectOrder,
  currentUser,
  onSignInWithGoogle,
  onSignOut,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#0E1015] border border-white/10 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl my-4 sm:my-6 text-left animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#0A0B0E]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#C29B6B]/15 text-[#C29B6B]">
              <Receipt className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-light text-[#E5E7EB]">
                  Your Order Receipts
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Cloud className="w-2.5 h-2.5" />
                  Firebase Cloud Synced
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-zinc-400 font-light">
                {orders.length} {orders.length === 1 ? 'order' : 'orders'} placed • Saved to Firestore
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-900 text-zinc-400 hover:text-white flex items-center justify-center border border-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cloud account banner */}
        <div className="px-4 py-2.5 bg-white/[0.02] border-b border-white/5 flex items-center justify-between text-xs">
          {currentUser ? (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2 text-zinc-300">
                <div className="w-5 h-5 rounded-full bg-[#C29B6B]/20 text-[#C29B6B] flex items-center justify-center text-[10px] font-bold">
                  {currentUser.displayName?.[0] || currentUser.email?.[0] || 'U'}
                </div>
                <span className="truncate max-w-[200px] text-[11px]">{currentUser.email || currentUser.displayName}</span>
              </div>
              {onSignOut && (
                <button
                  onClick={onSignOut}
                  className="text-[10px] text-zinc-400 hover:text-red-400 flex items-center gap-1 transition-colors"
                >
                  <LogOut className="w-3 h-3" />
                  Sign Out
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <span className="text-[11px] text-zinc-400">Sync orders across devices:</span>
              {onSignInWithGoogle && (
                <button
                  onClick={onSignInWithGoogle}
                  className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-[11px] font-medium border border-white/10 flex items-center gap-1.5 transition-colors"
                >
                  <LogIn className="w-3 h-3 text-[#C29B6B]" />
                  Sign in with Google
                </button>
              )}
            </div>
          )}
        </div>

        {/* List of orders */}
        <div className="p-4 sm:p-5 space-y-2.5 max-h-[calc(80vh-140px)] overflow-y-auto">
          {orders.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <ShoppingBag className="w-8 h-8 text-zinc-600 mx-auto" />
              <p className="text-xs text-zinc-400 font-light">No past orders found.</p>
              <p className="text-[11px] text-zinc-500">Orders placed will appear here and sync to Firebase Firestore.</p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.orderId}
                onClick={() => {
                  onSelectOrder(order);
                  onClose();
                }}
                className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#0A0B0E] border border-white/5 hover:border-[#C29B6B]/40 transition-all cursor-pointer group flex items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-medium text-[#E5E7EB]">
                      #{order.orderId}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      {order.paymentStatus}
                    </span>
                  </div>

                  <p className="text-[10px] sm:text-[11px] text-zinc-400 font-light">
                    {order.createdAt} • <span className="uppercase font-medium text-zinc-300">{order.orderType}</span> ({order.items.length} items)
                  </p>

                  <div className="text-xs font-mono font-medium text-[#C29B6B]">
                    {formatPrice(order.total)}
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[11px] sm:text-xs text-zinc-400 group-hover:text-[#E5E7EB]">
                  <span>View Bill</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#C29B6B] group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
