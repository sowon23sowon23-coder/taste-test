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
    <aside className="bg-white rounded-[32px] shadow-xl overflow-hidden lg:sticky lg:top-6">
      <div className="px-7 pt-8 pb-6" style={{ backgroundColor: colors.greenLight }}>
        <p className="text-xs font-black uppercase tracking-[0.28em]" style={{ color: colors.greenDark }}>Start Here</p>
        <h2 className="mt-3 text-3xl font-black leading-tight" style={{ color: colors.ink }}>Select a store and start the Flavor Test.</h2>
      </div>
      <div className="p-7">
        <label className="block text-left text-sm font-semibold text-gray-500 mb-2 flex items-center gap-1.5">
          <Store className="w-4 h-4" />
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
            className="w-full p-4 border-2 border-gray-200 rounded-xl font-medium text-gray-700 bg-gray-50 outline-none focus:border-pink-300"
          />
          {isHomeStoreOpen && (
            <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
              {filteredHomeStores.length > 0 ? filteredHomeStores.map((store) => (
                <button
                  key={store.id || store.name}
                  type="button"
                  onClick={() => onStoreSelect(store)}
                  className="w-full px-4 py-2.5 text-left text-gray-700 hover:bg-gray-100"
                >
                  {store.name}
                </button>
              )) : <div className="px-4 py-3 text-sm text-gray-500">No stores match your search.</div>}
            </div>
          )}
        </div>

        <button
          onClick={onFindNearest}
          disabled={isLocating}
          style={{ backgroundColor: colors.green }}
          className="w-full text-white px-6 py-3.5 rounded-xl font-bold hover:opacity-90 transition-opacity my-4 flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {isLocating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
          {isLocating ? 'Finding nearest store...' : 'Find Nearest Store'}
        </button>

        <button
          onClick={onStart}
          style={{ backgroundColor: colors.primary }}
          className="w-full text-white px-6 py-3.5 rounded-xl font-bold hover:opacity-90 transition-opacity"
        >
          Start Flavor Test
        </button>
      </div>
    </aside>
  );
}
