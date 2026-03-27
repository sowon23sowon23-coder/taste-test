import React, { useEffect, useMemo, useState } from 'react';
import { ChevronRight, Home, IceCream, Sparkles, Store } from 'lucide-react';
import { StorePickerPanel } from './components/StorePickerPanel';
import { questions } from './data/questions';
import { flavorCategories, flavors, toppings } from './data/flavors';
import { stores as initialStores } from './data/stores';
import geocodedStores from './data/stores.json';

const YL = {
  primary: '#960853',
  primaryLight: '#fff0f5',
  green: '#8dc63f',
  greenDark: '#72a234',
  greenLight: '#f2f9e8',
  bg: '#fff5f8',
  paper: '#fffdf8',
  ink: '#2f2330'
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
const ADMIN_PASSWORD = 'admin1234';

const createCustomId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const normalizeStore = (store) => ({
  ...store,
  flavors: store.flavors || [],
  toppings: store.toppings || [],
  customFlavors: store.customFlavors || [],
  customToppings: store.customToppings || []
});

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsDataURL(file);
  });

function ImageDropInput({ label, image, onImageChange }) {
  const handleFiles = async (fileList) => {
    const file = fileList?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const dataUrl = await fileToDataUrl(file);
    onImageChange(dataUrl);
  };

  return (
    <label
      className="block cursor-pointer rounded-2xl border-2 border-dashed border-gray-300 bg-[#f7f7f9] p-4 text-center transition-colors hover:border-pink-300"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        handleFiles(event.dataTransfer.files);
      }}
      onPaste={(event) => {
        const imageItem = Array.from(event.clipboardData.items).find((item) => item.type.startsWith('image/'));
        if (!imageItem) return;
        event.preventDefault();
        const file = imageItem.getAsFile();
        if (file) handleFiles([file]);
      }}
      tabIndex={0}
    >
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          handleFiles(event.target.files);
          event.target.value = '';
        }}
      />
      {image ? (
        <img src={image} alt={label} className="mx-auto mb-3 h-24 w-24 rounded-2xl object-cover shadow-sm" />
      ) : null}
      <div className="text-sm font-semibold text-gray-700">{label}</div>
      <div className="mt-1 text-xs leading-5 text-gray-500">Drag image here, click to upload, or paste from clipboard.</div>
    </label>
  );
}

