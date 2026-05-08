import React from 'react';
import { Camera, Plus, Sparkles, Image as ImageIcon } from 'lucide-react';

interface AestheticGalProps {
  isDarkMode: boolean;
  value?: any;
  onChange: (val: any) => void;
}

export function AestheticGal({ isDarkMode, value, onChange }: AestheticGalProps) {
  const photos = [
    { type: 'Antes', date: '15 Mar 2024', url: 'https://images.unsplash.com/photo-1512413316925-fd4b93f31521?w=400&auto=format&fit=crop&q=60' },
    { type: 'Después', date: '01 Abr 2024', url: 'https://images.unsplash.com/photo-1512413316925-fd4b93f31521?w=400&auto=format&fit=crop&q=60' }
  ];

  return (
    <div className={`p-6 ${isDarkMode ? 'bg-[#0f172a]' : 'bg-gray-50'}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className={`text-[14px] font-bold ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Evolución Estética</h4>
          <p className="text-[12px] text-gray-500">Gestión de fotografías del tratamiento</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-[#db2777] text-white rounded-[6px] text-[12px] font-bold">
          <Camera className="w-3.5 h-3.5" /> Nueva Captura
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {photos.map((item, idx) => (
          <div key={idx} className={`group relative rounded-[12px] overflow-hidden border transition-all ${isDarkMode ? 'border-[#334155]' : 'border-[#e3e8ee] shadow-sm hover:shadow-md'}`}>
            <div className="aspect-video bg-gray-200 relative overflow-hidden">
               <img src={item.url} alt={item.type} className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button className="px-4 py-2 bg-white text-black rounded-full text-[12px] font-bold">Ampliar</button>
               </div>
            </div>
            <div className={`px-4 py-3 flex items-center justify-between ${isDarkMode ? 'bg-[#1e293b]' : 'bg-white'}`}>
              <div>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${item.type === 'Antes' ? 'bg-gray-100 text-gray-600' : 'bg-pink-50 text-pink-600'}`}>
                   {item.type}
                </span>
                <p className="text-[11px] text-gray-500 mt-1">{item.date}</p>
              </div>
              <Sparkles className="w-4 h-4 text-[#db2777] opacity-60" />
            </div>
          </div>
        ))}
        
        <button className={`aspect-video border-2 border-dashed rounded-[12px] flex flex-col items-center justify-center gap-2 transition-colors ${isDarkMode ? 'border-[#334155] hover:bg-[#1e293b] text-gray-600' : 'border-gray-200 hover:bg-white text-gray-400'}`}>
           <ImageIcon className="w-8 h-8 opacity-20" />
           <span className="text-[12px] font-bold">Subir foto de seguimiento</span>
        </button>
      </div>
    </div>
  );
}
