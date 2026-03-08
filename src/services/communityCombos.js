import { starterCommunityCombos } from '../data/communityCombos';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

const LOCAL_KEY = 'communityCombos';
const LIKED_KEY = 'likedComboIds';

const mapRowToCombo = (row) => ({
  id: row.id,
  title: row.title,
  author: row.author,
  flavor: row.flavor,
  toppings: row.toppings || [],
  vibe: row.vibe,
  description: row.description,
  likes: row.likes ?? 0,
  featured: row.featured ?? false,
  createdAt: row.created_at ?? row.createdAt ?? new Date().toISOString()
});

const readLocalCombos = () => {
  const saved = localStorage.getItem(LOCAL_KEY);
  const combos = saved ? JSON.parse(saved) : starterCommunityCombos;
  return combos.map((combo) => ({
    ...combo,
    createdAt: combo.createdAt || new Date().toISOString()
  }));
};

const writeLocalCombos = (combos) => {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(combos));
};

const readLikedComboIds = () => {
  const saved = localStorage.getItem(LIKED_KEY);
  return saved ? JSON.parse(saved) : [];
};

const writeLikedComboIds = (ids) => {
  localStorage.setItem(LIKED_KEY, JSON.stringify(ids));
};

export async function listCommunityCombos() {
  if (!isSupabaseConfigured) {
    return readLocalCombos();
  }

  const { data, error } = await supabase
    .from('combos')
    .select('id,title,author,flavor,toppings,vibe,description,likes,featured,created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to load combos from Supabase:', error);
    throw error;
  }

  return data.map(mapRowToCombo);
}

export async function createCommunityCombo(combo) {
  if (!isSupabaseConfigured) {
    const nextCombo = {
      ...combo,
      id: `combo-${Date.now()}`,
      likes: combo.likes ?? 1,
      featured: combo.featured ?? false,
      createdAt: new Date().toISOString()
    };
    const nextCombos = [nextCombo, ...readLocalCombos()];
    writeLocalCombos(nextCombos);
    return nextCombo;
  }

  const { data, error } = await supabase
    .from('combos')
    .insert({
      title: combo.title,
      author: combo.author,
      flavor: combo.flavor,
      toppings: combo.toppings,
      vibe: combo.vibe,
      description: combo.description,
      likes: combo.likes ?? 1,
      featured: combo.featured ?? false
    })
    .select('id,title,author,flavor,toppings,vibe,description,likes,featured,created_at')
    .single();

  if (error) {
    console.error('Failed to create combo in Supabase:', error);
    throw error;
  }

  return mapRowToCombo(data);
}

export async function likeCommunityCombo(comboId) {
  const likedIds = readLikedComboIds();
  if (likedIds.includes(comboId)) {
    throw new Error('ALREADY_LIKED');
  }

  if (!isSupabaseConfigured) {
    const combos = readLocalCombos();
    const nextCombos = combos.map((combo) =>
      combo.id === comboId ? { ...combo, likes: (combo.likes ?? 0) + 1 } : combo
    );
    writeLocalCombos(nextCombos);
    writeLikedComboIds([...likedIds, comboId]);
    return nextCombos.find((combo) => combo.id === comboId);
  }

  const { data: existing, error: fetchError } = await supabase
    .from('combos')
    .select('id,likes')
    .eq('id', comboId)
    .single();

  if (fetchError) {
    console.error('Failed to fetch combo like count:', fetchError);
    throw fetchError;
  }

  const { data, error } = await supabase
    .from('combos')
    .update({ likes: (existing.likes ?? 0) + 1 })
    .eq('id', comboId)
    .select('id,title,author,flavor,toppings,vibe,description,likes,featured,created_at')
    .single();

  if (error) {
    console.error('Failed to update combo like count:', error);
    throw error;
  }

  writeLikedComboIds([...likedIds, comboId]);
  return mapRowToCombo(data);
}
