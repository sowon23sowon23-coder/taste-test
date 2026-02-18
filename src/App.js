import React, { useState, useEffect } from 'react';
import { IceCream, MapPin, Sparkles, Store, ChevronRight, RefreshCw, ChevronLeft, RotateCcw } from 'lucide-react';
import { questions } from './data/questions';
import { stores as initialStores } from './data/stores';
import { flavors, flavorCategories, toppings } from './data/flavors';

const YL = {
  primary: '#960853',
  primaryDark: '#7a0643',
  primaryLight: '#FFF0F5',
  green: '#8DC63F',
  greenDark: '#72a234',
  greenLight: '#F2F9E8',
  bg: '#FFF5F8',
};

function App() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedStore, setSelectedStore] = useState(null);
  const [scores, setScores] = useState({ flavors: {}, toppings: {} });
  const [recommendation, setRecommendation] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [stores, setStores] = useState(initialStores);
  const [editingStore, setEditingStore] = useState(null);
  const [adminStoreSearch, setAdminStoreSearch] = useState('');
  const [adminError, setAdminError] = useState(false);
  const [answerHistory, setAnswerHistory] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    const savedStores = localStorage.getItem('stores');
    if (savedStores) {
      setStores(JSON.parse(savedStores));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('stores', JSON.stringify(stores));
  }, [stores]);

  const deg2rad = (deg) => deg * (Math.PI / 180);

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const findNearestStore = (userLat, userLng) => {
    const storesWithCoords = stores.filter(store => store.lat && store.lng);
    if (storesWithCoords.length === 0) return null;
    let nearest = null;
    let minDistance = Infinity;
    storesWithCoords.forEach(store => {
      const distance = getDistance(userLat, userLng, store.lat, store.lng);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = store;
      }
    });
    return nearest;
  };

  const handleFindNearest = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          const nearest = findNearestStore(latitude, longitude);
          if (nearest) {
            setSelectedStore(nearest.id);
          } else {
            alert('No nearby stores found.');
          }
        },
        () => {
          alert('Unable to retrieve your location.');
        }
      );
    } else {
      alert('Geolocation is not supported in this browser.');
    }
  };

  const handleAnswer = (optionIndex) => {
    const question = questions[currentQuestion];
    const option = question.options[optionIndex];

    const newHistory = [...answerHistory, optionIndex];
    setAnswerHistory(newHistory);

    const newScores = { ...scores };
    option.flavors.forEach(flavor => {
      newScores.flavors[flavor] = (newScores.flavors[flavor] || 0) + 1;
    });
    option.toppings.forEach(topping => {
      newScores.toppings[topping] = (newScores.toppings[topping] || 0) + 1;
    });
    setScores(newScores);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const availableFlavors = selectedStore ? stores.find(s => s.id === selectedStore).flavors : [];
      const availableToppings = selectedStore ? stores.find(s => s.id === selectedStore).toppings : [];

      const topFlavor = Object.keys(newScores.flavors)
        .filter(f => availableFlavors.includes(f))
        .reduce((a, b) => newScores.flavors[a] > newScores.flavors[b] ? a : b, null);

      const topTopping = Object.keys(newScores.toppings)
        .filter(t => availableToppings.includes(t))
        .reduce((a, b) => newScores.toppings[a] > newScores.toppings[b] ? a : b, null);

      setRecommendation({ flavor: topFlavor, topping: topTopping });
    }
  };

  const resetGame = () => {
    setCurrentQuestion(0);
    setScores({ flavors: {}, toppings: {} });
    setRecommendation(null);
    setAnswerHistory([]);
  };

  const handlePrevious = () => {
    if (currentQuestion === 0) return;
    const newHistory = answerHistory.slice(0, -1);
    setAnswerHistory(newHistory);
    const newScores = { flavors: {}, toppings: {} };
    newHistory.forEach((optionIndex, qIndex) => {
      const option = questions[qIndex].options[optionIndex];
      option.flavors.forEach(flavor => {
        newScores.flavors[flavor] = (newScores.flavors[flavor] || 0) + 1;
      });
      option.toppings.forEach(topping => {
        newScores.toppings[topping] = (newScores.toppings[topping] || 0) + 1;
      });
    });
    setScores(newScores);
    setCurrentQuestion(currentQuestion - 1);
  };

  const handleAdminLogin = () => {
    if (adminPassword === 'admin1234') {
      setIsAdmin(true);
      setAdminError(false);
    } else {
      setAdminError(true);
    }
  };

  const updateStore = (storeId, updatedStore) => {
    setStores(stores.map(s => s.id === storeId ? updatedStore : s));
  };

  if (isAdmin) {
    return (
      <div style={{ backgroundColor: YL.bg }} className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-md p-5 mb-5 flex items-center gap-4">
            <div style={{ backgroundColor: YL.primary }} className="p-3 rounded-xl">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-widest" style={{ color: YL.primary }}>Yogurtland</div>
              <h1 className="text-2xl font-extrabold text-gray-800">Admin Mode</h1>
            </div>
          </div>

          {editingStore ? (
            <div className="bg-white rounded-2xl shadow-md p-8 animate-fadeIn">
              <h2 className="text-2xl font-bold mb-1 text-gray-800">{editingStore.name}</h2>
              <p className="text-sm text-gray-400 mb-6">Select flavors and toppings sold at this store.</p>

              <div className="mb-6">
                <h3 className="text-base font-bold mb-3 flex items-center gap-2" style={{ color: YL.primary }}>
                  <IceCream className="w-4 h-4" /> Flavors
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-80 overflow-y-auto pr-1">
                  {Object.keys(flavors).map(flavor => (
                    <label
                      key={flavor}
                      className="flex items-center gap-2 p-3 rounded-xl cursor-pointer transition-colors duration-150 select-none"
                      style={{ backgroundColor: editingStore.flavors.includes(flavor) ? YL.primaryLight : '#F9FAFB' }}
                    >
                      <input
                        type="checkbox"
                        checked={editingStore.flavors.includes(flavor)}
                        onChange={(e) => {
                          const newFlavors = e.target.checked
                            ? [...editingStore.flavors, flavor]
                            : editingStore.flavors.filter(f => f !== flavor);
                          setEditingStore({ ...editingStore, flavors: newFlavors });
                        }}
                        className="w-4 h-4 rounded"
                        style={{ accentColor: YL.primary }}
                      />
                      <span className="text-sm font-medium text-gray-700">{flavor}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-base font-bold mb-3 flex items-center gap-2" style={{ color: YL.green }}>
                  <Sparkles className="w-4 h-4" /> Toppings
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-80 overflow-y-auto pr-1">
                  {Object.keys(toppings).map(topping => (
                    <label
                      key={topping}
                      className="flex items-center gap-2 p-3 rounded-xl cursor-pointer transition-colors duration-150 select-none"
                      style={{ backgroundColor: editingStore.toppings.includes(topping) ? YL.greenLight : '#F9FAFB' }}
                    >
                      <input
                        type="checkbox"
                        checked={editingStore.toppings.includes(topping)}
                        onChange={(e) => {
                          const newToppings = e.target.checked
                            ? [...editingStore.toppings, topping]
                            : editingStore.toppings.filter(t => t !== topping);
                          setEditingStore({ ...editingStore, toppings: newToppings });
                        }}
                        className="w-4 h-4 rounded"
                        style={{ accentColor: YL.green }}
                      />
                      <span className="text-sm font-medium text-gray-700">{topping}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { updateStore(editingStore.id, editingStore); setEditingStore(null); }}
                  style={{ backgroundColor: YL.primary }}
                  className="flex-1 text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingStore(null)}
                  className="flex-1 bg-gray-100 text-gray-600 px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 animate-fadeIn">
              <h2 className="text-xl font-bold text-gray-800">Select Store</h2>
              <input
                type="text"
                placeholder="Search stores..."
                value={adminStoreSearch}
                onChange={(e) => setAdminStoreSearch(e.target.value)}
                className="w-full p-3 border-2 border-gray-200 rounded-xl transition-all duration-200 font-medium text-gray-700 bg-white outline-none focus:border-pink-300"
              />
              <div className="grid gap-2 max-h-[500px] overflow-y-auto pr-1">
                {stores
                  .filter(store => store.name.toLowerCase().includes(adminStoreSearch.toLowerCase()))
                  .map(store => (
                    <button
                      key={store.id}
                      onClick={() => setEditingStore(store)}
                      className="bg-white text-left px-5 py-4 rounded-xl font-medium text-gray-800 transition-all duration-150 shadow-sm hover:shadow-md flex items-center justify-between group"
                      style={{}}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = YL.primary; e.currentTarget.style.color = 'white'; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = ''; }}
                    >
                      <span>{store.name}</span>
                      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
              </div>
              <button
                onClick={() => setIsAdmin(false)}
                className="w-full mt-2 bg-gray-100 text-gray-500 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!selectedStore) {
    return (
      <div style={{ backgroundColor: YL.bg }} className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl text-center max-w-md w-full animate-slideUp overflow-hidden">
          <div style={{ backgroundColor: YL.primary }} className="px-8 pt-10 pb-8">
            <div className="text-5xl mb-3">🍦</div>
            <div className="text-white/60 text-xs font-bold uppercase tracking-[0.3em] mb-1">Yogurtland</div>
            <h1 className="text-3xl font-extrabold text-white leading-tight">
              Find Your Perfect<br />Yogurt Flavor
            </h1>
            <p className="text-white/70 mt-2 text-sm">We will match you with your best combo.</p>
          </div>

          <div className="p-8">
            <div className="mb-4">
              <label className="block text-left text-sm font-semibold text-gray-500 mb-2 flex items-center gap-1.5">
                <Store className="w-4 h-4" /> Select Store
              </label>
              <select
                onChange={(e) => setSelectedStore(e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl font-medium text-gray-700 bg-gray-50 outline-none transition-all duration-200 focus:border-pink-300 appearance-none"
              >
                <option value="">Choose a store</option>
                {stores.map(store => (
                  <option key={store.id} value={store.id}>{store.name}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleFindNearest}
              style={{ backgroundColor: YL.green }}
              className="w-full text-white px-6 py-3.5 rounded-xl font-bold hover:opacity-90 transition-opacity mb-6 flex items-center justify-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              Find Nearest Store
            </button>

            <div className="border-t border-gray-100 pt-5">
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="Admin password"
                  value={adminPassword}
                  onChange={(e) => { setAdminPassword(e.target.value); setAdminError(false); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
                  className={`flex-1 p-3 border-2 rounded-xl text-sm outline-none transition-all duration-200 ${adminError ? 'border-red-400' : 'border-gray-200 focus:border-gray-400'}`}
                />
                <button
                  onClick={handleAdminLogin}
                  className="bg-gray-700 text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors"
                >
                  Admin
                </button>
              </div>
              {adminError && (
                <p className="mt-2 text-sm text-red-500 font-medium text-left">Incorrect password.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (recommendation) {
    const flavorData = flavors[recommendation.flavor] || { category: 'classic', description: 'Delicious yogurt flavor' };
    const flavorCategory = flavorCategories[flavorData.category] || flavorCategories.classic;
    const toppingData = toppings[recommendation.topping] || { category: 'candy', icon: '✨' };

    return (
      <div style={{ backgroundColor: YL.bg }} className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl text-center max-w-lg w-full animate-scaleIn overflow-hidden">
          <div style={{ backgroundColor: YL.primary }} className="px-8 pt-8 pb-6">
            <div className="text-4xl mb-2">🎉</div>
            <div className="text-white/60 text-xs font-bold uppercase tracking-[0.3em] mb-1">Yogurtland</div>
            <h1 className="text-3xl font-extrabold text-white">Your Recommendation!</h1>
            <p className="text-white/70 mt-1 text-sm">This combo best matches your taste.</p>
          </div>

          <div className="p-6 space-y-4">
            <div className="rounded-2xl p-5 text-left" style={{ backgroundColor: YL.primaryLight }}>
              <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: YL.primary }}>
                Recommended Flavor
              </div>
              <div className="flex items-center gap-4">
                <span className="text-5xl">{flavorCategory.icon}</span>
                <div>
                  <div className="text-2xl font-extrabold text-gray-800">{recommendation.flavor || 'None'}</div>
                  <div className="text-sm text-gray-500 mt-0.5">{flavorData.description}</div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl p-5 text-left" style={{ backgroundColor: YL.greenLight }}>
              <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: YL.green }}>
                Recommended Topping
              </div>
              <div className="flex items-center gap-4">
                <span className="text-5xl">{toppingData.icon}</span>
                <div className="text-2xl font-extrabold text-gray-800">{recommendation.topping || 'None'}</div>
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={resetGame}
                style={{ backgroundColor: YL.primary }}
                className="flex-1 text-white px-6 py-3.5 rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              <button
                onClick={() => { resetGame(); setSelectedStore(null); }}
                className="flex-1 bg-gray-100 text-gray-600 px-6 py-3.5 rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <Store className="w-4 h-4" />
                Change Store
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div style={{ backgroundColor: YL.bg }} className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl max-w-2xl w-full animate-slideUp overflow-hidden">
        <div style={{ backgroundColor: YL.primary }} className="px-8 py-5 flex items-center justify-between">
          <div>
            <div className="text-white/60 text-xs font-bold uppercase tracking-widest">Yogurtland</div>
            <div className="text-white font-extrabold text-lg">Taste Test</div>
          </div>
          <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1.5 text-xs text-white font-semibold">
            <Store className="w-3 h-3" />
            {stores.find(s => s.id === selectedStore)?.name}
          </div>
        </div>

        <div className="p-8">
          <div className="mb-6">
            <div className="flex justify-between text-xs font-semibold text-gray-400 mb-2">
              <span>Question {currentQuestion + 1} / {questions.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%`, backgroundColor: YL.primary }}
              />
            </div>
          </div>

          <div className="rounded-2xl p-6 mb-6 text-center" style={{ backgroundColor: YL.primaryLight }}>
            <p className="text-xl font-bold text-gray-800">{questions[currentQuestion].text}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            {questions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                style={{ backgroundColor: YL.primary }}
                className="text-white px-6 py-5 rounded-2xl font-bold text-base hover:opacity-90 active:scale-95 transition-all duration-150 shadow-md text-left relative overflow-hidden group"
              >
                <div className="absolute top-3 right-3 opacity-20 group-hover:opacity-50 transition-opacity">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="text-lg font-extrabold mb-1 leading-tight">{option.label}</div>
                {option.description && (
                  <div className="text-sm opacity-75 font-normal">{option.description}</div>
                )}
              </button>
            ))}
          </div>

          <div className="flex gap-2 justify-center flex-wrap">
            <button
              onClick={resetGame}
              className="bg-gray-100 text-gray-500 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Start Over
            </button>
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="bg-gray-100 text-gray-500 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Previous
            </button>
            <button
              onClick={() => setSelectedStore(null)}
              className="bg-gray-100 text-gray-500 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors flex items-center gap-1.5"
            >
              <Store className="w-3.5 h-3.5" />
              Change Store
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
