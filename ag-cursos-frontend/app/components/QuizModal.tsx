'use client';
import { useEffect, useState } from 'react';
import { API_URL } from '../lib/api';

type Option   = { id: string; text: string; isCorrect: boolean };
type Question = { id: string; text: string; type: string; order: number; options: Option[] };
type QuizData = { id: string; passingScore: number; maxAttempts: number; attemptCount: number; canAttempt: boolean; questions: Question[] };
type AttemptSummary = { id: string; score: number; passed: boolean; completedAt: string };
type SubmitResult = { score: number; passed: boolean; attemptNumber: number; results: { questionId: string; correct: boolean; correctOptionId: string }[] };

type Phase = 'loading' | 'no_quiz' | 'intro' | 'taking' | 'submitting' | 'results';

type Answer = { questionId: string; optionId: string };

export default function QuizModal({
  moduleId, moduleTitle, token, onClose,
}: {
  moduleId: string;
  moduleTitle: string;
  token: string;
  onClose: () => void;
}) {
  const [phase, setPhase]               = useState<Phase>('loading');
  const [quiz, setQuiz]                 = useState<QuizData | null>(null);
  const [attempts, setAttempts]         = useState<AttemptSummary[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedId, setSelectedId]     = useState<string | null>(null);
  const [revealed, setRevealed]         = useState(false);
  const [collected, setCollected]       = useState<Answer[]>([]);
  const [result, setResult]             = useState<SubmitResult | null>(null);

  const authJson = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/modules/${moduleId}/quiz/take`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ]).then(([quizData]) => {
      if (!quizData || !quizData.id) { setPhase('no_quiz'); return; }
      setQuiz(quizData);

      fetch(`${API_URL}/quiz/${quizData.id}/my-attempts`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json()).then(setAttempts).catch(() => {});

      setPhase('intro');
    }).catch(() => setPhase('no_quiz'));
  }, [moduleId, token]);

  const startQuiz = () => {
    setCurrentIndex(0);
    setCollected([]);
    setSelectedId(null);
    setRevealed(false);
    setResult(null);
    setPhase('taking');
  };

  const handleConfirm = () => setRevealed(true);

  const handleNext = async () => {
    if (!quiz) return;
    const answer: Answer = { questionId: quiz.questions[currentIndex].id, optionId: selectedId! };
    const newCollected = [...collected, answer];
    setCollected(newCollected);

    if (currentIndex < quiz.questions.length - 1) {
      setCurrentIndex(i => i + 1);
      setSelectedId(null);
      setRevealed(false);
    } else {
      setPhase('submitting');
      try {
        const res = await fetch(`${API_URL}/quiz/${quiz.id}/attempt`, {
          method: 'POST', headers: authJson, body: JSON.stringify({ answers: newCollected }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Error');
        setResult(data);
        setAttempts(prev => [{ id: Date.now().toString(), score: data.score, passed: data.passed, completedAt: new Date().toISOString() }, ...prev]);
        setQuiz(q => q ? { ...q, attemptCount: q.attemptCount + 1, canAttempt: q.maxAttempts === 0 || q.attemptCount + 1 < q.maxAttempts } : q);
        setPhase('results');
      } catch (e: any) {
        alert(e.message);
        setPhase('intro');
      }
    }
  };

  // --- Render helpers ---
  const currentQuestion = quiz?.questions[currentIndex];

  const attemptsLabel = () => {
    if (!quiz) return '';
    if (quiz.maxAttempts === 0) return 'Intentos ilimitados';
    const left = quiz.maxAttempts - quiz.attemptCount;
    return `${left} intento${left !== 1 ? 's' : ''} restante${left !== 1 ? 's' : ''}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white rounded-t-2xl">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Cuestionario</p>
            <h2 className="font-bold text-gray-900 text-lg leading-tight">{moduleTitle}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition text-2xl leading-none">&times;</button>
        </div>

        <div className="px-6 py-6">

          {/* Loading */}
          {phase === 'loading' && <p className="text-center text-gray-400 py-8">Cargando cuestionario...</p>}

          {/* No quiz */}
          {phase === 'no_quiz' && <p className="text-center text-gray-500 py-8">Este módulo no tiene cuestionario.</p>}

          {/* Submitting */}
          {phase === 'submitting' && <p className="text-center text-gray-400 py-8">Enviando respuestas...</p>}

          {/* Intro */}
          {phase === 'intro' && quiz && (
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-1 bg-purple-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-purple-700">{quiz.passingScore}%</p>
                  <p className="text-xs text-purple-500 mt-1">Puntaje mínimo</p>
                </div>
                <div className="flex-1 bg-blue-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-blue-700">{quiz.questions.length}</p>
                  <p className="text-xs text-blue-500 mt-1">Pregunta{quiz.questions.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="flex-1 bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-gray-700">{quiz.maxAttempts === 0 ? '∞' : quiz.maxAttempts - quiz.attemptCount}</p>
                  <p className="text-xs text-gray-500 mt-1">{quiz.maxAttempts === 0 ? 'Sin límite' : 'Intentos restantes'}</p>
                </div>
              </div>

              {quiz.canAttempt ? (
                <button onClick={startQuiz} className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-purple-700 transition">
                  Comenzar cuestionario
                </button>
              ) : (
                <div className="text-center bg-red-50 border border-red-200 rounded-xl py-4 px-6">
                  <p className="text-red-600 font-semibold">Ya agotaste todos tus intentos.</p>
                </div>
              )}

              {attempts.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Intentos anteriores</p>
                  <div className="space-y-2">
                    {attempts.map((a, i) => (
                      <div key={a.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                        <span className="text-sm text-gray-600">Intento {attempts.length - i}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-gray-800">{Math.round(a.score)}%</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${a.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                            {a.passed ? 'Aprobado' : 'Reprobado'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Taking */}
          {phase === 'taking' && quiz && currentQuestion && (
            <div className="space-y-5">
              {/* Progress */}
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Pregunta {currentIndex + 1} de {quiz.questions.length}</span>
                  <span className={`px-2 py-0.5 rounded-full font-medium ${currentQuestion.type === 'TRUE_FALSE' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                    {currentQuestion.type === 'TRUE_FALSE' ? 'V / F' : 'Múltiple opción'}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className="bg-purple-500 h-1.5 rounded-full transition-all" style={{ width: `${((currentIndex) / quiz.questions.length) * 100}%` }} />
                </div>
              </div>

              {/* Question */}
              <p className="text-base font-semibold text-gray-800">{currentQuestion.text}</p>

              {/* Options */}
              <div className="space-y-2">
                {currentQuestion.options.map(opt => {
                  const isSelected = selectedId === opt.id;
                  const isCorrect = opt.isCorrect;
                  let style = 'border-gray-200 bg-white hover:bg-gray-50';
                  if (revealed) {
                    if (isCorrect) style = 'border-green-400 bg-green-50';
                    else if (isSelected && !isCorrect) style = 'border-red-300 bg-red-50';
                    else style = 'border-gray-200 bg-white opacity-60';
                  } else if (isSelected) {
                    style = 'border-purple-400 bg-purple-50';
                  }

                  return (
                    <button
                      key={opt.id}
                      onClick={() => !revealed && setSelectedId(opt.id)}
                      disabled={revealed}
                      className={`w-full text-left border rounded-xl px-4 py-3 text-sm transition flex items-center gap-3 ${style}`}
                    >
                      <span className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center text-xs font-bold
                        ${revealed && isCorrect ? 'border-green-500 bg-green-500 text-white' :
                          revealed && isSelected && !isCorrect ? 'border-red-400 bg-red-400 text-white' :
                          isSelected ? 'border-purple-500 bg-purple-500 text-white' : 'border-gray-300'}`}>
                        {revealed && isCorrect ? '✓' : revealed && isSelected && !isCorrect ? '✕' : isSelected ? '●' : ''}
                      </span>
                      <span className={revealed && isCorrect ? 'font-semibold text-green-800' : ''}>{opt.text}</span>
                    </button>
                  );
                })}
              </div>

              {/* Feedback */}
              {revealed && (
                <div className={`rounded-xl px-4 py-3 text-sm font-medium ${
                  currentQuestion.options.find(o => o.id === selectedId)?.isCorrect
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {currentQuestion.options.find(o => o.id === selectedId)?.isCorrect
                    ? '¡Correcto!'
                    : `Incorrecto. La respuesta correcta es: "${currentQuestion.options.find(o => o.isCorrect)?.text}"`
                  }
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                {!revealed ? (
                  <button
                    onClick={handleConfirm}
                    disabled={!selectedId}
                    className="bg-purple-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-purple-700 transition disabled:opacity-50"
                  >
                    Confirmar respuesta
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="bg-purple-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-purple-700 transition"
                  >
                    {currentIndex < quiz.questions.length - 1 ? 'Siguiente →' : 'Ver mi resultado'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Results */}
          {phase === 'results' && result && quiz && (
            <div className="space-y-6 text-center">
              <div className={`rounded-2xl p-8 ${result.passed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <p className={`text-6xl font-black mb-2 ${result.passed ? 'text-green-600' : 'text-red-500'}`}>
                  {Math.round(result.score)}%
                </p>
                <p className={`text-lg font-bold ${result.passed ? 'text-green-700' : 'text-red-600'}`}>
                  {result.passed ? '¡Aprobaste!' : 'No aprobaste'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {result.passed
                    ? `Superaste el mínimo de ${quiz.passingScore}%`
                    : `Necesitás al menos ${quiz.passingScore}% para aprobar`}
                </p>
              </div>

              <div className="flex gap-3">
                {quiz.canAttempt && (
                  <button onClick={startQuiz} className="flex-1 border border-purple-600 text-purple-600 py-2.5 rounded-xl font-semibold hover:bg-purple-50 transition">
                    Reintentar
                  </button>
                )}
                <button onClick={onClose} className="flex-1 bg-purple-600 text-white py-2.5 rounded-xl font-semibold hover:bg-purple-700 transition">
                  Volver al módulo
                </button>
              </div>

              {attempts.length > 1 && (
                <div className="text-left">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Historial</p>
                  <div className="space-y-2">
                    {attempts.map((a, i) => (
                      <div key={a.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                        <span className="text-sm text-gray-600">Intento {attempts.length - i}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-gray-800">{Math.round(a.score)}%</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${a.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                            {a.passed ? 'Aprobado' : 'Reprobado'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
