import { useState } from 'react';
import { MapPin, RefreshCw, Store } from 'lucide-react';

export function StorePickerPanel({
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
  onAdmin
}) {
  const [adminPassword, setAdminPassword] = useState('');
  return (
    <aside className="w-full overflow-hidden rounded-[26px] bg-[#f4f2f3] shadow-[0_18px_40px_rgba(47,35,48,0.14)]">
      <div className="px-6 pb-8 pt-10 text-center" style={{ backgroundColor: '#ab005f' }}>
        <img
          src="/yogurtland-logo.png"
          alt="Yogurtland"
          className="mx-auto mb-5 h-5 object-contain"
          style={{ filter: 'brightness(0) invert(1)', opacity: 0.96 }}
        />
        <h2 className="mx-auto max-w-[285px] text-[2.25rem] font-black leading-[1.08] text-white">
          Find Your Perfect
          <br />
          Yogurt Flavor
        </h2>
        <p className="mt-4 text-[0.95rem] leading-6 text-white/84">
          We will match you with your best combo.
        </p>
      </div>

      <div className="space-y-6 px-5 py-6 md:px-6">
        <label className="mb-3 flex items-center gap-1.5 text-left text-[0.95rem] font-semibold text-[#59606d]">
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
            className="w-full rounded-[14px] border border-[#d4d4d9] bg-[#f7f7f9] px-4 py-4 text-base font-medium text-[#5f6673] outline-none transition-colors placeholder:text-[#a1a6b0] focus:border-pink-300"
          />
          {isHomeStoreOpen && (
            <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-[16px] border border-[#d7d5d8] bg-white shadow-lg" onMouseDown={(e) => e.preventDefault()}>
              {filteredHomeStores.length > 0 ? (
                <div
                  className="max-h-64 overflow-y-auto overscroll-contain"
                  style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
                >
                  {filteredHomeStores.map((store) => (
                    <button
                      key={store.id || store.name}
                      type="button"
                      onClick={() => onStoreSelect(store)}
                      className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {store.name}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-3 text-sm text-gray-500">No stores match your search.</div>
              )}
            </div>
          )}
        </div>

        <button
          onClick={onFindNearest}
          disabled={isLocating}
          className="flex w-full items-center justify-center gap-2 rounded-[13px] px-6 py-4 text-base font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-70"
          style={{ backgroundColor: '#92c83e' }}
        >
          {isLocating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
          {isLocating ? 'Finding nearest store...' : 'Find Nearest Store'}
        </button>

        <div className="grid grid-cols-[1fr_auto] gap-2">
          <input
            type="password"
            placeholder="Admin password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && adminPassword.trim()) onAdmin(adminPassword);
            }}
            className="rounded-[14px] border border-[#d4d4d9] bg-[#f7f7f9] px-4 py-4 text-base text-[#5f6673] outline-none placeholder:text-[#a1a6b0]"
          />
          <button
            onClick={() => onAdmin(adminPassword)}
            disabled={!adminPassword.trim()}
            className="safe-bottom rounded-[14px] bg-[#40495d] px-5 py-4 text-base font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            Admin
          </button>
        </div>
      </div>
    </aside>
  );
}


