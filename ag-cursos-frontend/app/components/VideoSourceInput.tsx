'use client';
import { useState } from 'react';

type Props = {
  value: string;
  onChange: (url: string) => void;
};

export default function VideoSourceInput({ value, onChange }: Props) {
  const [mode, setMode] = useState<'url' | 'file'>(value.includes('vimeo.com') ? 'file' : 'url');
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState('');

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setUploading(true);
    // Simulado: cuando haya un plan de Vimeo contratado, aca va la subida
    // real via la API de Vimeo, y onChange recibe la URL del player que
    // devuelva esa API en lugar de este ID mockeado.
    await new Promise(resolve => setTimeout(resolve, 1500));
    const mockId = Math.floor(100000000 + Math.random() * 900000000);
    onChange(`https://player.vimeo.com/video/${mockId}`);
    setUploading(false);
    e.target.value = '';
  };

  return (
    <div>
      <div className="flex gap-1 mb-2 bg-gray-100 rounded-lg p-1 w-fit">
        <button
          type="button"
          onClick={() => setMode('url')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
            mode === 'url' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Pegar URL
        </button>
        <button
          type="button"
          onClick={() => setMode('file')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
            mode === 'file' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Subir archivo
        </button>
      </div>

      {mode === 'url' ? (
        <input
          type="url"
          placeholder="URL del video (YouTube embed, opcional)"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      ) : (
        <div>
          <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium transition inline-flex items-center gap-1.5">
            {uploading ? 'Subiendo a Vimeo...' : 'Elegir archivo de video'}
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleFile}
              disabled={uploading}
            />
          </label>
          {value && !uploading && (
            <p className="text-xs text-green-600 mt-2">✓ {fileName || 'Video'} subido a Vimeo</p>
          )}
        </div>
      )}
    </div>
  );
}
