import React from 'react';

const formatCreatedAt = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export function ComboCard({ combo, colors, actionLabel, onAction, onLike, isLiking }) {
  return (
    <div className="rounded-3xl border border-black/5 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xl font-extrabold text-gray-800">{combo.title}</div>
          <div className="text-sm text-gray-500">
            {combo.vibe} by {combo.author}
          </div>
          {formatCreatedAt(combo.createdAt) && (
            <div className="mt-1 text-xs text-gray-400">Posted {formatCreatedAt(combo.createdAt)}</div>
          )}
        </div>
        <button
          type="button"
          onClick={() => onLike?.(combo)}
          disabled={isLiking}
          className="rounded-full px-3 py-1 text-xs font-bold disabled:opacity-60"
          style={{ backgroundColor: colors.primaryLight, color: colors.primary }}
        >
          {isLiking ? 'Liking...' : `${combo.likes} likes`}
        </button>
      </div>
      <div className="mt-4 rounded-2xl p-4" style={{ backgroundColor: colors.paper }}>
        <div className="text-sm font-semibold text-gray-700">{combo.flavor}</div>
        <div className="mt-2 text-sm text-gray-600">{combo.toppings.join(' + ')}</div>
      </div>
      <p className="mt-4 text-sm leading-6 text-gray-500">{combo.description}</p>
      {onAction && (
        <button
          onClick={() => onAction(combo)}
          className="mt-5 w-full rounded-xl px-4 py-3 text-sm font-bold"
          style={{ backgroundColor: colors.greenLight, color: colors.greenDark }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
