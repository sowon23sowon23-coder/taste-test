import { isSupabaseConfigured, supabase } from '../lib/supabase';

const LOCAL_KEY = 'savedCoupons';

const readLocalCoupons = () => {
  const saved = localStorage.getItem(LOCAL_KEY);
  return saved ? JSON.parse(saved) : [];
};

const writeLocalCoupons = (coupons) => {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(coupons));
};

export async function saveCoupon(coupon) {
  const payload = {
    code: coupon.code,
    flavor: coupon.flavor,
    toppings: coupon.toppings || [],
    store_name: coupon.storeName,
    created_at: new Date().toISOString()
  };

  if (!isSupabaseConfigured) {
    const nextCoupon = {
      id: `coupon-${Date.now()}`,
      code: coupon.code,
      flavor: coupon.flavor,
      toppings: coupon.toppings || [],
      storeName: coupon.storeName,
      createdAt: payload.created_at
    };
    writeLocalCoupons([nextCoupon, ...readLocalCoupons()]);
    return nextCoupon;
  }

  const { data, error } = await supabase
    .from('coupon_redemptions')
    .insert(payload)
    .select('id,code,flavor,toppings,store_name,created_at')
    .single();

  if (error) {
    console.error('Failed to save coupon:', error);
    throw error;
  }

  return {
    id: data.id,
    code: data.code,
    flavor: data.flavor,
    toppings: data.toppings || [],
    storeName: data.store_name,
    createdAt: data.created_at
  };
}

export async function listSavedCoupons() {
  if (!isSupabaseConfigured) {
    return readLocalCoupons();
  }

  const { data, error } = await supabase
    .from('coupon_redemptions')
    .select('id,code,flavor,toppings,store_name,created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to load coupon history:', error);
    throw error;
  }

  return data.map((row) => ({
    id: row.id,
    code: row.code,
    flavor: row.flavor,
    toppings: row.toppings || [],
    storeName: row.store_name,
    createdAt: row.created_at
  }));
}
