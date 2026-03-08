import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, RotateCcw, SlidersHorizontal, Sparkles, Users } from 'lucide-react';
import { FlowOverview } from './components/FlowOverview';
import { StorePickerPanel } from './components/StorePickerPanel';
import { ComboCard } from './components/ComboCard';
import { ShareComboForm } from './components/ShareComboForm';
import { VisitSummary } from './components/VisitSummary';
import { questions } from './data/questions';
import { starterCommunityCombos } from './data/communityCombos';
import { stores as initialStores } from './data/stores';
import { flavors, flavorCategories, toppings } from './data/flavors';
import { createCommunityCombo, likeCommunityCombo, listCommunityCombos } from './services/communityCombos';
import { listSavedCoupons, redeemCoupon, saveCoupon } from './services/coupons';
import geocodedStores from './data/stores.json';

const YL = {
  primary: '#960853',
  primaryDark: '#7a0643',
  primaryLight: '#fff0f5',
  green: '#8dc63f',
  greenDark: '#72a234',
  greenLight: '#f2f9e8',
  bg: '#fff5f8',
  paper: '#fffdf8',
  ink: '#2f2330'
};

const FLOW_STEPS = [
  { id: 'play', title: 'Play', description: 'Take a Flavor Test.' },
  { id: 'discover', title: 'Discover', description: 'Browse combo ideas.' },
  { id: 'share', title: 'Share', description: 'Create your own combo.' },
  { id: 'visit', title: 'Visit', description: 'Generate a try-it code.' }
];

const DISCOVER_SORTS = {
  popular: 'Popular',
  latest: 'Latest'
};

const CITY_ALIAS_MAP = {
  'los angeles': ['USC GATEWAY', 'MIRACLE MILE', 'CULVER CITY'],
  'rancho cucamonga': ['RIO RANCHO', 'RANCHO MISSION VIEJO'],
  redlands: ['RIVERSIDE', 'CHINO HILLS'],
  'redondo beach': ['MANHATTAN BEACH'],
  'san diego': ['SDSU', 'MIRA MESA'],
  'seal beach': ['CERRITOS'],
  stockton: ['PLEASANT HILL'],
  torrance: ['MANHATTAN BEACH'],
  arvada: ['CO104', 'CO103', 'CO102', 'CO101'],
  denver: ['CO104', 'CO103', 'CO102', 'CO101'],
  littleton: ['CO104', 'CO103', 'CO102', 'CO101'],
  cypress: ['WESTCHASE', 'MEMORIAL CITY'],
  'fort worth': ['FT. WORTH'],
  houston: ['WESTCHASE', 'MEMORIAL CITY'],
  'st. george': ['RED ROCK COMMONS', 'OREM'],
  'west jordan': ['JORDAN LANDING']
};

const stores = initialStores;

