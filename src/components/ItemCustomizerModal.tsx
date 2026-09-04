import React, { useState, useMemo } from 'react';
import { X, Plus, Minus, Clock, Flame, Check, Sparkles } from 'lucide-react';
import { MenuItem, CartItem, CartItemOption } from '../types';
import { formatPrice } from '../utils/cafeHelpers';

interface ItemCustomizerModalProps {
  item: MenuItem | null;
  onClose: () => void;
  onAddToCart: (cartItem: CartItem) => void;
}

export const ItemCustomizerModal: React.FC<ItemCustomizerModalProps> = ({
  item,
  onClose,
  onAddToCart,
}) => {
  if (!item) return null;

  // Selected size
  const defaultSize = item.availableSizes?.[0]?.name;
  const [selectedSize, setSelectedSize] = useState<string | undefined>(defaultSize);

  // Selected options state: { [categoryTitle]: string | string[] }
  const [selectedSingleOptions, setSelectedSingleOptions] = useState<{ [categoryTitle: string]: string }>(() => {
    const initial: { [key: string]: string } = {};
    item.customizations?.forEach((group) => {
      if (group.type === 'single' && group.options.length > 0) {
        initial[group.title] = group.options[0].name;
      }
    });
    return initial;
  });

  const [selectedMultiOptions, setSelectedMultiOptions] = useState<{ [categoryTitle: string]: string[] }>({});
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Calculate dynamic unit price
  const { unitPrice, sizeMultiplier, formattedOptions } = useMemo(() => {
    let multiplier = 1.0;
    if (item.availableSizes && selectedSize) {
      const sizeObj = item.availableSizes.find((s) => s.name === selectedSize);
      if (sizeObj) multiplier = sizeObj.priceMultiplier;
    }

    let calculatedUnitPrice = item.price * multiplier;
    const optionsList: CartItemOption[] = [];

    // Single choice options extras
    item.customizations?.forEach((group) => {
      if (group.type === 'single') {
        const choice = selectedSingleOptions[group.title];
        if (choice) {
          const opt = group.options.find((o) => o.name === choice);
          if (opt) {
            calculatedUnitPrice += opt.additionalPrice;
            if (opt.additionalPrice > 0 || choice !== group.options[0]?.name) {
              optionsList.push({
                categoryTitle: group.title,
                selectedOption: opt.name,
                extraPrice: opt.additionalPrice,
              });
            }
          }
        }
      } else if (group.type === 'multiple') {
        const choices = selectedMultiOptions[group.title] || [];
        choices.forEach((choiceName) => {
          const opt = group.options.find((o) => o.name === choiceName);
          if (opt) {
            calculatedUnitPrice += opt.additionalPrice;
            optionsList.push({
              categoryTitle: group.title,
              selectedOption: opt.name,
              extraPrice: opt.additionalPrice,
            });
          }
        });
      }
    });

    return {
      unitPrice: Math.round(calculatedUnitPrice),
      sizeMultiplier: multiplier,
      formattedOptions: optionsList,
    };
  }, [item, selectedSize, selectedSingleOptions, selectedMultiOptions]);

  const handleToggleMultiOption = (categoryTitle: string, optionName: string) => {
    setSelectedMultiOptions((prev) => {
      const current = prev[categoryTitle] || [];
      if (current.includes(optionName)) {
        return { ...prev, [categoryTitle]: current.filter((item) => item !== optionName) };
      } else {
        return { ...prev, [categoryTitle]: [...current, optionName] };
      }
    });
  };

  const handleConfirmAddToCart = () => {
    const cartItem: CartItem = {
      id: `${item.id}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      menuItemId: item.id,
      name: item.name,
      basePrice: item.price,
      selectedSize,
      sizeMultiplier,
      selectedOptions: formattedOptions,
      unitPrice,
      quantity,
      specialInstructions: specialInstructions.trim() || undefined,
      image: item.image,
      isVeg: item.isVeg,
    };

    onAddToCart(cartItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#0E1015] border border-white/10 rounded-3xl overflow-hidden shadow-2xl my-8 text-left animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-zinc-900/80 backdrop-blur-md text-zinc-400 hover:text-white border border-white/10 flex items-center justify-center transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Image */}
        <div className="relative h-56 w-full overflow-hidden bg-[#0A0B0E]">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0E1015] via-transparent to-black/40" />

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <span
              className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase border ${
                item.isVeg
                  ? 'bg-emerald-950/80 text-emerald-400 border-emerald-700/50'
                  : 'bg-rose-950/80 text-rose-400 border-rose-700/50'
              }`}
            >
              {item.isVeg ? 'Veg' : 'Non-Veg'}
            </span>
            {item.isChefSpecial && (
              <span className="px-2.5 py-1 rounded-md text-[10px] font-semibold tracking-widest uppercase bg-[#C29B6B] text-black flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Chef's Special
              </span>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[calc(85vh-200px)] overflow-y-auto">
          {/* Header & Description */}
          <div>
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-xl font-light text-[#E5E7EB]">{item.name}</h2>
              <span className="text-xl font-mono font-medium text-[#C29B6B]">{formatPrice(unitPrice)}</span>
            </div>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed font-light">{item.description}</p>

            <div className="flex items-center gap-4 mt-3 text-xs text-zinc-500 font-mono">
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#C29B6B]" />
                <span>Prep: {item.preparationTime}</span>
              </div>
              {item.calories && (
                <div className="flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  <span>{item.calories} kcal</span>
                </div>
              )}
            </div>
          </div>

          {/* Size selection */}
          {item.availableSizes && item.availableSizes.length > 0 && (
            <div className="space-y-2.5 border-t border-white/5 pt-4">
              <label className="text-xs font-medium uppercase tracking-widest text-zinc-400 block">
                Select Serving Size
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {item.availableSizes.map((size) => {
                  const isSelected = selectedSize === size.name;
                  const estimatedPrice = Math.round(item.price * size.priceMultiplier);
                  return (
                    <button
                      key={size.name}
                      type="button"
                      onClick={() => setSelectedSize(size.name)}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                        isSelected
                          ? 'border-[#C29B6B] bg-[#C29B6B]/10 text-[#E5E7EB]'
                          : 'border-white/5 bg-[#0A0B0E] text-zinc-400 hover:border-white/20'
                      }`}
                    >
                      <div className="text-xs font-medium">{size.name}</div>
                      <div className="text-xs font-mono font-medium text-[#C29B6B]">
                        {formatPrice(estimatedPrice)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Customizations */}
          {item.customizations?.map((group) => (
            <div key={group.title} className="space-y-2.5 border-t border-white/5 pt-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium uppercase tracking-widest text-zinc-400">
                  {group.title}
                </label>
                <span className="text-[11px] text-zinc-500 font-mono">
                  {group.type === 'single' ? 'Pick 1' : 'Optional (Multiple)'}
                </span>
              </div>

              <div className="space-y-2">
                {group.options.map((opt) => {
                  const isSingleSelected = selectedSingleOptions[group.title] === opt.name;
                  const isMultiSelected = (selectedMultiOptions[group.title] || []).includes(opt.name);
                  const isSelected = group.type === 'single' ? isSingleSelected : isMultiSelected;

                  return (
                    <button
                      key={opt.name}
                      type="button"
                      onClick={() => {
                        if (group.type === 'single') {
                          setSelectedSingleOptions((prev) => ({ ...prev, [group.title]: opt.name }));
                        } else {
                          handleToggleMultiOption(group.title, opt.name);
                        }
                      }}
                      className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                        isSelected
                          ? 'border-[#C29B6B] bg-[#C29B6B]/10 text-[#E5E7EB]'
                          : 'border-white/5 bg-[#0A0B0E] text-zinc-400 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-4 h-4 rounded-${group.type === 'single' ? 'full' : 'md'} border flex items-center justify-center ${
                            isSelected
                              ? 'border-[#C29B6B] bg-[#C29B6B] text-black'
                              : 'border-zinc-700 bg-transparent'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="text-xs font-medium">{opt.name}</span>
                      </div>

                      {opt.additionalPrice > 0 ? (
                        <span className="text-xs font-mono font-medium text-[#C29B6B]">
                          +{formatPrice(opt.additionalPrice)}
                        </span>
                      ) : (
                        <span className="text-[11px] text-zinc-500 font-mono">Included</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Special Barista Instructions */}
          <div className="space-y-2 border-t border-white/5 pt-4">
            <label className="text-xs font-medium uppercase tracking-widest text-zinc-400 block">
              Special Notes for Kitchen / Barista
            </label>
            <input
              type="text"
              placeholder="e.g. Extra hot, oat milk froth, less sweetness..."
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              maxLength={120}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0B0E] border border-white/10 focus:border-[#C29B6B] focus:outline-none text-xs text-zinc-200 placeholder-zinc-600 font-light"
            />
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-5 bg-[#0A0B0E] border-t border-white/10 flex items-center justify-between gap-4">
          {/* Quantity Controls */}
          <div className="flex items-center gap-3 bg-zinc-900 border border-white/10 rounded-xl px-2 py-1.5">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="w-8 h-8 rounded-lg bg-zinc-800 text-zinc-300 disabled:opacity-40 flex items-center justify-center hover:bg-zinc-700 transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-sm font-mono font-medium w-6 text-center text-[#E5E7EB]">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(20, q + 1))}
              className="w-8 h-8 rounded-lg bg-zinc-800 text-zinc-300 flex items-center justify-center hover:bg-zinc-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add to order submit button */}
          <button
            type="button"
            onClick={handleConfirmAddToCart}
            className="flex-1 py-3.5 px-5 rounded-xl bg-[#C29B6B] hover:bg-[#B18A5A] text-black font-semibold uppercase tracking-widest text-xs flex items-center justify-between shadow-lg shadow-[#C29B6B]/10 transition-all active:scale-[0.99]"
          >
            <span>Add to Order</span>
            <span className="font-mono text-sm">{formatPrice(unitPrice * quantity)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
