import React, { useMemo, useState } from 'react';
import { StorePickerPanel } from './components/StorePickerPanel';
import { questions } from './data/questions';
import { flavorCategories, flavors, toppings } from './data/flavors';
import { stores } from './data/stores';
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

const FLOW_STEPS = [
  { id: 'pick', title: 'Pick', description: 'Choose your store or find the nearest one.' },
  { id: 'play', title: 'Play', description: 'Answer the flavor test questions.' },
  { id: 'result', title: 'Result', description: 'Get your flavor and topping match.' }
];

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

function App() {
  const [stage, setStage] = useState('home');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedStore, setSelectedStore] = useState(null);
  const [homeStoreQuery, setHomeStoreQuery] = useState('');
  const [isHomeStoreOpen, setIsHomeStoreOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [answerHistory, setAnswerHistory] = useState([]);
  const [recommendation, setRecommendation] = useState(null);

  const getStoreKey = (store) => store.id ?? store.name;
  const selectedStoreData = selectedStore ? stores.find((store) => getStoreKey(store) === selectedStore) : null;
  const filteredHomeStores = useMemo(
    () =>
      stores
        .filter((store) => (store.name || '').toLowerCase().includes(homeStoreQuery.trim().toLowerCase()))
        .slice(0, 8),
    [homeStoreQuery]
  );
  const availableFlavors = selectedStoreData?.flavors || [];
  const availableToppings = selectedStoreData?.toppings || [];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
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
          aliases.some(
            (alias) =>
              (store.id || '').toUpperCase() === alias ||
              (store.name || '').toUpperCase().includes(alias)
          )
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
        const candidates = geocodedStores.filter(
          (store) => Number.isFinite(store.lat) && Number.isFinite(store.lon)
        );

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
  };

  const resetTest = () => {
    setStage('play');
    setCurrentQuestion(0);
    setAnswerHistory([]);
    setRecommendation(null);
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
      nextScores.personalities[option.personality] =
        (nextScores.personalities[option.personality] || 0) + 1;
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
            colors={YL}
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
              setSelectedStore(getStoreKey(store));
              setHomeStoreQuery(store.name || '');
              setIsHomeStoreOpen(false);
            }}
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
              if (!selectedStore) {
                alert('Choose a store first.');
                return;
              }
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
              <div className="text-xs font-bold uppercase tracking-widest text-white/60">Yogurtland</div>
              <div className="mt-2 text-2xl font-extrabold leading-tight text-white md:text-3xl">
                Play the Flavor Test
              </div>
            </div>
            <div className="space-y-4 p-5 md:space-y-5 md:p-7">
              <div className="rounded-2xl p-4" style={{ backgroundColor: YL.primaryLight }}>
                <div className="text-xs font-black uppercase tracking-[0.24em]" style={{ color: YL.primary }}>
                  Current Store
                </div>
                <div className="mt-2 text-lg font-extrabold text-gray-800">
                  {selectedStoreData?.name}
                </div>
              </div>
              <div className="space-y-3">
                {FLOW_STEPS.map((step, index) => (
                  <div key={step.id} className="flex gap-3">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black text-white"
                      style={{ backgroundColor: step.id === 'play' ? YL.primary : '#d1d5db' }}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-800">{step.title}</div>
                      <div className="text-sm leading-6 text-gray-500">{step.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
          <section className="overflow-hidden rounded-[28px] bg-white shadow-xl md:rounded-[32px]">
            <div style={{ backgroundColor: YL.primary }} className="px-5 py-4 md:px-8 md:py-5">
              <div className="text-xs font-bold uppercase tracking-widest text-white/60">
                Question Flow
              </div>
              <div className="text-lg font-extrabold text-white">Flavor Test</div>
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
                <p className="text-xl font-black text-gray-800 md:text-2xl">
                  {questions[currentQuestion].text}
                </p>
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

  const flavorData = flavors[recommendation?.flavor] || { category: 'classic', description: 'A Yogurtland favorite.' };
  const flavorCategory = flavorCategories[flavorData.category] || flavorCategories.classic;

  return (
    <div style={{ backgroundColor: YL.bg }} className="min-h-screen px-4 py-4 md:py-8">
      <div className="mx-auto grid max-w-5xl gap-4 lg:grid-cols-[0.95fr_1.05fr] lg:gap-6">
        <section className="overflow-hidden rounded-[28px] bg-white shadow-xl md:rounded-[32px]">
          <div
            className="px-5 pb-5 pt-6 md:px-8 md:pb-6 md:pt-8"
            style={{ background: `linear-gradient(135deg, ${YL.primaryLight} 0%, #ffffff 100%)` }}
          >
            <img src="/yogurtland-logo.png" alt="Yogurtland" className="mb-4 h-10 object-contain" />
            <div className="text-xs font-black uppercase tracking-[0.28em]" style={{ color: YL.primary }}>
              Flavor Personality
            </div>
            <h1 className="mt-3 text-3xl font-black leading-tight md:text-4xl" style={{ color: YL.ink }}>
              {recommendation?.personality}
            </h1>
            <p className="mt-3 text-sm leading-6 text-gray-600">{selectedStoreData?.name}</p>
          </div>
          <div className="space-y-4 p-5 md:space-y-5 md:p-8">
            <div className="rounded-[24px] p-5 md:rounded-3xl" style={{ backgroundColor: YL.primaryLight }}>
              <div className="mb-2 text-xs font-bold uppercase tracking-widest" style={{ color: YL.primary }}>
                Recommended Flavor
              </div>
              <div className="flex items-center gap-4">
                <span className="text-5xl">{flavorCategory.icon}</span>
                <div>
                  <div className="text-2xl font-extrabold text-gray-800">{recommendation?.flavor}</div>
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
                  <div key={toppingName} className="flex items-center gap-3 rounded-2xl bg-white p-4">
                    <span className="text-3xl">{toppings[toppingName]?.icon || '🍬'}</span>
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
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
