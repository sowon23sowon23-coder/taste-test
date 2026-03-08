import React from 'react';

export function getCouponState(coupon) {
  if (!coupon) return { label: 'No coupon', color: '#6b7280', background: '#f3f4f6' };

  const isExpired = coupon.expiresAt ? new Date(coupon.expiresAt).getTime() < Date.now() : false;
  if (coupon.status === 'redeemed') {
    return { label: 'Used', color: '#72a234', background: '#f2f9e8' };
  }
  if (isExpired) {
    return { label: 'Expired', color: '#dc2626', background: '#fef2f2' };
  }
  return { label: 'Ready', color: '#960853', background: '#fff0f5' };
}

export function CouponStatusBadge({ coupon }) {
  const state = getCouponState(coupon);

  return (
    <span
      className="inline-flex rounded-full px-3 py-1 text-xs font-bold"
      style={{ color: state.color, backgroundColor: state.background }}
    >
      {state.label}
    </span>
  );
}
