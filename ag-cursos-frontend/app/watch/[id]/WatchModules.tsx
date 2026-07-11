'use client';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import QuizModal from '../../components/QuizModal';

type Module = {
  id: string;
  title: string;
  description?: string;
  videoUrl?: string;
  documentUrls?: string[];
  quiz?: { id: string } | null;
};

function parseDoc(url: string): { name: string; ext: string } {
  const raw = url.split('/').pop() || url;
  const name = raw.replace(/^\d{13}-/, '').replace(/_/g, ' ');
  const ext = name.split('.').pop()?.toLowerCase() || '';
  return { name, ext };
}

function docStyle(ext: string) {
  if (ext === 'pdf') return {
    card: 'bg-red-50 border-red-200 hover:bg-red-100',
    iconWrap: 'bg-red-100 group-hover:bg-red-200',
    icon: 'text-red-600',
    title: 'text-red-800',
    sub: 'text-red-500',
    arrow: 'text-red-400',
  };
  if (ext === 'doc' || ext === 'docx') return {
    card: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
    iconWrap: 'bg-blue-100 group-hover:bg-blue-200',
    icon: 'text-blue-600',
    title: 'text-blue-800',
    sub: 'text-blue-500',
    arrow: 'text-blue-400',
  };
  return {
    card: 'bg-gray-50 border-gray-200 hover:bg-gray-100',
    iconWrap: 'bg-gray-100 group-hover:bg-gray-200',
    icon: 'text-gray-600',
    title: 'text-gray-800',
    sub: 'text-gray-500',
    arrow: 'text-gray-400',
  };
}

export default function WatchModules({ modules }: { modules: Module[] }) {
  const { token } = useAuth();
  const [openIds, setOpenIds] = useState<Set<string>>(
    () => new Set(modules.map(m => m.id))
  );
  const [quizModuleId, setQuizModuleId] = useState<string | null>(null);
  const quizModule = quizModuleId ? modules.find(m => m.id === quizModuleId) : null;

  const toggle = (id: string) => {
    setOpenIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  if (modules.length === 0) {
    return (
      <div className="text-center py-16 border rounded-xl bg-white text-gray-400">
        Este curso no tiene módulos cargados todavía.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {modules.map((mod, i) => {
        const isOpen = openIds.has(mod.id);
        const hasDocs = mod.documentUrls && mod.documentUrls.length > 0;

        return (
          <div key={mod.id} className="border rounded-xl overflow-hidden bg-white shadow-sm">
            <button
              onClick={() => toggle(mod.id)}
              className="w-full bg-gray-50 border-b px-5 py-4 flex items-center gap-3 hover:bg-gray-100 transition text-left"
            >
              <span className="bg-blue-100 text-blue-700 font-bold w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0">
                {i + 1}
              </span>
              <h2 className="text-lg font-semibold text-gray-900 flex-1">{mod.title}</h2>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 text-gray-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isOpen && (
              <>
                {mod.description && (
                  <p className="px-5 py-4 text-gray-600 text-sm border-b">{mod.description}</p>
                )}

                {mod.videoUrl && (
                  <div className="aspect-video">
                    <iframe
                      src={mod.videoUrl}
                      className="w-full h-full"
                      allowFullScreen
                      title={mod.title}
                    />
                  </div>
                )}

                {hasDocs && (
                  <div className="px-5 py-5 border-t">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Documentos del módulo</p>
                    <div className="flex flex-col gap-2">
                      {mod.documentUrls!.map((docUrl, idx) => {
                        const { name, ext } = parseDoc(docUrl);
                        const s = docStyle(ext);
                        return (
                          <a
                            key={idx}
                            href={docUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-3 border transition rounded-xl px-4 py-3 group ${s.card}`}
                          >
                            <div className={`rounded-lg p-2 flex-shrink-0 transition ${s.iconWrap}`}>
                              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${s.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div>
                              <p className={`text-sm font-semibold ${s.title}`}>{name}</p>
                              <p className={`text-xs ${s.sub}`}>Clic para abrir o descargar</p>
                            </div>
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ml-2 ${s.arrow}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}

                {!mod.videoUrl && !hasDocs && !mod.description && (
                  <p className="px-5 py-4 text-sm text-gray-400">Sin material disponible aún.</p>
                )}

                {mod.quiz && (
                  <div className="px-5 py-4 border-t flex justify-end">
                    <button
                      onClick={() => setQuizModuleId(mod.id)}
                      className="bg-purple-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-purple-700 transition"
                    >
                      Rendir cuestionario
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}

      {quizModule && token && (
        <QuizModal
          moduleId={quizModule.id}
          moduleTitle={quizModule.title}
          token={token}
          onClose={() => setQuizModuleId(null)}
        />
      )}
    </div>
  );
}
