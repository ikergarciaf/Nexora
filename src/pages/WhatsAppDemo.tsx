import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Phone, Check, CheckCheck, Send, ArrowLeft, MoreVertical, Paperclip, Smile } from 'lucide-react';

export default function WhatsAppDemo() {
  const [searchParams] = useSearchParams();
  const slug = searchParams.get('slug') || '';
  const navigate = useNavigate();

  const [clinic, setClinic] = useState<any>(null);
  const [messages, setMessages] = useState<{id: string, text: string, isMe: boolean, time: string}[]>([]);
  const [inputText, setInputText] = useState('');
  const [phone, setPhone] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (slug) {
      fetch(`/api/clinic/${slug}`)
        .then(res => res.json())
        .then(data => {
          if (!data.error) {
            setClinic(data);
          }
        });
    }
  }, [slug]);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    setIsConfigured(true);
    setMessages([
      { id: '1', text: `¡Hola! Soy el asistente virtual de ${clinic?.name || 'la clínica'}. ¿En qué te puedo ayudar hoy?`, isMe: false, time: new Date().toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'}) }
    ]);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = {
      id: Date.now().toString(),
      text: inputText,
      isMe: true,
      time: new Date().toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'})
    };

    setMessages(prev => [...prev, newMsg]);
    setInputText('');
    setLoading(true);

    try {
      const res = await fetch('/api/whatsapp/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromPhone: phone,
          message: newMsg.text,
          clinicSlug: slug
        })
      });
      const data = await res.json();
      
      setMessages(prev => [...prev, {
        id: Date.now().toString()+1,
        text: data.reply || 'Lo siento, ha habido un problema de conexión.',
        isMe: false,
        time: new Date().toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'})
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now().toString()+1,
        text: 'Error de servidor simulando WhatsApp.',
        isMe: false,
        time: new Date().toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'})
      }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <form onSubmit={handleStart} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
          <div className="flex items-center justify-center w-16 h-16 bg-[#25D366]/10 text-[#25D366] rounded-full mx-auto mb-6">
            <Phone className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-center mb-2">Demo de WhatsApp</h2>
          <p className="text-gray-500 text-center mb-6">Simulador para {clinic?.name || 'ClinicSaaS AI'}</p>
          
          <label className="block text-sm font-bold text-gray-700 mb-2">Tu teléfono registrado en la clínica</label>
          <input 
            type="text" 
            placeholder="Ej: +34 600000000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl mb-6 focus:border-[#25D366] outline-none"
            required
          />
          <button type="submit" className="w-full py-3 bg-[#25D366] text-white rounded-xl font-bold hover:bg-[#1ebd5a]">
            Iniciar Chat
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ece5dd] sm:p-4 flex items-center justify-center font-sans relative">
      {/* Background shape mimicking WA Web */}
      <div className="absolute top-0 left-0 w-full h-32 bg-[#00a884] z-0 hidden sm:block"></div>
      
      <div className="w-full sm:max-w-md h-[100dvh] sm:h-[800px] bg-[#efeae2] sm:rounded-2xl shadow-2xl flex flex-col z-10 overflow-hidden relative">
        <div className="bg-[#008069] text-white px-4 py-3 flex items-center justify-between shadow-md z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsConfigured(false)} className="sm:hidden"><ArrowLeft size={24} /></button>
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
               <Phone size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-[16px] leading-tight">{clinic?.name || 'Clínica AI'}</h3>
              <p className="text-[12px] text-white/80 leading-tight">en línea</p>
            </div>
          </div>
          <div className="flex gap-4">
             <MoreVertical size={20} />
          </div>
        </div>

        {/* WhatsApp Background pattern class would go here usually, using plain color for now */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 relative bg-[url('https://web.whatsapp.com/img/bg-chat-tile-light_04fcacde53925e4cb0a15b3b14d2ceeb.png')] bg-repeat" style={{backgroundSize: '400px'}}>
          <div className="bg-[#ffeecd] text-gray-600 text-xs text-center px-4 py-2 mx-auto rounded-lg shadow-sm mb-4 max-w-[90%]">
             Los mensajes y las llamadas están cifrados de extremo a extremo.
             Nadie fuera de este chat, ni siquiera WhatsApp, puede leerlos ni escucharlos.
          </div>

          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] px-3 py-2 rounded-lg relative shadow-sm text-[14.2px] ${msg.isMe ? 'bg-[#d9fdd3] rounded-tr-none' : 'bg-white rounded-tl-none'}`}>
                 <span style={{wordWrap: 'break-word', whiteSpace: 'pre-wrap'}}>{msg.text}</span>
                 <div className="flex items-center justify-end gap-1 mt-1">
                   <span className="text-[10px] text-gray-500">{msg.time}</span>
                   {msg.isMe && <CheckCheck className="w-3 h-3 text-[#53bdeb]" />}
                 </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
               <div className="px-4 py-2 bg-white rounded-lg rounded-tl-none shadow-sm flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
               </div>
            </div>
          )}
          <div ref={endOfMessagesRef} />
        </div>

        <form onSubmit={handleSendMessage} className="bg-[#f0f2f5] p-3 flexItems-center gap-2 flex z-20">
          <button type="button" className="text-gray-500 p-2"><Smile size={24} /></button>
          <button type="button" className="text-gray-500 p-2"><Paperclip size={20}/></button>
          <input 
             type="text" 
             value={inputText}
             onChange={(e) => setInputText(e.target.value)}
             placeholder="Escribe un mensaje" 
             className="flex-1 bg-white border-0 py-2.5 px-4 rounded-lg outline-none text-[15px]" 
          />
          {inputText ? (
             <button type="submit" className="bg-[#00a884] text-white p-2.5 rounded-full ml-1"><Send size={20} className="ml-1"/></button>
          ) : (
             <button type="button" className="text-gray-500 p-2 ml-1"><Phone size={24} /></button>
          )}
        </form>
      </div>
    </div>
  );
}
