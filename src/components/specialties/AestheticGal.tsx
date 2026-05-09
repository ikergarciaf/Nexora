import React, { useState, useRef } from 'react';
import { Camera, Plus, Sparkles, Image as ImageIcon, Trash2, ZoomIn } from 'lucide-react';

interface Photo {
  id: string;
  type: 'Antes' | 'Después' | 'Seguimiento';
  date: string;
  url: string;
  notes?: string;
}

interface AestheticGalProps {
  isDarkMode: boolean;
  value?: any;
  onChange: (val: any) => void;
}

export function AestheticGal({ isDarkMode, value, onChange }: AestheticGalProps) {
  const photos: Photo[] = (value && !Array.isArray(value) && value.photos) || [];
  const [showForm, setShowForm] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [newPhoto, setNewPhoto] = useState<Partial<Photo>>({
    type: 'Seguimiento',
    date: new Date().toISOString().split('T')[0],
    url: '',
    notes: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addPhoto = (url?: string) => {
    const photoUrl = url || newPhoto.url;
    if (!photoUrl) return;
    const photo: Photo = {
      id: Math.random().toString(36).substr(2, 9),
      type: (newPhoto.type as Photo['type']) || 'Seguimiento',
      date: newPhoto.date || new Date().toISOString().split('T')[0],
      url: photoUrl,
      notes: newPhoto.notes || ''
    };
    onChange({ photos: [...photos, photo] });
    setShowForm(false);
    setNewPhoto({ type: 'Seguimiento', date: new Date().toISOString().split('T')[0], url: '', notes: '' });
  };

  const removePhoto = (id: string) => {
    onChange({ photos: photos.filter(p => p.id !== id) });
    if (selectedPhoto === id) setSelectedPhoto(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (showForm) {
        setNewPhoto({ ...newPhoto, url: dataUrl });
      } else {
        setNewPhoto({ ...newPhoto, url: dataUrl, date: new Date().toISOString().split('T')[0] });
        setShowForm(true);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={`p-6 min-h-[600px] ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className={`text-[14px] font-bold ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Evolución Estética</h4>
          <p className="text-[12px] text-gray-500">Gestión de fotografías del tratamiento</p>
        </div>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-1.5 bg-pink-600 text-white rounded-lg text-[12px] font-bold hover:bg-pink-700 transition-colors"
          >
            <Camera className="w-3.5 h-3.5" /> Nueva Captura
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 text-white rounded-lg text-[12px] font-bold hover:bg-slate-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Desde URL
          </button>
        </div>
      </div>

      {showForm && (
        <div className={`mb-6 p-5 rounded-xl border animate-in fade-in slide-in-from-top-4 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200 shadow-sm'}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className={`text-[10px] font-bold uppercase mb-1 block ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Tipo</label>
              <select
                value={newPhoto.type}
                onChange={e => setNewPhoto({ ...newPhoto, type: e.target.value as Photo['type'] })}
                className={`w-full px-3 py-2 rounded-lg border text-[12px] font-bold outline-none focus:border-pink-500 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'}`}
              >
                <option value="Antes">Antes</option>
                <option value="Después">Después</option>
                <option value="Seguimiento">Seguimiento</option>
              </select>
            </div>
            <div>
              <label className={`text-[10px] font-bold uppercase mb-1 block ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Fecha</label>
              <input
                type="date"
                value={newPhoto.date}
                onChange={e => setNewPhoto({ ...newPhoto, date: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg border text-[12px] font-bold outline-none focus:border-pink-500 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'}`}
              />
            </div>
            <div>
              <label className={`text-[10px] font-bold uppercase mb-1 block ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>URL de la Imagen</label>
              <input
                type="text"
                value={newPhoto.url}
                onChange={e => setNewPhoto({ ...newPhoto, url: e.target.value })}
                placeholder="https://..."
                className={`w-full px-3 py-2 rounded-lg border text-[12px] font-bold outline-none focus:border-pink-500 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'}`}
              />
            </div>
          </div>
          <div className="mb-4">
            <label className={`text-[10px] font-bold uppercase mb-1 block ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Notas</label>
            <input
              type="text"
              value={newPhoto.notes}
              onChange={e => setNewPhoto({ ...newPhoto, notes: e.target.value })}
              placeholder="Observaciones sobre esta foto..."
              className={`w-full px-3 py-2 rounded-lg border text-[12px] font-bold outline-none focus:border-pink-500 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'}`}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-[11px] font-bold text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
            <button onClick={() => addPhoto()} disabled={!newPhoto.url} className="px-4 py-2 text-[11px] font-bold bg-pink-600 text-white rounded-lg disabled:opacity-50 hover:bg-pink-700 transition-colors">Guardar Foto</button>
          </div>
        </div>
      )}

      {photos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 opacity-40">
          <ImageIcon className="w-12 h-12 text-gray-400 mb-4" strokeWidth={1} />
          <p className={`text-[13px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>Sin fotografías</p>
          <p className="text-[11px] text-gray-400 mt-1">Añade la primera foto de evolución.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {photos.map(photo => (
            <div key={photo.id} className={`group relative rounded-xl overflow-hidden border transition-all ${isDarkMode ? 'border-slate-700' : 'border-gray-200 shadow-sm hover:shadow-md'}`}>
              <div className="aspect-video bg-gray-200 relative overflow-hidden">
                <img
                  src={photo.url}
                  alt={photo.type}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setSelectedPhoto(selectedPhoto === photo.id ? null : photo.id)}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    onClick={() => setSelectedPhoto(selectedPhoto === photo.id ? null : photo.id)}
                    className="p-2 bg-white/90 rounded-full text-black hover:bg-white transition-colors"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removePhoto(photo.id)}
                    className="p-2 bg-white/90 rounded-full text-red-600 hover:bg-white transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className={`px-4 py-3 flex items-center justify-between ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
                <div>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    photo.type === 'Antes' ? 'bg-gray-100 text-gray-600' :
                    photo.type === 'Después' ? 'bg-pink-50 text-pink-600' :
                    'bg-blue-50 text-blue-600'
                  }`}>
                    {photo.type}
                  </span>
                  <p className="text-[11px] text-gray-500 mt-1">{photo.date}</p>
                </div>
                <Sparkles className="w-4 h-4 text-pink-500 opacity-60" />
              </div>
              {photo.notes && (
                <div className={`px-4 py-2 border-t text-[11px] ${isDarkMode ? 'border-slate-700 text-gray-400' : 'border-gray-100 text-gray-500'}`}>
                  {photo.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="max-w-4xl max-h-[90vh] relative" onClick={e => e.stopPropagation()}>
            <img
              src={photos.find(p => p.id === selectedPhoto)?.url || ''}
              alt="Vista ampliada"
              className="max-w-full max-h-[85vh] rounded-xl shadow-2xl"
            />
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-700 font-bold hover:bg-gray-100 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