function App() {
  const [stage, setStage] = useState('home');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedStore, setSelectedStore] = useState(null);
  const [answerHistory, setAnswerHistory] = useState([]);
  const [recommendation, setRecommendation] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponStatus, setCouponStatus] = useState(null);
  const [couponHistory, setCouponHistory] = useState([]);
  const [selectedHistoryCouponId, setSelectedHistoryCouponId] = useState('');
  const [homeStoreQuery, setHomeStoreQuery] = useState('');
  const [isHomeStoreOpen, setIsHomeStoreOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [communityCombos, setCommunityCombos] = useState(starterCommunityCombos);
  const [isLoadingCombos, setIsLoadingCombos] = useState(true);
  const [combosError, setCombosError] = useState('');
  const [isSubmittingCombo, setIsSubmittingCombo] = useState(false);
  const [isSavingCoupon, setIsSavingCoupon] = useState(false);
  const [isRedeemingCoupon, setIsRedeemingCoupon] = useState(false);
  const [likingComboId, setLikingComboId] = useState('');
  const [discoverScope, setDiscoverScope] = useState('store');
  const [discoverSort, setDiscoverSort] = useState('popular');
  const [shareForm, setShareForm] = useState({ title: '', flavor: '', toppings: [], description: '' });

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const [combos, coupons] = await Promise.all([
          listCommunityCombos(),
          listSavedCoupons()
        ]);
        if (!isMounted) return;
        setCommunityCombos(combos);
        setCouponHistory(coupons);
        setSelectedHistoryCouponId(coupons[0]?.id || '');
      } catch (error) {
        console.error(error);
        if (isMounted) {
          setCombosError('Community data could not be fully loaded.');
        }
      } finally {
        if (isMounted) setIsLoadingCombos(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const getStoreKey = (store) => store.id ?? store.name;
  const selectedStoreData = selectedStore ? stores.find((store) => getStoreKey(store) === selectedStore) : null;
  const filteredHomeStores = useMemo(
    () => stores.filter((store) => (store.name || '').toLowerCase().includes(homeStoreQuery.trim().toLowerCase())).slice(0, 8),
    [homeStoreQuery]
  );
  const availableFlavors = selectedStoreData?.flavors || [];
  const availableToppings = selectedStoreData?.toppings || [];
  const visibleCombos = selectedStoreData ? communityCombos.filter((combo) => availableFlavors.includes(combo.flavor)) : communityCombos;
  const discoverCombos = useMemo(() => {
    const scopedCombos = discoverScope === 'all' || !selectedStoreData ? communityCombos : visibleCombos;
    return [...scopedCombos].sort((left, right) => {
      if (discoverSort === 'latest') {
        return new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime();
      }
      const likeGap = (right.likes ?? 0) - (left.likes ?? 0);
      if (likeGap !== 0) return likeGap;
      return new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime();
    });
  }, [communityCombos, discoverScope, discoverSort, selectedStoreData, visibleCombos]);
  const popularStoreCombos = useMemo(
    () => [...visibleCombos].sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0)).slice(0, 3),
    [visibleCombos]
  );
  const activeCoupon = useMemo(
    () => couponHistory.find((coupon) => coupon.code === couponCode) || null,
    [couponCode, couponHistory]
  );
  const selectedHistoryCoupon = useMemo(
    () => couponHistory.find((coupon) => coupon.id === selectedHistoryCouponId) || null,
    [couponHistory, selectedHistoryCouponId]
  );
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const buildCouponCode = (seed = 'combo') => {
    const slug = seed.replace(/[^a-z0-9]/gi, '').toUpperCase().slice(0, 6) || 'COMBO';
    const random = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `YL-${slug}-${random}`;
  };

  const recomputeScores = (history) => {
    const nextScores = { flavors: {}, toppings: {}, personalities: {} };
    history.forEach((optionIndex, questionIndex) => {
      const option = questions[questionIndex].options[optionIndex];
      option.flavors.forEach((flavor) => { nextScores.flavors[flavor] = (nextScores.flavors[flavor] || 0) + 1; });
      option.toppings.forEach((topping) => { nextScores.toppings[topping] = (nextScores.toppings[topping] || 0) + 1; });
      nextScores.personalities[option.personality] = (nextScores.personalities[option.personality] || 0) + 1;
    });
    return nextScores;
  };

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const mapGeoStoreToAppStore = (geoStore) => {
    if (!geoStore?.name) return null;
    const geoCity = geoStore.name.split(',')[0].trim().toLowerCase();
    const directMatch = stores.find((store) => (store.name || '').toLowerCase().includes(geoCity));
    if (directMatch) return directMatch;
    const aliases = CITY_ALIAS_MAP[geoCity] || [];
    return stores.find((store) => aliases.some((alias) => (store.id || '').toUpperCase() === alias || (store.name || '').toUpperCase().includes(alias))) || null;
  };

  const handleFindNearest = () => {
    if (isLocating) return;
    if (!navigator.geolocation) return alert('Geolocation is not supported in this browser.');
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const candidates = geocodedStores.filter((store) => Number.isFinite(store.lat) && Number.isFinite(store.lon));
        let nearest = null;
        let minDistance = Infinity;
        candidates.forEach((store) => {
          const distance = getDistance(coords.latitude, coords.longitude, store.lat, store.lon);
          if (distance < minDistance) {
            minDistance = distance;
            nearest = store;
          }
        });
        const appStore = mapGeoStoreToAppStore(nearest);
        setIsLocating(false);
        if (!appStore) return alert('No nearby stores found.');
        setSelectedStore(getStoreKey(appStore));
        setHomeStoreQuery(appStore.name || '');
        setIsHomeStoreOpen(false);
      },
      () => {
        setIsLocating(false);
        alert('Unable to retrieve your location.');
      }
    );
  };

  const resetFlow = () => {
    setStage('home');
    setCurrentQuestion(0);
    setAnswerHistory([]);
    setRecommendation(null);
    setCouponCode('');
    setCouponStatus(null);
    setSelectedHistoryCouponId('');
    setShareForm({ title: '', flavor: '', toppings: [], description: '' });
  };

  const resetTest = () => {
    setStage('play');
    setCurrentQuestion(0);
    setAnswerHistory([]);
    setRecommendation(null);
    setCouponCode('');
    setCouponStatus(null);
  };

  const handleAnswer = (optionIndex) => {
    const option = questions[currentQuestion].options[optionIndex];
    const newHistory = [...answerHistory, optionIndex];
    const nextScores = recomputeScores(newHistory);
    setAnswerHistory(newHistory);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      return;
    }

    const flavor = Object.keys(nextScores.flavors)
      .filter((item) => availableFlavors.includes(item))
      .sort((a, b) => nextScores.flavors[b] - nextScores.flavors[a])[0] || availableFlavors[0] || null;
    const pickedToppings = Object.keys(nextScores.toppings)
      .filter((item) => availableToppings.includes(item))
      .sort((a, b) => nextScores.toppings[b] - nextScores.toppings[a])
      .slice(0, 2);
    const personality = Object.keys(nextScores.personalities)
      .sort((a, b) => nextScores.personalities[b] - nextScores.personalities[a])[0] || option.personality;

    setRecommendation({
      flavor,
      toppings: pickedToppings,
      personality,
      description: flavor ? flavors[flavor]?.description : 'A Yogurtland combo shaped by your answers.'
    });
    setCouponCode(buildCouponCode(flavor || personality));
    setCouponStatus(null);
    setStage('result');
  };

  const handlePrevious = () => {
    if (currentQuestion === 0) return;
    setAnswerHistory((current) => current.slice(0, -1));
    setCurrentQuestion((current) => current - 1);
  };

  const handleLikeCombo = async (combo) => {
    try {
      setLikingComboId(combo.id);
      const updated = await likeCommunityCombo(combo.id);
      setCommunityCombos((current) => current.map((item) => (item.id === combo.id ? updated : item)));
    } catch (error) {
      console.error(error);
      alert(error.message === 'ALREADY_LIKED' ? 'You already liked this combo on this device.' : 'Could not register the like right now.');
    } finally {
      setLikingComboId('');
    }
  };

  const handleStartShare = () => {
    setShareForm({
      title: '',
      flavor: recommendation?.flavor || '',
      toppings: recommendation?.toppings || [],
      description: ''
    });
    setStage('share');
  };

  const handleTryCombo = (combo) => {
    setRecommendation({
      flavor: combo.flavor,
      toppings: combo.toppings,
      personality: combo.vibe,
      description: combo.description
    });
    setCouponCode(buildCouponCode(combo.title));
    setCouponStatus(null);
    setStage('visit');
  };

  const submitCombo = async () => {
    if (!shareForm.title || !shareForm.flavor || shareForm.toppings.length === 0) {
      alert('Add a title, flavor, and at least one topping.');
      return;
    }

    try {
      setIsSubmittingCombo(true);
      const nextCombo = await createCommunityCombo({
        title: shareForm.title,
        author: 'You',
        flavor: shareForm.flavor,
        toppings: shareForm.toppings,
        vibe: recommendation?.personality || 'Custom',
        description: shareForm.description || 'A custom combo from the flavor test.',
        likes: 1,
        featured: false
      });
      setCommunityCombos((current) => [nextCombo, ...current.filter((item) => item.id !== nextCombo.id)]);
      setRecommendation({
        flavor: shareForm.flavor,
        toppings: shareForm.toppings,
        personality: recommendation?.personality || 'Custom Combo',
        description: shareForm.description || 'A custom combo from the flavor test.'
      });
      setCouponCode(buildCouponCode(shareForm.title));
      setCouponStatus(null);
      setStage('visit');
    } catch (error) {
      console.error(error);
      alert('Could not share the combo right now.');
    } finally {
      setIsSubmittingCombo(false);
    }
  };

  const handleSaveCoupon = async () => {
    if (!recommendation || !couponCode || !selectedStoreData?.name) return;
    try {
      setIsSavingCoupon(true);
      await saveCoupon({
        code: couponCode,
        flavor: recommendation.flavor,
        toppings: recommendation.toppings,
        storeName: selectedStoreData.name
      });
      const coupons = await listSavedCoupons();
      setCouponHistory(coupons);
      setSelectedHistoryCouponId(coupons[0]?.id || '');
      setCouponStatus({ type: 'success', message: 'Coupon saved. It is now ready for store use for the next 72 hours.' });
    } catch (error) {
      console.error(error);
      setCouponStatus({ type: 'error', message: 'Coupon could not be saved right now.' });
    } finally {
      setIsSavingCoupon(false);
    }
  };

  const handleRedeemCoupon = async () => {
    if (!activeCoupon?.id) {
      setCouponStatus({ type: 'error', message: 'Save the coupon before marking it as used.' });
      return;
    }

    if (activeCoupon.expiresAt && new Date(activeCoupon.expiresAt).getTime() < Date.now()) {
      setCouponStatus({ type: 'error', message: 'This coupon has expired. Generate a new one to continue.' });
      return;
    }

    if (activeCoupon.status === 'redeemed') {
      setCouponStatus({ type: 'success', message: 'This coupon is already marked as used.' });
      return;
    }

    try {
      setIsRedeemingCoupon(true);
      const redeemedCoupon = await redeemCoupon(activeCoupon.id);
      const coupons = await listSavedCoupons();
      setCouponHistory(coupons.map((coupon) => (coupon.id === redeemedCoupon?.id ? redeemedCoupon : coupon)));
      setSelectedHistoryCouponId(redeemedCoupon?.id || selectedHistoryCouponId);
      setCouponStatus({ type: 'success', message: 'Coupon marked as used. This visit is now recorded as completed.' });
    } catch (error) {
      console.error(error);
      setCouponStatus({ type: 'error', message: 'Coupon could not be updated right now.' });
    } finally {
      setIsRedeemingCoupon(false);
    }
  };

  if (stage === 'home') {
    return (
      <div className="min-h-screen px-4 py-4 md:px-6 md:py-8" style={{ background: `radial-gradient(circle at top left, ${YL.primaryLight} 0%, ${YL.bg} 45%, ${YL.paper} 100%)` }}>
        <div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-[1.15fr_0.85fr] lg:gap-6">
          <FlowOverview colors={YL} steps={FLOW_STEPS} combos={starterCommunityCombos} />
          <StorePickerPanel
            colors={YL}
            homeStoreQuery={homeStoreQuery}
            isHomeStoreOpen={isHomeStoreOpen}
            filteredHomeStores={filteredHomeStores}
            isLocating={isLocating}
            onStoreQueryChange={(event) => { setHomeStoreQuery(event.target.value); setIsHomeStoreOpen(true); setSelectedStore(null); }}
            onStoreQueryFocus={() => setIsHomeStoreOpen(true)}
            onStoreQueryBlur={() => setTimeout(() => setIsHomeStoreOpen(false), 120)}
            onStoreSelect={(store) => { setSelectedStore(getStoreKey(store)); setHomeStoreQuery(store.name || ''); setIsHomeStoreOpen(false); }}
            onStoreEnter={(event) => {
              if (event.key === 'Enter' && filteredHomeStores.length > 0) {
                const first = filteredHomeStores[0];
                setSelectedStore(getStoreKey(first));
                setHomeStoreQuery(first.name || '');
                setIsHomeStoreOpen(false);
              }
            }}
            onFindNearest={handleFindNearest}
            onStart={() => {
              if (!selectedStore) return alert('Choose a store first.');
              setStage('play');
            }}
          />
        </div>
      </div>
    );
  }

  if (stage === 'play') {
    return (
      <div style={{ backgroundColor: YL.bg }} className="min-h-screen px-4 py-4 md:py-8">
        <div className="mx-auto grid max-w-5xl gap-4 lg:grid-cols-[0.75fr_1.25fr] lg:gap-6">
          <aside className="overflow-hidden rounded-[28px] bg-white shadow-xl md:rounded-[32px]">
            <div className="px-5 py-6 md:px-7 md:py-7" style={{ backgroundColor: YL.primary }}>
              <div className="text-white/60 text-xs font-bold uppercase tracking-widest">Yogurtland</div>
              <div className="mt-2 text-2xl font-extrabold leading-tight text-white md:text-3xl">Play the Flavor Test</div>
            </div>
            <div className="space-y-4 p-5 md:space-y-5 md:p-7">
              <div className="rounded-2xl p-4" style={{ backgroundColor: YL.primaryLight }}>
                <div className="text-xs font-black uppercase tracking-[0.24em]" style={{ color: YL.primary }}>Current Store</div>
                <div className="mt-2 text-lg font-extrabold text-gray-800">{selectedStoreData?.name}</div>
              </div>
              <div className="space-y-3">
                {FLOW_STEPS.map((step, index) => (
                  <div key={step.id} className="flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black text-white" style={{ backgroundColor: step.id === 'play' ? YL.primary : '#d1d5db' }}>{index + 1}</div>
                    <div><div className="text-sm font-bold text-gray-800">{step.title}</div><div className="text-sm leading-6 text-gray-500">{step.description}</div></div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
          <section className="overflow-hidden rounded-[28px] bg-white shadow-xl md:rounded-[32px]">
            <div style={{ backgroundColor: YL.primary }} className="px-5 py-4 md:px-8 md:py-5"><div className="text-white/60 text-xs font-bold uppercase tracking-widest">Question Flow</div><div className="text-white font-extrabold text-lg">Flavor Test</div></div>
            <div className="p-5 md:p-8">
              <div className="mb-6"><div className="flex justify-between text-xs font-semibold text-gray-400 mb-2"><span>Question {currentQuestion + 1} / {questions.length}</span><span>{Math.round(progress)}%</span></div><div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden"><div className="h-full rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%`, backgroundColor: YL.primary }} /></div></div>
              <div className="mb-6 rounded-[24px] p-5 text-center md:rounded-3xl md:p-6" style={{ backgroundColor: YL.primaryLight }}><p className="text-xl font-black text-gray-800 md:text-2xl">{questions[currentQuestion].text}</p></div>
              <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-2">{questions[currentQuestion].options.map((option, index) => <button key={`${questions[currentQuestion].id}-${option.label}`} onClick={() => handleAnswer(index)} style={{ backgroundColor: YL.primary }} className="relative min-h-[112px] overflow-hidden rounded-[24px] px-5 py-5 text-left text-white shadow-md transition-all duration-150 hover:opacity-90 active:scale-95 md:rounded-3xl md:px-6"><div className="absolute top-3 right-3 opacity-20"><Sparkles className="h-5 w-5" /></div><div className="mb-1 text-lg font-extrabold leading-tight">{option.label}</div><div className="text-sm font-normal leading-6 opacity-80">{option.description}</div></button>)}</div>
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-center"><button onClick={resetTest} className="flex items-center justify-center gap-1.5 rounded-2xl bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-500 transition-colors hover:bg-gray-200"><RotateCcw className="h-3.5 w-3.5" />Start Over</button><button onClick={handlePrevious} disabled={currentQuestion === 0} className="flex items-center justify-center gap-1.5 rounded-2xl bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-500 transition-colors hover:bg-gray-200 disabled:opacity-40"><ChevronLeft className="h-3.5 w-3.5" />Previous</button></div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  if (stage === 'result') {
    const flavorData = flavors[recommendation?.flavor] || { category: 'classic', description: 'A Yogurtland favorite.' };
    const flavorCategory = flavorCategories[flavorData.category] || flavorCategories.classic;
    return (
      <div style={{ backgroundColor: YL.bg }} className="min-h-screen px-4 py-4 md:py-8">
        <div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-[0.95fr_1.05fr] lg:gap-6">
          <section className="overflow-hidden rounded-[28px] bg-white shadow-xl md:rounded-[32px]">
            <div className="px-5 pb-5 pt-6 md:px-8 md:pb-6 md:pt-8" style={{ background: `linear-gradient(135deg, ${YL.primaryLight} 0%, #ffffff 100%)` }}>
              <img src="/yogurtland-logo.png" alt="Yogurtland" className="h-10 object-contain mb-4" />
              <div className="text-xs font-black uppercase tracking-[0.28em]" style={{ color: YL.primary }}>Flavor Personality</div>
              <h1 className="mt-3 text-3xl font-black leading-tight md:text-4xl" style={{ color: YL.ink }}>{recommendation?.personality}</h1>
            </div>
            <div className="space-y-4 p-5 md:space-y-5 md:p-8">
              <div className="rounded-[24px] p-5 md:rounded-3xl" style={{ backgroundColor: YL.primaryLight }}>
                <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: YL.primary }}>Recommended Flavor</div>
                <div className="flex items-center gap-4"><span className="text-5xl">{flavorCategory.icon}</span><div><div className="text-2xl font-extrabold text-gray-800">{recommendation?.flavor}</div><div className="text-sm text-gray-500 mt-0.5">{flavorData.description}</div></div></div>
              </div>
              <div className="rounded-[24px] p-5 md:rounded-3xl" style={{ backgroundColor: YL.greenLight }}>
                <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: YL.green }}>Recommended Toppings</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{(recommendation?.toppings || []).map((topping) => <div key={topping} className="bg-white rounded-2xl p-4 flex items-center gap-3"><span className="text-3xl">{toppings[topping]?.icon || '•'}</span><div className="text-lg font-extrabold text-gray-800">{topping}</div></div>)}</div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row"><button onClick={() => setStage('discover')} style={{ backgroundColor: YL.primary }} className="safe-bottom flex-1 rounded-2xl px-6 py-4 text-base font-bold text-white transition-opacity hover:opacity-90">Discover Community Combos</button><button onClick={resetTest} className="flex-1 rounded-2xl bg-gray-100 px-6 py-4 text-base font-bold text-gray-600 transition-colors hover:bg-gray-200">Retake Test</button></div>
            </div>
          </section>
          <aside className="space-y-6">
            <section className="rounded-[28px] bg-white p-5 shadow-xl md:rounded-[32px] md:p-7">
              <div className="flex items-center gap-2 text-sm font-bold" style={{ color: YL.primary }}><Users className="w-4 h-4" /> Similar Community Picks</div>
              <div className="mt-5 space-y-3">{visibleCombos.slice(0, 3).map((combo) => <ComboCard key={combo.id} combo={combo} colors={YL} onLike={handleLikeCombo} isLiking={likingComboId === combo.id} />)}</div>
            </section>
            <section className="rounded-[28px] bg-white p-5 shadow-xl md:rounded-[32px] md:p-7">
              <div className="text-sm font-bold" style={{ color: YL.primary }}>Popular At This Store</div>
              <div className="mt-4 space-y-3">{popularStoreCombos.map((combo) => <div key={combo.id} className="rounded-2xl bg-gray-50 px-4 py-3"><div className="font-bold text-gray-800">{combo.title}</div><div className="text-sm text-gray-500">{combo.flavor} + {combo.toppings.join(' + ')}</div></div>)}</div>
            </section>
          </aside>
        </div>
      </div>
    );
  }

  if (stage === 'discover') {
    return (
      <div style={{ backgroundColor: YL.bg }} className="min-h-screen px-4 py-4 md:py-8">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[28px] bg-white shadow-xl md:rounded-[32px]">
          <div className="px-5 py-6 md:px-10 md:py-8" style={{ backgroundColor: YL.primary }}>
            <div className="text-white/60 text-xs font-bold uppercase tracking-[0.28em]">Discover</div>
            <h1 className="mt-3 text-3xl font-black text-white md:text-4xl">Browse combos from the community.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80">
              Switch between store-matched picks and the full community feed, then sort by what is trending or what was just shared.
            </p>
          </div>
          <div className="p-5 md:p-10">
            {combosError && <div className="mb-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{combosError}</div>}
            <div className="mb-6 rounded-[24px] border border-black/5 bg-gray-50 p-4 md:rounded-3xl md:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm font-bold" style={{ color: YL.primary }}>
                    <SlidersHorizontal className="h-4 w-4" />
                    Discover Controls
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    {discoverScope === 'store' && selectedStoreData
                      ? `Showing combos that fit ${selectedStoreData.name}.`
                      : 'Showing every combo shared across the community feed.'}
                  </div>
                </div>
                <div className="flex flex-col gap-4 md:flex-row">
                  <div>
                    <div className="mb-2 text-xs font-black uppercase tracking-[0.22em] text-gray-400">Scope</div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setDiscoverScope('store')}
                        className="rounded-full px-4 py-2 text-sm font-bold transition-colors"
                        style={{
                          backgroundColor: discoverScope === 'store' ? YL.primary : '#ffffff',
                          color: discoverScope === 'store' ? '#ffffff' : YL.primary
                        }}
                      >
                        This Store
                      </button>
                      <button
                        type="button"
                        onClick={() => setDiscoverScope('all')}
                        className="rounded-full border border-black/5 px-4 py-2 text-sm font-bold transition-colors"
                        style={{
                          backgroundColor: discoverScope === 'all' ? YL.primary : '#ffffff',
                          color: discoverScope === 'all' ? '#ffffff' : YL.primary
                        }}
                      >
                        All Stores
                      </button>
                    </div>
                  </div>
                  <div>
                    <div className="mb-2 text-xs font-black uppercase tracking-[0.22em] text-gray-400">Sort</div>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(DISCOVER_SORTS).map(([value, label]) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setDiscoverSort(value)}
                          className="rounded-full border border-black/5 px-4 py-2 text-sm font-bold transition-colors"
                          style={{
                            backgroundColor: discoverSort === value ? YL.greenLight : '#ffffff',
                            color: discoverSort === value ? YL.greenDark : '#4b5563'
                          }}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-500">
                <span className="rounded-full bg-white px-3 py-1 font-semibold text-gray-700">{discoverCombos.length} combos</span>
                {selectedStoreData && (
                  <span className="rounded-full bg-white px-3 py-1 font-semibold text-gray-700">{selectedStoreData.name}</span>
                )}
                <span className="rounded-full bg-white px-3 py-1 font-semibold text-gray-700">{DISCOVER_SORTS[discoverSort]} order</span>
              </div>
            </div>
            {isLoadingCombos ? (
              <div className="rounded-3xl border border-dashed border-gray-200 p-8 text-center text-gray-500">Loading community combos...</div>
            ) : discoverCombos.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {discoverCombos.map((combo) => (
                  <ComboCard
                    key={combo.id}
                    combo={combo}
                    colors={YL}
                    actionLabel="Try this flavor"
                    onAction={handleTryCombo}
                    onLike={handleLikeCombo}
                    isLiking={likingComboId === combo.id}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-gray-200 p-8 text-center text-gray-500">
                No combos match this store filter yet. Switch to All Stores or create the first combo.
              </div>
            )}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center"><button onClick={handleStartShare} style={{ backgroundColor: YL.primary }} className="safe-bottom rounded-2xl px-6 py-4 text-base font-bold text-white transition-opacity hover:opacity-90">Create My Combo</button><button onClick={() => setStage('result')} className="rounded-2xl bg-gray-100 px-6 py-4 text-base font-bold text-gray-600 transition-colors hover:bg-gray-200">Back To Result</button></div>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'share') {
    return (
      <div style={{ backgroundColor: YL.bg }} className="min-h-screen px-4 py-4 md:py-8">
        <ShareComboForm
          colors={YL}
          shareForm={shareForm}
          availableFlavors={availableFlavors}
          availableToppings={availableToppings}
          recommendation={recommendation}
          onFieldChange={(field, value) => setShareForm((current) => ({ ...current, [field]: value }))}
          onToggleTopping={(topping) => setShareForm((current) => ({ ...current, toppings: current.toppings.includes(topping) ? current.toppings.filter((item) => item !== topping) : [...current.toppings, topping].slice(0, 3) }))}
          onSubmit={submitCombo}
          onBack={() => setStage('discover')}
        />
        {isSubmittingCombo && <div className="mx-auto mt-4 max-w-6xl rounded-2xl bg-white px-4 py-3 text-sm text-gray-600 shadow-sm">Saving your combo...</div>}
      </div>
    );
  }

  if (stage === 'visit') {
    const flavorData = flavors[recommendation?.flavor] || { category: 'classic' };
    return (
      <div style={{ backgroundColor: YL.bg }} className="min-h-screen px-4 py-4 md:py-8">
        <VisitSummary
          colors={YL}
          flavorIcon={(flavorCategories[flavorData.category] || flavorCategories.classic).icon}
          recommendation={recommendation}
          couponCode={couponCode}
          storeName={selectedStoreData?.name}
          couponStatus={couponStatus || (isSavingCoupon ? { type: 'success', message: 'Saving coupon...' } : null)}
          couponHistory={couponHistory}
          activeCoupon={activeCoupon}
          selectedHistoryCoupon={selectedHistoryCoupon}
          isRedeemingCoupon={isRedeemingCoupon}
          onRegenerate={() => { setCouponCode(buildCouponCode(recommendation?.flavor || 'combo')); setCouponStatus(null); }}
          onSaveCoupon={handleSaveCoupon}
          onRedeemCoupon={handleRedeemCoupon}
          onSelectCoupon={(coupon) => setSelectedHistoryCouponId(coupon.id)}
          onReset={resetFlow}
        />
      </div>
    );
  }

  return null;
}

export default App;
