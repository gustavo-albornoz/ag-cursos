'use client';
import { useEffect, useState } from 'react';
import { API_URL } from '../lib/api';

type OptionData  = { id: string; text: string; isCorrect: boolean };
type QuestionData = { id: string; text: string; type: string; order: number; options: OptionData[] };
type QuizData    = { id: string; passingScore: number; maxAttempts: number; questions: QuestionData[] };
type OptionDraft  = { text: string; isCorrect: boolean };
type QuestionDraft = { text: string; type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE'; options: OptionDraft[] };

function emptyDraft(type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE'): QuestionDraft {
  if (type === 'TRUE_FALSE')
    return { text: '', type, options: [{ text: 'Verdadero', isCorrect: true }, { text: 'Falso', isCorrect: false }] };
  return { text: '', type, options: [{ text: '', isCorrect: true }, { text: '', isCorrect: false }] };
}

function draftFrom(q: QuestionData): QuestionDraft {
  return { text: q.text, type: q.type as 'MULTIPLE_CHOICE' | 'TRUE_FALSE', options: q.options.map(o => ({ text: o.text, isCorrect: o.isCorrect })) };
}

// ---------- Formulario de pregunta ----------
function QuestionForm({
  draft, onChange, onSave, onCancel, saving, error,
}: {
  draft: QuestionDraft;
  onChange: (d: QuestionDraft) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  error: string;
}) {
  const setType = (type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE') => onChange(emptyDraft(type));

  const setCorrect = (i: number) =>
    onChange({ ...draft, options: draft.options.map((o, idx) => ({ ...o, isCorrect: idx === i })) });

  const setOptionText = (i: number, text: string) =>
    onChange({ ...draft, options: draft.options.map((o, idx) => idx === i ? { ...o, text } : o) });

  const addOption  = () => onChange({ ...draft, options: [...draft.options, { text: '', isCorrect: false }] });
  const dropOption = (i: number) => onChange({ ...draft, options: draft.options.filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-4 bg-white border rounded-xl p-5">
      {/* Tipo */}
      <div className="flex gap-5">
        {(['MULTIPLE_CHOICE', 'TRUE_FALSE'] as const).map(t => (
          <label key={t} className="flex items-center gap-2 cursor-pointer text-sm font-medium">
            <input type="radio" checked={draft.type === t} onChange={() => setType(t)} className="accent-purple-600" />
            {t === 'MULTIPLE_CHOICE' ? 'Múltiple opción' : 'Verdadero / Falso'}
          </label>
        ))}
      </div>

      {/* Texto de la pregunta */}
      <textarea
        value={draft.text}
        onChange={e => onChange({ ...draft, text: e.target.value })}
        placeholder="Escribí la pregunta..."
        rows={2}
        className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
      />

      {/* Opciones */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Opciones <span className="text-gray-400 normal-case">(seleccioná la correcta)</span>
        </p>
        {draft.options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <input type="radio" checked={opt.isCorrect} onChange={() => setCorrect(i)} className="flex-shrink-0 accent-purple-600" />
            {draft.type === 'TRUE_FALSE' ? (
              <span className="flex-1 text-sm text-gray-700 px-4 py-2 bg-gray-50 rounded-lg border">{opt.text}</span>
            ) : (
              <input
                value={opt.text}
                onChange={e => setOptionText(i, e.target.value)}
                placeholder={`Opción ${i + 1}`}
                className="flex-1 border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            )}
            {draft.type === 'MULTIPLE_CHOICE' && draft.options.length > 2 && (
              <button type="button" onClick={() => dropOption(i)} className="text-red-400 hover:text-red-600 text-sm leading-none">✕</button>
            )}
          </div>
        ))}
        {draft.type === 'MULTIPLE_CHOICE' && (
          <button type="button" onClick={addOption} className="text-sm text-purple-600 hover:text-purple-800 font-medium">
            + Agregar opción
          </button>
        )}
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-2">
        <button
          type="button" onClick={onSave} disabled={saving || !draft.text.trim()}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition disabled:opacity-60"
        >
          {saving ? 'Guardando...' : 'Guardar pregunta'}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-sm font-medium border hover:bg-gray-50 transition">
          Cancelar
        </button>
      </div>
    </div>
  );
}

// ---------- Editor principal ----------
export default function QuizEditor({ moduleId, token }: { moduleId: string; token: string }) {
  const [quiz, setQuiz]         = useState<QuizData | null | undefined>(undefined); // undefined = cargando
  const [settings, setSettings] = useState({ passingScore: 70, maxAttempts: 0 });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsError, setSettingsError]   = useState('');

  const [addingQuestion, setAddingQuestion] = useState(false);
  const [addDraft,  setAddDraft]  = useState<QuestionDraft>(emptyDraft('MULTIPLE_CHOICE'));
  const [savingAdd, setSavingAdd] = useState(false);
  const [addError,  setAddError]  = useState('');

  const [editingId,  setEditingId]  = useState<string | null>(null);
  const [editDraft,  setEditDraft]  = useState<QuestionDraft>(emptyDraft('MULTIPLE_CHOICE'));
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError,  setEditError]  = useState('');

  const authJson = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
  const authOnly = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetch(`${API_URL}/modules/${moduleId}/quiz`, { headers: authOnly })
      .then(r => r.json())
      .then(data => {
        setQuiz(data || null);
        if (data) setSettings({ passingScore: data.passingScore, maxAttempts: data.maxAttempts });
      })
      .catch(() => setQuiz(null));
  }, [moduleId]);

  const handleUpsertSettings = async () => {
    setSavingSettings(true); setSettingsError('');
    try {
      const res = await fetch(`${API_URL}/modules/${moduleId}/quiz`, { method: 'PUT', headers: authJson, body: JSON.stringify(settings) });
      if (!res.ok) throw new Error('Error al guardar');
      setQuiz(await res.json());
    } catch (e: any) { setSettingsError(e.message); }
    finally { setSavingSettings(false); }
  };

  const handleDeleteQuiz = async () => {
    if (!confirm('¿Eliminar el cuestionario y todas sus preguntas?')) return;
    await fetch(`${API_URL}/modules/${moduleId}/quiz`, { method: 'DELETE', headers: authOnly });
    setQuiz(null);
    setSettings({ passingScore: 70, maxAttempts: 0 });
  };

  const handleAddQuestion = async () => {
    if (!quiz) return;
    setSavingAdd(true); setAddError('');
    try {
      const res = await fetch(`${API_URL}/quiz/${quiz.id}/questions`, { method: 'POST', headers: authJson, body: JSON.stringify(addDraft) });
      if (!res.ok) { const b = await res.json(); throw new Error(b.message || 'Error'); }
      const newQ = await res.json();
      setQuiz(q => q ? { ...q, questions: [...q.questions, newQ] } : q);
      setAddDraft(emptyDraft('MULTIPLE_CHOICE'));
      setAddingQuestion(false);
    } catch (e: any) { setAddError(e.message); }
    finally { setSavingAdd(false); }
  };

  const handleUpdateQuestion = async () => {
    if (!editingId) return;
    setSavingEdit(true); setEditError('');
    try {
      const res = await fetch(`${API_URL}/questions/${editingId}`, { method: 'PATCH', headers: authJson, body: JSON.stringify(editDraft) });
      if (!res.ok) { const b = await res.json(); throw new Error(b.message || 'Error'); }
      const updated = await res.json();
      setQuiz(q => q ? { ...q, questions: q.questions.map(x => x.id === editingId ? updated : x) } : q);
      setEditingId(null);
    } catch (e: any) { setEditError(e.message); }
    finally { setSavingEdit(false); }
  };

  const handleDeleteQuestion = async (qId: string) => {
    if (!confirm('¿Eliminar esta pregunta?')) return;
    await fetch(`${API_URL}/questions/${qId}`, { method: 'DELETE', headers: authOnly });
    setQuiz(q => q ? { ...q, questions: q.questions.filter(x => x.id !== qId) } : q);
  };

  const startEdit = (q: QuestionData) => { setEditingId(q.id); setEditDraft(draftFrom(q)); setEditError(''); };

  if (quiz === undefined)
    return <p className="text-sm text-gray-400 py-2">Cargando cuestionario...</p>;

  // ---------- Configuración (compartida entre "sin quiz" y "con quiz") ----------
  const SettingsFields = ({ label }: { label: string }) => (
    <div className="flex flex-wrap gap-4 items-end">
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Puntaje mínimo (%)</label>
        <input type="number" min={0} max={100} value={settings.passingScore}
          onChange={e => setSettings(s => ({ ...s, passingScore: +e.target.value }))}
          className="w-28 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Reintentos (0 = ilimitados)</label>
        <input type="number" min={0} value={settings.maxAttempts}
          onChange={e => setSettings(s => ({ ...s, maxAttempts: +e.target.value }))}
          className="w-36 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>
      <button onClick={handleUpsertSettings} disabled={savingSettings}
        className="bg-purple-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition disabled:opacity-60">
        {savingSettings ? 'Guardando...' : label}
      </button>
      {quiz && (
        <button onClick={handleDeleteQuiz} className="ml-auto text-sm text-red-400 hover:text-red-600 font-medium transition">
          Eliminar cuestionario
        </button>
      )}
      {settingsError && <p className="w-full text-red-500 text-sm">{settingsError}</p>}
    </div>
  );

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Cuestionario del módulo</h3>

      {/* Configuración */}
      <div className={quiz ? 'mb-6 pb-5 border-b' : 'mb-2'}>
        <SettingsFields label={quiz ? 'Guardar configuración' : 'Crear cuestionario'} />
      </div>

      {!quiz && <p className="text-xs text-gray-400">Creá el cuestionario primero para poder agregar preguntas.</p>}

      {/* Preguntas */}
      {quiz && (
        <>
          <div className="space-y-3 mb-5">
            {quiz.questions.length === 0 && (
              <p className="text-sm text-gray-400">Todavía no hay preguntas. Agregá la primera.</p>
            )}
            {quiz.questions.map((q, i) =>
              editingId === q.id ? (
                <QuestionForm key={q.id} draft={editDraft} onChange={setEditDraft}
                  onSave={handleUpdateQuestion} onCancel={() => setEditingId(null)}
                  saving={savingEdit} error={editError} />
              ) : (
                <div key={q.id} className="bg-white border rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-start gap-2">
                      <span className="bg-purple-100 text-purple-700 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-sm font-medium text-gray-800">{q.text}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${q.type === 'TRUE_FALSE' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                      {q.type === 'TRUE_FALSE' ? 'V/F' : 'MC'}
                    </span>
                  </div>
                  <ul className="space-y-1 ml-8">
                    {q.options.map(opt => (
                      <li key={opt.id} className={`text-xs flex items-center gap-1.5 ${opt.isCorrect ? 'text-green-600 font-semibold' : 'text-gray-500'}`}>
                        <span>{opt.isCorrect ? '✓' : '○'}</span> {opt.text}
                      </li>
                    ))}
                  </ul>
                  <div className="flex gap-3 mt-3 ml-8">
                    <button onClick={() => startEdit(q)} className="text-xs text-blue-500 hover:text-blue-700 font-medium">Editar</button>
                    <button onClick={() => handleDeleteQuestion(q.id)} className="text-xs text-red-400 hover:text-red-600 font-medium">Eliminar</button>
                  </div>
                </div>
              )
            )}
          </div>

          {addingQuestion ? (
            <QuestionForm draft={addDraft} onChange={setAddDraft}
              onSave={handleAddQuestion}
              onCancel={() => { setAddingQuestion(false); setAddDraft(emptyDraft('MULTIPLE_CHOICE')); setAddError(''); }}
              saving={savingAdd} error={addError} />
          ) : (
            <button onClick={() => setAddingQuestion(true)} className="text-sm text-purple-600 hover:text-purple-800 font-medium">
              + Agregar pregunta
            </button>
          )}
        </>
      )}
    </div>
  );
}
