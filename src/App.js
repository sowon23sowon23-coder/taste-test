import React, { useState } from 'react';

const questions = [
  { text: "달콤한 아이스크림을 좋아하세요?", flavors: { vanilla: 1, chocolate: 1, strawberry: 1 } },
  { text: "과일 맛 아이스크림을 좋아하세요?", flavors: { strawberry: 2, vanilla: 0.5 } },
  { text: "초콜릿 맛을 좋아하세요?", flavors: { chocolate: 2, mint: 0.5 } },
  { text: "민트 맛을 좋아하세요?", flavors: { mint: 2 } },
  { text: "쿠키나 크림 같은 텍스처를 좋아하세요?", flavors: { cookies: 2, chocolate: 0.5 } },
];

const iceCreams = {
  vanilla: "바닐라",
  chocolate: "초콜릿",
  strawberry: "딸기",
  mint: "민트 초콜릿 칩",
  cookies: "쿠키 앤 크림",
};

function App() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [scores, setScores] = useState({ vanilla: 0, chocolate: 0, strawberry: 0, mint: 0, cookies: 0 });
  const [recommendation, setRecommendation] = useState(null);

  const handleAnswer = (yes) => {
    if (yes) {
      const newScores = { ...scores };
      Object.keys(questions[currentQuestion].flavors).forEach(flavor => {
        newScores[flavor] += questions[currentQuestion].flavors[flavor];
      });
      setScores(newScores);
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // 추천 계산
      const maxFlavor = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
      setRecommendation(iceCreams[maxFlavor]);
    }
  };

  if (recommendation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-200 to-blue-200 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h1 className="text-3xl font-bold mb-4">추천 아이스크림!</h1>
          <p className="text-xl">{recommendation}</p>
          <button onClick={() => { setCurrentQuestion(0); setScores({ vanilla: 0, chocolate: 0, strawberry: 0, mint: 0, cookies: 0 }); setRecommendation(null); }} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">다시 하기</button>
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
      </div>
    </div>
  );
}

export default App;