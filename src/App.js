import React, { useMemo, useState } from 'react';
import { questions } from './data/questions';
import { flavorCategories, flavors, toppings } from './data/flavors';

const YL = {
  primary: '#960853',
  primaryLight: '#fff0f5',
  green: '#8dc63f',
  greenLight: '#f2f9e8',
  bg: '#fff5f8',
  paper: '#fffdf8',
  ink: '#2f2330'
};

const INITIAL_STATE = {
  stage: 'home',
  currentQuestion: 0,
  answerHistory: [],
  recommendation: null
};

function App() {
  const [{ stage, currentQuestion, answerHistory, recommendation }, setState] = useState(INITIAL_STATE);

  const progress = useMemo(
    () => ((currentQuestion + 1) / questions.length) * 100,
    [currentQuestion]
  );

  const resetToHome = () => setState(INITIAL_STATE);

  const startTest = () => {
    setState({
      stage: 'play',
      currentQuestion: 0,
      answerHistory: [],
      recommendation: null
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
    const newHistory = [...answerHistory, optionIndex];

    if (currentQuestion < questions.length - 1) {
      setState((current) => ({
        ...current,
        answerHistory: newHistory,
        currentQuestion: current.currentQuestion + 1
      }));
      return;
    }

    const scores = recomputeScores(newHistory);
    const matchedFlavor =
      Object.entries(scores.flavors)
        .sort((left, right) => right[1] - left[1])
        .map(([flavor]) => flavor)[0] || 'Vanilla';
    const matchedToppings = Object.entries(scores.toppings)
      .sort((left, right) => right[1] - left[1])
      .slice(0, 2)
      .map(([topping]) => topping);
    const matchedPersonality =
      Object.entries(scores.personalities)
        .sort((left, right) => right[1] - left[1])
        .map(([personality]) => personality)[0] || 'Flavor Match';

    setState({
      stage: 'result',
      currentQuestion,
      answerHistory: newHistory,
      recommendation: {
        flavor: matchedFlavor,
        toppings: matchedToppings,
        personality: matchedPersonality,
        description: flavors[matchedFlavor]?.description || 'A Yogurtland combo shaped by your answers.'
      }
    });
  };

  const handlePrevious = () => {
    if (currentQuestion === 0) {
      return;
    }

    setState((current) => ({
      ...current,
      currentQuestion: current.currentQuestion - 1,
      answerHistory: current.answerHistory.slice(0, -1)
    }));
  };

  if (stage === 'home') {
    return (
      <div
        className="min-h-screen px-4 py-6 md:px-6 md:py-10"
        style={{ background: `radial-gradient(circle at top left, ${YL.primaryLight} 0%, ${YL.bg} 45%, ${YL.paper} 100%)` }}
      >
        <div className="mx-auto max-w-4xl overflow-hidden rounded-[32px] bg-white shadow-xl">
          <div className="grid gap-0 md:grid-cols-[1.1fr_0.9fr]">
            <section className="p-8 md:p-12">
              <div className="text-xs font-black uppercase tracking-[0.28em]" style={{ color: YL.primary }}>
                Yogurtland
              </div>
              <h1 className="mt-4 text-4xl font-black leading-tight md:text-5xl" style={{ color: YL.ink }}>
                Taste Test
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-gray-600">
                Answer a few quick questions and get a flavor and topping match based on your taste.
              </p>
              <button
                type="button"
                onClick={startTest}
                className="mt-8 rounded-2xl px-6 py-4 text-base font-bold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: YL.primary }}
              >
                Start Taste Test
              </button>
            </section>
            <aside className="flex items-center justify-center p-8 md:p-12" style={{ backgroundColor: YL.primaryLight }}>
              <div className="w-full max-w-sm rounded-[28px] bg-white p-6 shadow-md">
                <div className="text-sm font-bold" style={{ color: YL.primary }}>
                  What stays
                </div>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-gray-600">
                  <li>Flavor quiz only</li>
                  <li>Question-by-question flow</li>
                  <li>Final flavor and topping recommendation</li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'play') {
    const question = questions[currentQuestion];

    return (
      <div className="min-h-screen px-4 py-6 md:px-6 md:py-10" style={{ backgroundColor: YL.bg }}>
        <div className="mx-auto max-w-4xl overflow-hidden rounded-[32px] bg-white shadow-xl">
          <div className="border-b border-black/5 px-6 py-6 md:px-8" style={{ backgroundColor: YL.primary }}>
            <div className="text-xs font-black uppercase tracking-[0.28em] text-white/70">Taste Test</div>
            <div className="mt-2 text-2xl font-black text-white md:text-3xl">Find your flavor match</div>
          </div>
          <div className="p-6 md:p-8">
            <div className="mb-6">
              <div className="mb-2 flex justify-between text-xs font-semibold text-gray-400">
                <span>
                  Question {currentQuestion + 1} / {questions.length}
                </span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${progress}%`, backgroundColor: YL.primary }}
                />
              </div>
            </div>

            <div className="rounded-[28px] p-6 text-center md:p-8" style={{ backgroundColor: YL.primaryLight }}>
              <p className="text-2xl font-black leading-tight text-gray-800">{question.text}</p>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {question.options.map((option, index) => (
                <button
                  key={`${question.id}-${option.label}`}
                  type="button"
                  onClick={() => handleAnswer(index)}
                  className="rounded-[28px] px-5 py-5 text-left text-white shadow-md transition-all hover:opacity-90 active:scale-[0.99]"
                  style={{ backgroundColor: YL.primary }}
                >
                  <div className="text-lg font-extrabold">{option.label}</div>
                  <div className="mt-1 text-sm leading-6 text-white/80">{option.description}</div>
                </button>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={resetToHome}
                className="rounded-2xl bg-gray-100 px-5 py-3 text-sm font-bold text-gray-600 transition-colors hover:bg-gray-200"
              >
                Home
              </button>
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="rounded-2xl bg-gray-100 px-5 py-3 text-sm font-bold text-gray-600 transition-colors hover:bg-gray-200 disabled:opacity-40"
              >
                Previous
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const flavorData = flavors[recommendation?.flavor] || flavors.Vanilla;
  const flavorCategory = flavorCategories[flavorData.category] || flavorCategories.classic;

  return (
    <div className="min-h-screen px-4 py-6 md:px-6 md:py-10" style={{ backgroundColor: YL.bg }}>
      <div className="mx-auto max-w-4xl overflow-hidden rounded-[32px] bg-white shadow-xl">
        <div className="px-6 py-8 md:px-8" style={{ background: `linear-gradient(135deg, ${YL.primaryLight} 0%, #ffffff 100%)` }}>
          <div className="text-xs font-black uppercase tracking-[0.28em]" style={{ color: YL.primary }}>
            Your Result
          </div>
          <h1 className="mt-3 text-3xl font-black leading-tight md:text-4xl" style={{ color: YL.ink }}>
            {recommendation?.personality}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">{recommendation?.description}</p>
        </div>

        <div className="grid gap-4 p-6 md:grid-cols-2 md:p-8">
          <section className="rounded-[28px] p-6" style={{ backgroundColor: YL.primaryLight }}>
            <div className="text-xs font-black uppercase tracking-[0.24em]" style={{ color: YL.primary }}>
              Flavor
            </div>
            <div className="mt-4 text-5xl">{flavorCategory.icon}</div>
            <div className="mt-4 text-2xl font-extrabold text-gray-800">{recommendation?.flavor}</div>
            <div className="mt-2 text-sm leading-6 text-gray-600">{flavorData.description}</div>
          </section>

          <section className="rounded-[28px] p-6" style={{ backgroundColor: YL.greenLight }}>
            <div className="text-xs font-black uppercase tracking-[0.24em]" style={{ color: YL.green }}>
              Toppings
            </div>
            <div className="mt-4 space-y-3">
              {(recommendation?.toppings || []).map((topping) => (
                <div key={topping} className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3">
                  <span className="text-3xl">{toppings[topping]?.icon || '🍬'}</span>
                  <span className="text-lg font-bold text-gray-800">{topping}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-3 px-6 pb-8 md:flex-row md:justify-center md:px-8">
          <button
            type="button"
            onClick={startTest}
            className="rounded-2xl px-6 py-4 text-base font-bold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: YL.primary }}
          >
            Retake Test
          </button>
          <button
            type="button"
            onClick={resetToHome}
            className="rounded-2xl bg-gray-100 px-6 py-4 text-base font-bold text-gray-600 transition-colors hover:bg-gray-200"
          >
            Back Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
