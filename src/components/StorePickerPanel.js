import React from 'react';
import { MapPin, RefreshCw, Store } from 'lucide-react';

export function StorePickerPanel({
  colors,
  homeStoreQuery,
  isHomeStoreOpen,
  filteredHomeStores,
  isLocating,
  onStoreQueryChange,
  onStoreQueryFocus,
  onStoreQueryBlur,
  onStoreSelect,
  onStoreEnter,
  onFindNearest,
  onStart
}) {
  return (
    <aside className="overflow-hidden rounded-[28px] bg-white shadow-xl lg:sticky lg:top-6 md:rounded-[32px]">
      <div className="px-5 pb-5 pt-6 md:px-7 md:pb-6 md:pt-8" style={{ backgroundColor: colors.greenLight }}>
        <p className="text-xs font-black uppercase tracking-[0.28em]" style={{ color: colors.greenDark }}>
          Start Here
        </p>
        <h2 className="mt-3 text-2xl font-black leading-tight md:text-3xl" style={{ color: colors.ink }}>
          Select a store and start the Flavor Test.
        </h2>
      </div>
      <div className="space-y-4 p-5 md:p-7">
        <label className="mb-2 flex items-center gap-1.5 text-left text-sm font-semibold text-gray-500">
          <Store className="h-4 w-4" />
          Select Store
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="Choose a store"
            value={homeStoreQuery}
            onFocus={onStoreQueryFocus}
            onBlur={onStoreQueryBlur}
            onChange={onStoreQueryChange}
            onKeyDown={onStoreEnter}
            className="w-full rounded-2xl border-2 border-gray-200 bg-gray-50 p-4 text-base font-medium text-gray-700 outline-none focus:border-pink-300"
          />
          {isHomeStoreOpen && (
            <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
              {filteredHomeStores.length > 0 ? (
                filteredHomeStores.map((store) => (
                  <button
                    key={store.id || store.name}
                    type="button"
                    onClick={() => onStoreSelect(store)}
                    className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {store.name}
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-gray-500">No stores match your search.</div>
              )}
            </div>
          )}
        </div>

        <button
          onClick={onFindNearest}
          disabled={isLocating}
          style={{ backgroundColor: colors.green }}
          className="flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-base font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-70"
        >
          {isLocating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
          {isLocating ? 'Finding nearest store...' : 'Find Nearest Store'}
        </button>

        <button
          onClick={onStart}
          style={{ backgroundColor: colors.primary }}
          className="safe-bottom w-full rounded-2xl px-6 py-4 text-base font-bold text-white transition-opacity hover:opacity-90"
        >
          Start Flavor Test
        </button>
      </div>
    </aside>
  );
}
