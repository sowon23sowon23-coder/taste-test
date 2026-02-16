import React, { useState, useEffect } from 'react';
import { IceCream, MapPin, CheckCircle, XCircle, Sparkles, Store, ChevronRight, RefreshCw } from 'lucide-react';
import { questions } from './data/questions';
import { stores as initialStores } from './data/stores';

function App() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedStore, setSelectedStore] = useState(null);
  const [scores, setScores] = useState({ flavors: {}, toppings: {} });
  const [recommendation, setRecommendation] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [stores, setStores] = useState(initialStores);
  const [editingStore, setEditingStore] = useState(null);
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

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
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
            alert('근처에 매장이 없습니다.');
          }
        },
        (error) => {
          alert('위치 정보를 가져올 수 없습니다.');
        }
      );
    } else {
      alert('Geolocation이 지원되지 않습니다.');
    }
  };

  const handleAnswer = (yes) => {
    const question = questions[currentQuestion];
    const option = yes ? question.options.yes : question.options.no;

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
      // 추천 계산
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
  };

  const handleAdminLogin = () => {
    if (adminPassword === 'admin1234') {
      setIsAdmin(true);
    } else {
      alert('비밀번호가 틀렸습니다.');
    }
  };

  const updateStore = (storeId, updatedStore) => {
    setStores(stores.map(s => s.id === storeId ? updatedStore : s));
  };

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6 transform hover:scale-[1.01] transition-transform duration-300">
            <div className="flex items-center gap-3 mb-6">
              <Store className="w-8 h-8 text-purple-500" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                관리자 모드
              </h1>
            </div>
          </div>

          {editingStore ? (
            <div className="bg-white rounded-3xl shadow-2xl p-8 animate-fadeIn">
              <h2 className="text-3xl font-bold mb-6 text-gray-800">{editingStore.name} 설정</h2>

              <div className="mb-6">
                <h3 className="text-2xl font-semibold mb-4 text-purple-600 flex items-center gap-2">
                  <IceCream className="w-6 h-6" />
                  맛
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['바닐라', '초콜릿', '딸기', '민트 초콜릿 칩', '쿠키 앤 크림', '망고', '레몬'].map(flavor => (
                    <label key={flavor} className="flex items-center gap-2 p-3 rounded-xl bg-purple-50 hover:bg-purple-100 cursor-pointer transition-colors duration-200">
                      <input
                        type="checkbox"
                        checked={editingStore.flavors.includes(flavor)}
                        onChange={(e) => {
                          const newFlavors = e.target.checked
                            ? [...editingStore.flavors, flavor]
                            : editingStore.flavors.filter(f => f !== flavor);
                          setEditingStore({ ...editingStore, flavors: newFlavors });
                        }}
                        className="w-5 h-5 text-purple-500 rounded focus:ring-2 focus:ring-purple-400"
                      />
                      <span className="font-medium text-gray-700">{flavor}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-2xl font-semibold mb-4 text-pink-600 flex items-center gap-2">
                  <Sparkles className="w-6 h-6" />
                  토핑
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['초콜릿 칩', '카라멜', '과일 토핑', '젤리', '오레오', '쿠키', '크림'].map(topping => (
                    <label key={topping} className="flex items-center gap-2 p-3 rounded-xl bg-pink-50 hover:bg-pink-100 cursor-pointer transition-colors duration-200">
                      <input
                        type="checkbox"
                        checked={editingStore.toppings.includes(topping)}
                        onChange={(e) => {
                          const newToppings = e.target.checked
                            ? [...editingStore.toppings, topping]
                            : editingStore.toppings.filter(t => t !== topping);
                          setEditingStore({ ...editingStore, toppings: newToppings });
                        }}
                        className="w-5 h-5 text-pink-500 rounded focus:ring-2 focus:ring-pink-400"
                      />
                      <span className="font-medium text-gray-700">{topping}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => { updateStore(editingStore.id, editingStore); setEditingStore(null); }}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  저장
                </button>
                <button
                  onClick={() => setEditingStore(null)}
                  className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-300 transform hover:scale-105 transition-all duration-200"
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-fadeIn">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">매장 선택</h2>
              <div className="grid gap-3 max-h-[500px] overflow-y-auto pr-2">
                {stores.map(store => (
                  <button
                    key={store.id}
                    onClick={() => setEditingStore(store)}
                    className="bg-white text-left px-6 py-4 rounded-xl font-medium text-gray-800 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white transform hover:scale-[1.02] transition-all duration-200 shadow-md hover:shadow-xl flex items-center justify-between group"
                  >
                    <span>{store.name}</span>
                    <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
              <button
                onClick={() => setIsAdmin(false)}
                className="w-full mt-6 bg-gradient-to-r from-red-400 to-red-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-red-500 hover:to-red-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                로그아웃
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!selectedStore) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 flex items-center justify-center p-4 animate-gradient">
        <div className="bg-white p-10 rounded-3xl shadow-2xl text-center max-w-md w-full transform hover:scale-[1.02] transition-transform duration-300 animate-slideUp">
          <div className="mb-6 flex justify-center">
            <div className="bg-gradient-to-br from-pink-400 to-purple-400 p-6 rounded-full animate-bounce-slow">
              <IceCream className="w-16 h-16 text-white" />
            </div>
          </div>

          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
            아이스크림 맛 테스트
          </h1>
          <p className="text-gray-600 mb-6 text-lg">당신에게 딱 맞는 맛을 찾아드려요! 🍨</p>

          <div className="mb-6">
            <label className="block text-left text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Store className="w-4 h-4" />
              매장을 선택하세요
            </label>
            <select
              onChange={(e) => setSelectedStore(e.target.value)}
              className="w-full p-4 border-2 border-purple-200 rounded-xl focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all duration-200 font-medium text-gray-700 bg-purple-50 hover:bg-purple-100"
            >
              <option value="">매장 선택</option>
              {stores.map(store => (
                <option key={store.id} value={store.id}>{store.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleFindNearest}
            className="w-full bg-gradient-to-r from-green-400 to-emerald-500 text-white px-6 py-4 rounded-xl font-semibold hover:from-green-500 hover:to-emerald-600 transform hover:scale-105 transition-all duration-200 shadow-lg mb-6 flex items-center justify-center gap-2"
          >
            <MapPin className="w-5 h-5" />
            가까운 매장 찾기
          </button>

          <div className="border-t-2 border-gray-200 pt-6">
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="관리자 비밀번호"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="flex-1 p-3 border-2 border-gray-200 rounded-xl focus:border-gray-400 focus:ring-4 focus:ring-gray-100 transition-all duration-200"
              />
              <button
                onClick={handleAdminLogin}
                className="bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-700 transform hover:scale-105 transition-all duration-200 shadow-md"
              >
                관리자
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (recommendation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 flex items-center justify-center p-4 animate-gradient">
        <div className="bg-white p-10 rounded-3xl shadow-2xl text-center max-w-lg w-full animate-scaleIn">
          <div className="mb-6 flex justify-center">
            <div className="bg-gradient-to-br from-yellow-400 to-orange-400 p-6 rounded-full animate-spin-slow">
              <Sparkles className="w-20 h-20 text-white" />
            </div>
          </div>

          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
            추천 결과!
          </h1>

          <div className="space-y-4 mb-8">
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-6 rounded-2xl border-2 border-pink-200 transform hover:scale-105 transition-transform duration-200">
              <div className="flex items-center justify-center gap-3 mb-2">
                <IceCream className="w-6 h-6 text-pink-500" />
                <p className="text-sm font-semibold text-purple-600 uppercase tracking-wider">맛</p>
              </div>
              <p className="text-3xl font-bold text-gray-800">{recommendation.flavor || '없음'}</p>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-2xl border-2 border-purple-200 transform hover:scale-105 transition-transform duration-200">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Sparkles className="w-6 h-6 text-purple-500" />
                <p className="text-sm font-semibold text-purple-600 uppercase tracking-wider">토핑</p>
              </div>
              <p className="text-3xl font-bold text-gray-800">{recommendation.topping || '없음'}</p>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={resetGame}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-4 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              다시 하기
            </button>
            <button
              onClick={() => { resetGame(); setSelectedStore(null); }}
              className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-4 rounded-xl font-semibold hover:from-gray-600 hover:to-gray-700 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
            >
              <Store className="w-5 h-5" />
              매장 변경
            </button>
          </div>
        </div>
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 flex items-center justify-center p-4 animate-gradient">
      <div className="bg-white p-10 rounded-3xl shadow-2xl text-center max-w-2xl w-full animate-slideUp">
        <div className="mb-6 flex justify-center">
          <div className="bg-gradient-to-br from-pink-400 to-purple-400 p-4 rounded-full">
            <IceCream className="w-12 h-12 text-white" />
          </div>
        </div>

        <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
          아이스크림 맛 테스트
        </h1>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm font-semibold text-gray-600 mb-2">
            <span>질문 {currentQuestion + 1} / {questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white opacity-20 animate-shimmer"></div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-8 rounded-2xl mb-8 border-2 border-purple-200">
          <p className="text-2xl font-semibold text-gray-800">{questions[currentQuestion].text}</p>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => handleAnswer(true)}
            className="flex-1 bg-gradient-to-r from-green-400 to-emerald-500 text-white px-8 py-6 rounded-2xl font-bold text-xl hover:from-green-500 hover:to-emerald-600 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center gap-3 group"
          >
            <CheckCircle className="w-8 h-8 group-hover:animate-bounce" />
            예
          </button>
          <button
            onClick={() => handleAnswer(false)}
            className="flex-1 bg-gradient-to-r from-red-400 to-pink-500 text-white px-8 py-6 rounded-2xl font-bold text-xl hover:from-red-500 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center gap-3 group"
          >
            <XCircle className="w-8 h-8 group-hover:animate-bounce" />
            아니오
          </button>
        </div>

        <button
          onClick={() => setSelectedStore(null)}
          className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-300 transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 mx-auto"
        >
          <Store className="w-4 h-4" />
          매장 변경
        </button>
      </div>
    </div>
  );
}

export default App;