function App() {
  const savedSession = (() => {
    try {
      return JSON.parse(sessionStorage.getItem('yl_session') || 'null');
    } catch {
      return null;
    }
  })();

  const [stage, setStage] = useState(savedSession?.stage || 'home');
  const [currentQuestion, setCurrentQuestion] = useState(savedSession?.currentQuestion || 0);
  const [selectedStore, setSelectedStore] = useState(savedSession?.selectedStore || null);
  const [homeStoreQuery, setHomeStoreQuery] = useState(savedSession?.homeStoreQuery || '');
  const [isHomeStoreOpen, setIsHomeStoreOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [answerHistory, setAnswerHistory] = useState(savedSession?.answerHistory || []);
  const [recommendation, setRecommendation] = useState(savedSession?.recommendation || null);
  const [stores, setStores] = useState(initialStores.map(normalizeStore));
  const [editingStore, setEditingStore] = useState(null);
  const [adminStoreSearch, setAdminStoreSearch] = useState('');
  const [customFlavorDraft, setCustomFlavorDraft] = useState({ name: '', image: '' });
  const [customToppingDraft, setCustomToppingDraft] = useState({ name: '', image: '' });

  useEffect(() => {
    const saved = localStorage.getItem('yl_stores');
    if (saved) setStores(JSON.parse(saved).map(normalizeStore));
  }, []);

  useEffect(() => {
    sessionStorage.setItem(
      'yl_session',
      JSON.stringify({
        stage,
        currentQuestion,
        selectedStore,
        homeStoreQuery,
        answerHistory,
        recommendation
      })
    );
  }, [stage, currentQuestion, selectedStore, homeStoreQuery, answerHistory, recommendation]);

  useEffect(() => {
    localStorage.setItem('yl_stores', JSON.stringify(stores.map(normalizeStore)));
  }, [stores]);

  const getStoreKey = (store) => store.id ?? store.name;
  const selectedStoreData = selectedStore ? stores.find((store) => getStoreKey(store) === selectedStore) : null;
  const selectedStoreFlavorMap = {
    ...flavors,
    ...Object.fromEntries((selectedStoreData?.customFlavors || []).map((item) => [item.name, item]))
  };
  const selectedStoreToppingMap = {
    ...toppings,
    ...Object.fromEntries((selectedStoreData?.customToppings || []).map((item) => [item.name, item]))
  };
  const filteredHomeStores = useMemo(
    () =>
      stores.filter((store) => (store.name || '').toLowerCase().includes(homeStoreQuery.trim().toLowerCase())),
    [stores, homeStoreQuery]
  );

  const updateStore = (storeId, updatedStore) => {
    setStores(stores.map((s) => (getStoreKey(s) === storeId ? normalizeStore(updatedStore) : s)));
  };
  const availableFlavors = selectedStoreData?.flavors || [];
  const availableToppings = selectedStoreData?.toppings || [];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const beginTestWithStore = (store) => {
    setSelectedStore(getStoreKey(store));
    setHomeStoreQuery(store.name || '');
    setIsHomeStoreOpen(false);
    setCurrentQuestion(0);
    setAnswerHistory([]);
    setRecommendation(null);
    setStage('play');
  };

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const mapGeoStoreToAppStore = (geoStore) => {
    if (!geoStore?.name) return null;

    const geoCity = geoStore.name.split(',')[0].trim().toLowerCase();
    const directMatch = stores.find((store) => (store.name || '').toLowerCase().includes(geoCity));
    if (directMatch) return directMatch;

    const aliases = CITY_ALIAS_MAP[geoCity] || [];
    return (
      stores.find(
        (store) =>
          aliases.some((alias) => (store.id || '').toUpperCase() === alias || (store.name || '').toUpperCase().includes(alias))
      ) || null
    );
  };

  const handleFindNearest = () => {
    if (isLocating) return;
    if (!navigator.geolocation) {
      alert('Geolocation is not supported in this browser.');
      return;
    }

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

        if (!appStore) {
          alert('No nearby stores found.');
          return;
        }

        beginTestWithStore(appStore);
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
  };

  const resetTest = () => {
    setStage('play');
    setCurrentQuestion(0);
    setAnswerHistory([]);
    setRecommendation(null);
  };

  const addCustomFlavorToStore = () => {
    const name = customFlavorDraft.name.trim();
    if (!name || !customFlavorDraft.image || !editingStore) return;

    const nextFlavor = {
      id: createCustomId('flavor'),
      name,
      category: 'specialty',
      description: 'Custom store flavor.',
      image: customFlavorDraft.image
    };

    setEditingStore({
      ...editingStore,
      flavors: editingStore.flavors.includes(name) ? editingStore.flavors : [...editingStore.flavors, name],
      customFlavors: [...editingStore.customFlavors.filter((item) => item.name !== name), nextFlavor]
    });
    setCustomFlavorDraft({ name: '', image: '' });
  };

  const addCustomToppingToStore = () => {
    const name = customToppingDraft.name.trim();
    if (!name || !customToppingDraft.image || !editingStore) return;

    const nextTopping = {
      id: createCustomId('topping'),
      name,
      category: 'custom',
      image: customToppingDraft.image
    };

    setEditingStore({
      ...editingStore,
      toppings: editingStore.toppings.includes(name) ? editingStore.toppings : [...editingStore.toppings, name],
      customToppings: [...editingStore.customToppings.filter((item) => item.name !== name), nextTopping]
    });
    setCustomToppingDraft({ name: '', image: '' });
  };

  const removeCustomFlavorFromStore = (name) => {
    if (!editingStore) return;
    setEditingStore({
      ...editingStore,
      flavors: editingStore.flavors.filter((item) => item !== name),
      customFlavors: editingStore.customFlavors.filter((item) => item.name !== name)
    });
  };

  const removeCustomToppingFromStore = (name) => {
    if (!editingStore) return;
    setEditingStore({
      ...editingStore,
      toppings: editingStore.toppings.filter((item) => item !== name),
      customToppings: editingStore.customToppings.filter((item) => item.name !== name)
    });
  };

  const recomputeScores = (history) => {
    const nextScores = { flavors: {}, toppings: {}, personalities: {} };

    history.forEach((optionIndex, questionIndex) => {
      const option = questions[questionIndex].options[optionIndex];
      option.flavors.forEach((flavor) => {
        nextScores.flavors[flavor] = (nextScores.flavors[flavor] || 0) + 1;
      });
      option.toppings.forEach((topping) => {
        nextScores.toppings[topping] = (nextScores.toppings[topping] || 0) + 1;
      });
      nextScores.personalities[option.personality] = (nextScores.personalities[option.personality] || 0) + 1;
    });

    return nextScores;
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

    const flavor =
      Object.keys(nextScores.flavors)
        .filter((item) => availableFlavors.includes(item))
        .sort((left, right) => nextScores.flavors[right] - nextScores.flavors[left])[0] ||
      availableFlavors[0] ||
      'Vanilla';
    const pickedToppings = Object.keys(nextScores.toppings)
      .filter((item) => availableToppings.includes(item))
      .sort((left, right) => nextScores.toppings[right] - nextScores.toppings[left])
      .slice(0, 2);
    const personality =
      Object.keys(nextScores.personalities).sort(
        (left, right) => nextScores.personalities[right] - nextScores.personalities[left]
      )[0] || option.personality;

    setRecommendation({
      flavor,
      toppings: pickedToppings,
      personality,
      description: flavors[flavor]?.description || 'A Yogurtland combo shaped by your answers.'
    });
    setStage('result');
  };

  const handlePrevious = () => {
    if (currentQuestion === 0) return;
    setAnswerHistory((current) => current.slice(0, -1));
    setCurrentQuestion((current) => current - 1);
  };

  const handleAdminAccess = (passwordInput) => {
    const password = passwordInput?.trim();
    if (!password) {
      alert('Enter the admin password first.');
      return;
    }

    if (password !== ADMIN_PASSWORD) {
      alert('Incorrect admin password.');
      return;
    }

    setStage('admin');
  };

  if (stage === 'home') {
    return (
      <div
        className="min-h-screen px-4 py-10 md:px-6 md:py-14"
        style={{
          background: `radial-gradient(circle at top left, ${YL.primaryLight} 0%, ${YL.bg} 45%, ${YL.paper} 100%)`
        }}
      >
        <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-[380px] items-center">
          <StorePickerPanel
            homeStoreQuery={homeStoreQuery}
            isHomeStoreOpen={isHomeStoreOpen}
            filteredHomeStores={filteredHomeStores}
            isLocating={isLocating}
            onStoreQueryChange={(event) => {
              setHomeStoreQuery(event.target.value);
              setIsHomeStoreOpen(true);
              setSelectedStore(null);
            }}
            onStoreQueryFocus={() => setIsHomeStoreOpen(true)}
            onStoreQueryBlur={() => setTimeout(() => setIsHomeStoreOpen(false), 120)}
            onStoreSelect={(store) => {
              beginTestWithStore(store);
            }}
            onStoreEnter={(event) => {
              if (event.key === 'Enter' && filteredHomeStores.length > 0) {
                beginTestWithStore(filteredHomeStores[0]);
              }
            }}
            onFindNearest={handleFindNearest}
            onAdmin={handleAdminAccess}
          />
        </div>
      </div>
    );
  }

  if (stage === 'play') {
    return (
      <div style={{ backgroundColor: YL.bg }} className="min-h-screen px-4 py-4 md:py-8">
        <div className="mx-auto max-w-4xl">
          <section className="overflow-hidden rounded-[28px] bg-white shadow-xl md:rounded-[32px]">
            <div style={{ backgroundColor: YL.primary }} className="px-5 py-4 md:px-8 md:py-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-white/60">Question Flow</div>
                  <div className="text-lg font-extrabold text-white">Flavor Test</div>
                </div>
                {selectedStoreData?.name ? (
                  <div className="rounded-full bg-white/16 px-3 py-1.5 text-right text-[0.7rem] font-semibold text-white ring-1 ring-white/20 backdrop-blur-sm md:text-xs">
                    {selectedStoreData.name}
                  </div>
                ) : null}
              </div>
            </div>
            <div className="p-5 md:p-8">
              <div className="mb-6">
                <div className="mb-2 flex justify-between text-xs font-semibold text-gray-400">
                  <span>
                    Question {currentQuestion + 1} / {questions.length}
                  </span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%`, backgroundColor: YL.primary }}
                  />
                </div>
              </div>
              <div
                className="mb-6 rounded-[24px] p-5 text-center md:rounded-3xl md:p-6"
                style={{ backgroundColor: YL.primaryLight }}
              >
                <p className="text-xl font-black text-gray-800 md:text-2xl">{questions[currentQuestion].text}</p>
              </div>
              <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-2">
                {questions[currentQuestion].options.map((option, index) => (
                  <button
                    key={`${questions[currentQuestion].id}-${option.label}`}
                    onClick={() => handleAnswer(index)}
                    style={{ backgroundColor: YL.primary }}
                    className="min-h-[112px] rounded-[24px] px-5 py-5 text-left text-white shadow-md transition-all duration-150 hover:opacity-90 active:scale-95 md:rounded-3xl md:px-6"
                  >
                    <div className="mb-1 text-lg font-extrabold leading-tight">{option.label}</div>
                    <div className="text-sm leading-6 text-white/80">{option.description}</div>
                  </button>
                ))}
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                <button
                  onClick={resetTest}
                  className="rounded-2xl bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-500 transition-colors hover:bg-gray-200"
                >
                  Start Over
                </button>
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                  className="rounded-2xl bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-500 transition-colors hover:bg-gray-200 disabled:opacity-40"
                >
                  Previous
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  if (stage === 'admin') {
    return (
      <div style={{ backgroundColor: YL.bg }} className="min-h-screen p-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-5 flex items-center gap-4 rounded-2xl bg-white p-5 shadow-md">
            <div style={{ backgroundColor: YL.primary }} className="rounded-xl p-3">
              <Store className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold uppercase tracking-widest" style={{ color: YL.primary }}>
                Yogurtland
              </div>
              <h1 className="text-2xl font-extrabold text-gray-800">Admin Mode</h1>
            </div>
            <button
              onClick={() => {
                resetFlow();
                setEditingStore(null);
                setAdminStoreSearch('');
              }}
              className="flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-200"
            >
              <Home className="h-4 w-4" />
              Back Home
            </button>
          </div>

          {editingStore ? (
            <div className="rounded-2xl bg-white p-8 shadow-md">
              <h2 className="mb-1 text-2xl font-bold text-gray-800">{editingStore.name}</h2>
              <p className="mb-6 text-sm text-gray-400">Select flavors and toppings sold at this store.</p>

              <div className="mb-6">
                <h3 className="mb-3 flex items-center gap-2 text-base font-bold" style={{ color: YL.primary }}>
                  <IceCream className="h-4 w-4" /> Flavors
                </h3>
                <div className="grid max-h-80 grid-cols-2 gap-2 overflow-y-auto pr-1 md:grid-cols-3">
                  {Object.keys(flavors).map((flavor) => (
                    <label
                      key={flavor}
                      className="flex cursor-pointer select-none items-center gap-2 rounded-xl p-3 transition-colors duration-150"
                      style={{ backgroundColor: editingStore.flavors.includes(flavor) ? YL.primaryLight : '#F9FAFB' }}
                    >
                      <input
                        type="checkbox"
                        checked={editingStore.flavors.includes(flavor)}
                        onChange={(e) => {
                          const newFlavors = e.target.checked
                            ? [...editingStore.flavors, flavor]
                            : editingStore.flavors.filter((f) => f !== flavor);
                          setEditingStore({ ...editingStore, flavors: newFlavors });
                        }}
                        className="h-4 w-4 rounded"
                        style={{ accentColor: YL.primary }}
                      />
                      <span className="text-sm font-medium text-gray-700">{flavor}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-8 rounded-2xl border border-pink-100 bg-pink-50/60 p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="text-base font-bold" style={{ color: YL.primary }}>
                    Add Custom Flavor
                  </h3>
                  <span className="text-xs font-medium text-gray-500">Saved only for this store</span>
                </div>
                <div className="grid gap-4 md:grid-cols-[1fr_220px]">
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Flavor name"
                      value={customFlavorDraft.name}
                      onChange={(e) => setCustomFlavorDraft((current) => ({ ...current, name: e.target.value }))}
                      className="w-full rounded-xl border border-pink-100 bg-white p-3 text-sm font-medium text-gray-700 outline-none focus:border-pink-300"
                    />
                    <button
                      type="button"
                      onClick={addCustomFlavorToStore}
                      disabled={!customFlavorDraft.name.trim() || !customFlavorDraft.image}
                      style={{ backgroundColor: YL.primary }}
                      className="rounded-xl px-4 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                    >
                      Add Flavor To Store
                    </button>
                  </div>
                  <ImageDropInput
                    label="Flavor image"
                    image={customFlavorDraft.image}
                    onImageChange={(image) => setCustomFlavorDraft((current) => ({ ...current, image }))}
                  />
                </div>
                {editingStore.customFlavors.length > 0 ? (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {editingStore.customFlavors.map((item) => (
                      <div key={item.id || item.name} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm">
                        <img src={item.image} alt={item.name} className="h-14 w-14 rounded-xl object-cover" />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-bold text-gray-800">{item.name}</div>
                          <div className="text-xs text-gray-500">Custom flavor</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeCustomFlavorFromStore(item.name)}
                          className="rounded-lg bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-200"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="mb-8">
                <h3 className="mb-3 flex items-center gap-2 text-base font-bold" style={{ color: YL.green }}>
                  <Sparkles className="h-4 w-4" /> Toppings
                </h3>
                <div className="grid max-h-80 grid-cols-2 gap-2 overflow-y-auto pr-1 md:grid-cols-3">
                  {Object.keys(toppings).map((topping) => (
                    <label
                      key={topping}
                      className="flex cursor-pointer select-none items-center gap-2 rounded-xl p-3 transition-colors duration-150"
                      style={{ backgroundColor: editingStore.toppings.includes(topping) ? YL.greenLight : '#F9FAFB' }}
                    >
                      <input
                        type="checkbox"
                        checked={editingStore.toppings.includes(topping)}
                        onChange={(e) => {
                          const newToppings = e.target.checked
                            ? [...editingStore.toppings, topping]
                            : editingStore.toppings.filter((t) => t !== topping);
                          setEditingStore({ ...editingStore, toppings: newToppings });
                        }}
                        className="h-4 w-4 rounded"
                        style={{ accentColor: YL.green }}
                      />
                      <span className="text-sm font-medium text-gray-700">{topping}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-8 rounded-2xl border border-lime-100 bg-lime-50/60 p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="text-base font-bold" style={{ color: YL.green }}>
                    Add Custom Topping
                  </h3>
                  <span className="text-xs font-medium text-gray-500">Saved only for this store</span>
                </div>
                <div className="grid gap-4 md:grid-cols-[1fr_220px]">
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Topping name"
                      value={customToppingDraft.name}
                      onChange={(e) => setCustomToppingDraft((current) => ({ ...current, name: e.target.value }))}
                      className="w-full rounded-xl border border-lime-100 bg-white p-3 text-sm font-medium text-gray-700 outline-none focus:border-lime-300"
                    />
                    <button
                      type="button"
                      onClick={addCustomToppingToStore}
                      disabled={!customToppingDraft.name.trim() || !customToppingDraft.image}
                      style={{ backgroundColor: YL.green }}
                      className="rounded-xl px-4 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                    >
                      Add Topping To Store
                    </button>
                  </div>
                  <ImageDropInput
                    label="Topping image"
                    image={customToppingDraft.image}
                    onImageChange={(image) => setCustomToppingDraft((current) => ({ ...current, image }))}
                  />
                </div>
                {editingStore.customToppings.length > 0 ? (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {editingStore.customToppings.map((item) => (
                      <div key={item.id || item.name} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm">
                        <img src={item.image} alt={item.name} className="h-14 w-14 rounded-xl object-cover" />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-bold text-gray-800">{item.name}</div>
                          <div className="text-xs text-gray-500">Custom topping</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeCustomToppingFromStore(item.name)}
                          className="rounded-lg bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-200"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    updateStore(getStoreKey(editingStore), editingStore);
                    setEditingStore(null);
                    setCustomFlavorDraft({ name: '', image: '' });
                    setCustomToppingDraft({ name: '', image: '' });
                  }}
                  style={{ backgroundColor: YL.primary }}
                  className="flex-1 rounded-xl px-6 py-3 font-bold text-white transition-opacity hover:opacity-90"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingStore(null);
                    setCustomFlavorDraft({ name: '', image: '' });
                    setCustomToppingDraft({ name: '', image: '' });
                  }}
                  className="flex-1 rounded-xl bg-gray-100 px-6 py-3 font-bold text-gray-600 transition-colors hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-gray-800">Select Store</h2>
              <input
                type="text"
                placeholder="Search stores..."
                value={adminStoreSearch}
                onChange={(e) => setAdminStoreSearch(e.target.value)}
                className="w-full rounded-xl border-2 border-gray-200 bg-white p-3 font-medium text-gray-700 outline-none transition-all duration-200 focus:border-pink-300"
              />
              <div className="grid max-h-[500px] gap-2 overflow-y-auto pr-1">
                {stores
                  .filter((store) => (store.name || '').toLowerCase().includes(adminStoreSearch.toLowerCase()))
                  .map((store) => (
                    <button
                      key={getStoreKey(store)}
                      onClick={() => {
                        setEditingStore(normalizeStore(store));
                        setCustomFlavorDraft({ name: '', image: '' });
                        setCustomToppingDraft({ name: '', image: '' });
                      }}
                      className="group flex items-center justify-between rounded-xl bg-white px-5 py-4 text-left font-medium text-gray-800 shadow-sm transition-all duration-150 hover:shadow-md"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = YL.primary;
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'white';
                        e.currentTarget.style.color = '';
                      }}
                    >
                      <span>{store.name}</span>
                      <ChevronRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const flavorData = selectedStoreFlavorMap[recommendation?.flavor] || { category: 'classic', description: 'A Yogurtland favorite.' };
  const flavorCategory = flavorCategories[flavorData.category] || flavorCategories.classic;

  return (
    <div style={{ backgroundColor: YL.bg }} className="min-h-screen px-4 py-4 md:py-8">
      <div className="mx-auto flex max-w-5xl justify-center">
        <section className="w-full max-w-2xl overflow-hidden rounded-[28px] bg-white shadow-xl md:rounded-[32px]">
          <div
            className="px-5 pb-5 pt-6 text-center md:px-8 md:pb-6 md:pt-8"
            style={{ background: `linear-gradient(135deg, ${YL.primaryLight} 0%, #ffffff 100%)` }}
          >
            <img src="/yogurtland-logo.png" alt="Yogurtland" className="mx-auto mb-4 h-10 object-contain" />
            <div className="text-xs font-black uppercase tracking-[0.28em]" style={{ color: YL.primary }}>
              Flavor Personality
            </div>
            <h1 className="mt-3 text-3xl font-black leading-tight md:text-4xl" style={{ color: YL.ink }}>
              {recommendation?.personality}
            </h1>
            <p className="mt-3 text-sm leading-6 text-gray-600">{selectedStoreData?.name}</p>
          </div>
          <div className="space-y-4 p-5 text-center md:space-y-5 md:p-8">
            <div className="rounded-[24px] p-5 md:rounded-3xl" style={{ backgroundColor: YL.primaryLight }}>
              <div className="mb-2 text-xs font-bold uppercase tracking-widest" style={{ color: YL.primary }}>
                Recommended Flavor
              </div>
              <div className="flex flex-col items-center gap-4">
                {flavorData.image ? (
                  <img src={flavorData.image} alt={flavorData.name || recommendation?.flavor} className="h-14 w-14 rounded-xl object-cover" />
                ) : (
                  <span className="text-5xl">{flavorCategory.icon}</span>
                )}
                <div>
                  <div className="text-2xl font-extrabold text-gray-800">{flavorData.name || recommendation?.flavor}</div>
                  <div className="mt-0.5 text-sm text-gray-500">{flavorData.description}</div>
                </div>
              </div>
            </div>
            <div className="rounded-[24px] p-5 md:rounded-3xl" style={{ backgroundColor: YL.greenLight }}>
              <div className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: YL.green }}>
                Recommended Toppings
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {(recommendation?.toppings || []).map((toppingName) => (
                  <div key={toppingName} className="flex items-center justify-center gap-3 rounded-2xl bg-white p-4 text-center">
                    {selectedStoreToppingMap[toppingName]?.image ? (
                      <img
                        src={selectedStoreToppingMap[toppingName].image}
                        alt={toppingName}
                        className="h-14 w-14 rounded-xl object-cover"
                      />
                    ) : (
                      <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#f5f7eb] text-lg font-extrabold text-[#6da126]">
                        {selectedStoreToppingMap[toppingName]?.icon || 'T'}
                      </span>
                    )}
                    <div className="text-lg font-extrabold text-gray-800">{toppingName}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={resetTest}
                style={{ backgroundColor: YL.primary }}
                className="flex-1 rounded-2xl px-6 py-4 text-base font-bold text-white transition-opacity hover:opacity-90"
              >
                Retake Test
              </button>
              <button
                onClick={resetFlow}
                className="flex-1 rounded-2xl bg-gray-100 px-6 py-4 text-base font-bold text-gray-600 transition-colors hover:bg-gray-200"
              >
                Back Home
              </button>
            </div>
            <a
              href="https://www.yogurtland.com/flavorfinder"
              target="_blank"
              rel="noreferrer"
              className="block text-sm font-semibold text-[#960853] underline-offset-4 transition-opacity hover:opacity-80 hover:underline"
            >
              Visit Yogurtland Flavor Finder
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
