import React, { useState, useMemo } from 'react';
import { Search, Plus, Sparkles, Clock, Flame, SlidersHorizontal } from 'lucide-react';
import { MenuItem, DietaryPreference } from '../types';
import { MENU_ITEMS, MENU_CATEGORIES } from '../data/menuData';
import { formatPrice } from '../utils/cafeHelpers';

interface MenuSectionProps {
  onSelectItem: (item: MenuItem) => void;
  onQuickAdd: (item: MenuItem) => void;
}

export const MenuSection: React.FC<MenuSectionProps> = ({ onSelectItem, onQuickAdd }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All Items');
  const [dietaryFilter, setDietaryFilter] = useState<DietaryPreference>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlySpecials, setOnlySpecials] = useState(false);

  // Filtered menu list
  const filteredItems = useMemo(() => {
    return MENU_ITEMS.filter((item) => {
      // Category filter
      if (selectedCategory !== 'All Items' && item.category !== selectedCategory) {
        return false;
      }

      // Dietary filter
      if (dietaryFilter === 'veg' && !item.isVeg) return false;
      if (dietaryFilter === 'non-veg' && item.isVeg) return false;

      // Chef specials filter
      if (onlySpecials && !item.isChefSpecial) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesCat = item.category.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesCat) return false;
      }

      return true;
    });
  }, [selectedCategory, dietaryFilter, onlySpecials, searchQuery]);

  return (
    <section id="menu-section" className="py-10 sm:py-16 lg:py-20 max-w-7xl mx-auto px-4 sm:px-8">
      {/* Section Title */}
      <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10 space-y-2 sm:space-y-3">
        <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-zinc-900/60 border border-white/10 text-[10px] sm:text-xs font-semibold text-[#C29B6B] uppercase tracking-wider sm:tracking-widest">
          <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#C29B6B]" />
          <span>Handcrafted Culinary Menu</span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-tight text-[#E5E7EB]">
          Artisan Selection & <span className="text-[#C29B6B] italic font-normal">Menu</span>
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-light">
          From micro-lot pour-overs to warm Italian sourdough sandwiches, choose your favorites and customize every detail for instant counter pickup or doorstep courier.
        </p>
      </div>

      {/* Controls Bar: Search & Dietary Filter */}
      <div className="mb-6 sm:mb-8 space-y-3 sm:space-y-4">
        <div className="flex flex-col md:flex-row gap-2.5 sm:gap-3 items-stretch md:items-center justify-between">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search coffee, sandwich, tiramisu, pasta..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 rounded-xl bg-[#0E1015] border border-white/10 focus:border-[#C29B6B] focus:outline-none text-xs sm:text-sm text-[#E5E7EB] placeholder-zinc-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Dietary toggle chips */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setDietaryFilter('all')}
              className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-semibold border uppercase tracking-wider transition-all whitespace-nowrap ${
                dietaryFilter === 'all'
                  ? 'bg-[#C29B6B] text-black border-[#C29B6B]'
                  : 'bg-zinc-900/60 text-zinc-400 border-white/10 hover:border-white/20'
              }`}
            >
              All Diets
            </button>
            <button
              onClick={() => setDietaryFilter('veg')}
              className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-semibold border uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
                dietaryFilter === 'veg'
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500'
                  : 'bg-zinc-900/60 text-zinc-400 border-white/10 hover:border-white/20'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Pure Veg
            </button>
            <button
              onClick={() => setDietaryFilter('non-veg')}
              className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-semibold border uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
                dietaryFilter === 'non-veg'
                  ? 'bg-rose-950/60 text-rose-300 border-rose-500'
                  : 'bg-zinc-900/60 text-zinc-400 border-white/10 hover:border-white/20'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              Non-Veg
            </button>
            <button
              onClick={() => setOnlySpecials(!onlySpecials)}
              className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-semibold border uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
                onlySpecials
                  ? 'bg-[#C29B6B] text-black border-[#C29B6B]'
                  : 'bg-zinc-900/60 text-[#C29B6B] border-white/10 hover:border-[#C29B6B]/40'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              Chef's Specials
            </button>
          </div>
        </div>

        {/* Category horizontal scrolling bar */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 pt-1 scrollbar-none border-b border-white/5">
          {MENU_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            const count =
              cat === 'All Items'
                ? MENU_ITEMS.length
                : MENU_ITEMS.filter((i) => i.category === cat).length;

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-medium tracking-wider uppercase whitespace-nowrap transition-all flex items-center gap-1.5 sm:gap-2 border ${
                  isSelected
                    ? 'bg-[#C29B6B]/15 border-[#C29B6B] text-[#C29B6B]'
                    : 'bg-zinc-900/40 border-white/5 text-zinc-400 hover:text-[#E5E7EB] hover:border-white/10'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                    isSelected
                      ? 'bg-[#C29B6B] text-black font-bold'
                      : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Menu Item Grid */}
      {filteredItems.length === 0 ? (
        <div className="py-16 text-center bg-[#0E1015] border border-white/10 rounded-3xl p-8 max-w-md mx-auto">
          <SlidersHorizontal className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-xl font-light text-[#E5E7EB]">No Items Found</h3>
          <p className="text-xs text-zinc-400 mt-1">
            Try adjusting your search terms or dietary filters to view delicious dishes.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All Items');
              setDietaryFilter('all');
              setOnlySpecials(false);
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-zinc-800 text-[#C29B6B] text-xs font-semibold hover:bg-zinc-700 transition-colors uppercase tracking-wider"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            return (
              <div
                key={item.id}
                className="group relative bg-zinc-900/40 border border-white/5 hover:border-[#C29B6B]/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-black/60 flex flex-col justify-between"
              >
                {/* Clickable Card Body */}
                <div onClick={() => onSelectItem(item)} className="cursor-pointer">
                  {/* Image container */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#0A0B0E]">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0E1015] via-transparent to-black/20" />

                    {/* Floating Badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span
                        className={`w-4 h-4 rounded-sm border flex items-center justify-center p-0.5 ${
                          item.isVeg
                            ? 'border-emerald-500 bg-emerald-950/80'
                            : 'border-rose-500 bg-rose-950/80'
                        }`}
                        title={item.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            item.isVeg ? 'bg-emerald-400' : 'bg-rose-400'
                          }`}
                        />
                      </span>

                      {item.isChefSpecial && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#C29B6B] text-black flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" /> Chef's Pick
                        </span>
                      )}

                      {item.isBestseller && !item.isChefSpecial && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-800 text-zinc-300 border border-white/10">
                          Bestseller
                        </span>
                      )}
                    </div>

                    {/* Prep time badge */}
                    <div className="absolute bottom-2.5 right-3 px-2 py-1 rounded-md bg-black/70 backdrop-blur-sm text-[10px] text-zinc-400 border border-white/10 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-[#C29B6B]" />
                      <span>{item.preparationTime}</span>
                    </div>
                  </div>

                  {/* Content details */}
                  <div className="p-3.5 sm:p-5 space-y-1 sm:space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm sm:text-base font-medium text-[#E5E7EB] group-hover:text-[#C29B6B] transition-colors leading-snug">
                        {item.name}
                      </h3>
                      <span className="text-sm sm:text-base font-mono font-medium text-[#C29B6B] whitespace-nowrap">
                        {formatPrice(item.price)}
                      </span>
                    </div>

                    <p className="text-[11px] sm:text-xs text-zinc-500 line-clamp-2 leading-relaxed font-light">
                      {item.description}
                    </p>

                    {item.calories && (
                      <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-zinc-500 pt-0.5 font-mono">
                        <Flame className="w-3 h-3 text-[#C29B6B]" />
                        <span>{item.calories} calories</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="p-3 sm:p-4 pt-0 sm:pt-1 border-t border-white/5 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onSelectItem(item)}
                    className="text-[11px] sm:text-xs text-zinc-400 hover:text-white transition-colors font-medium underline underline-offset-4 decoration-zinc-700"
                  >
                    {item.customizations || item.availableSizes ? 'Customize' : 'Details'}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (item.customizations || item.availableSizes) {
                        onSelectItem(item);
                      } else {
                        onQuickAdd(item);
                      }
                    }}
                    className="px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-lg bg-zinc-800 hover:bg-[#C29B6B] text-zinc-300 hover:text-black border border-white/5 hover:border-[#C29B6B] font-semibold text-[9px] sm:text-[10px] uppercase tracking-wider flex items-center gap-1 transition-all active:scale-95"
                  >
                    <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span>{item.customizations || item.availableSizes ? 'Customize' : 'Add'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
