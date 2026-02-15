import React, { useState, useEffect } from 'react';
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
      <div className="min-h-screen bg-gray-100 p-8">
        <h1 className="text-3xl font-bold mb-8">관리자 모드</h1>
        {editingStore ? (
          <div>
            <h2 className="text-2xl mb-4">{editingStore.name} 설정</h2>
            <div className="mb-4">
              <h3 className="text-xl mb-2">맛</h3>
              {['바닐라', '초콜릿', '딸기', '민트 초콜릿 칩', '쿠키 앤 크림', '망고', '레몬'].map(flavor => (
                <label key={flavor} className="block">
                  <input
                    type="checkbox"
                    checked={editingStore.flavors.includes(flavor)}
                    onChange={(e) => {
                      const newFlavors = e.target.checked
                        ? [...editingStore.flavors, flavor]
                        : editingStore.flavors.filter(f => f !== flavor);
                      setEditingStore({ ...editingStore, flavors: newFlavors });
                    }}
                  /> {flavor}
                </label>
              ))}
            </div>
            <div className="mb-4">
              <h3 className="text-xl mb-2">토핑</h3>
              {['초콜릿 칩', '카라멜', '과일 토핑', '젤리', '오레오', '쿠키', '크림'].map(topping => (
                <label key={topping} className="block">
                  <input
                    type="checkbox"
                    checked={editingStore.toppings.includes(topping)}
                    onChange={(e) => {
                      const newToppings = e.target.checked
                        ? [...editingStore.toppings, topping]
                        : editingStore.toppings.filter(t => t !== topping);
                      setEditingStore({ ...editingStore, toppings: newToppings });
                    }}
                  /> {topping}
                </label>
              ))}
            </div>
            <button onClick={() => { updateStore(editingStore.id, editingStore); setEditingStore(null); }} className="bg-blue-500 text-white px-4 py-2 rounded mr-2">저장</button>
            <button onClick={() => setEditingStore(null)} className="bg-gray-500 text-white px-4 py-2 rounded">취소</button>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl mb-4">매장 선택</h2>
            {stores.map(store => (
              <button key={store.id} onClick={() => setEditingStore(store)} className="block bg-blue-500 text-white px-4 py-2 rounded mb-2 w-full text-left">
                {store.name}
              </button>
            ))}
            <button onClick={() => setIsAdmin(false)} className="mt-4 bg-red-500 text-white px-4 py-2 rounded">로그아웃</button>
          </div>
        )}
      </div>
    );
  }

  if (!selectedStore) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-200 to-blue-200 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <h1 className="text-3xl font-bold mb-4">아이스크림 맛 테스트</h1>
          <p className="mb-4">매장을 선택하세요</p>
          <select onChange={(e) => setSelectedStore(e.target.value)} className="mb-4 p-2 border rounded w-full">
            <option value="">매장 선택</option>
            {stores.map(store => (
              <option key={store.id} value={store.id}>{store.name}</option>
            ))}
          </select>
          <button onClick={handleFindNearest} className="bg-green-500 text-white px-4 py-2 rounded mb-4 w-full">가까운 매장 찾기</button>
          <div className="mt-4">
            <input
              type="password"
              placeholder="관리자 비밀번호"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="p-2 border rounded mr-2"
            />
            <button onClick={handleAdminLogin} className="bg-gray-500 text-white px-4 py-2 rounded">관리자</button>
          </div>
        </div>
      </div>
    );
  }

  if (recommendation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-200 to-blue-200 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h1 className="text-3xl font-bold mb-4">추천 결과!</h1>
          <p className="text-xl mb-2">맛: {recommendation.flavor || '없음'}</p>
          <p className="text-xl mb-4">토핑: {recommendation.topping || '없음'}</p>
          <button onClick={resetGame} className="bg-blue-500 text-white px-4 py-2 rounded mr-2">다시 하기</button>
          <button onClick={() => { resetGame(); setSelectedStore(null); }} className="bg-gray-500 text-white px-4 py-2 rounded">매장 변경</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 to-blue-200 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
        <h1 className="text-3xl font-bold mb-4">아이스크림 맛 테스트</h1>
        <p className="text-lg mb-6">{questions[currentQuestion].text}</p>
        <div className="flex justify-center space-x-4">
          <button onClick={() => handleAnswer(true)} className="bg-green-500 text-white px-6 py-2 rounded">예</button>
          <button onClick={() => handleAnswer(false)} className="bg-red-500 text-white px-6 py-2 rounded">아니오</button>
        </div>
        <p className="mt-4 text-sm text-gray-500">질문 {currentQuestion + 1} / {questions.length}</p>
        <button onClick={() => setSelectedStore(null)} className="mt-4 bg-gray-500 text-white px-4 py-2 rounded">매장 변경</button>
      </div>
    </div>
  );
}

export default App;