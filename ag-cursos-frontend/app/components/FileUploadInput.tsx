'use client';
import { useState } from 'react';

type Props = {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  accept?: string;
};

export default function FileUploadInput({ value, onChange, placeholder, accept }: Props) {
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) onChange(data.url);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder || 'Ruta del archivo'}
        className="flex-1 border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium transition flex items-center gap-1.5 whitespace-nowrap">
        {uploading ? 'Subiendo...' : 'Examinar'}
        <input
          type="file"
          className="hidden"
          accept={accept || 'image/*,.pdf,.doc,.docx'}
          onChange={handleFile}
          disabled={uploading}
        />
      </label>
    </div>
  );
}
