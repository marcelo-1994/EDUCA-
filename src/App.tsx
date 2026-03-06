import React, { useState, useEffect, useRef } from 'react';
import { MODULES, Module, Message } from './types';
import { initChat, sendMessage } from './services/geminiService';
import { 
  Terminal, 
  Play, 
  Layout, 
  Palette, 
  Code, 
  Server, 
  Database, 
  Plug, 
  Send, 
  Bot, 
  User, 
  CheckCircle2, 
  Circle,
  Menu,
  X
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';

const ICONS: Record<string, React.ReactNode> = {
  layout: <Layout size={18} />,
  palette: <Palette size={18} />,
  code: <Code size={18} />,
  server: <Server size={18} />,
  database: <Database size={18} />,
  plug: <Plug size={18} />,
};

export default function App() {
  const [activeModule, setActiveModule] = useState<Module>(MODULES[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [code, setCode] = useState('<!-- Escreva seu código aqui -->\n<h1>Olá, EduCode AI!</h1>');
  const [previewCode, setPreviewCode] = useState(code);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize chat with a welcome message
    const startChat = async () => {
      setIsLoading(true);
      await initChat();
      const initialMsg = await sendMessage(`Olá! Sou um novo aluno. Gostaria de começar o módulo: ${activeModule.title}. Pode me dar as boas-vindas e a primeira lição seguindo o método de ensino?`);
      setMessages([
        {
          id: Date.now().toString(),
          role: 'ai',
          content: initialMsg,
          timestamp: new Date(),
        }
      ]);
      setIsLoading(false);
    };
    startChat();
  }, [activeModule.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const aiResponse = await sendMessage(input, code);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: aiResponse,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: "Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunCode = () => {
    setPreviewCode(code);
  };

  const getLanguageExtension = () => {
    switch (activeModule.language) {
      case 'javascript': return [javascript({ jsx: true })];
      case 'html': return [html()];
      case 'css': return [css()];
      case 'python': return [python()];
      default: return [html()];
    }
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 font-sans overflow-hidden">
      
      {/* Sidebar / Learning Path */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 flex-shrink-0 border-r border-zinc-800 bg-zinc-900/50 flex flex-col overflow-hidden`}>
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg text-emerald-400">
            <Bot size={24} />
            <span>EduCode AI</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-zinc-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">
            Trilha de Aprendizado
          </div>
          {MODULES.map((mod) => (
            <button
              key={mod.id}
              onClick={() => setActiveModule(mod)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${
                activeModule.id === mod.id 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'hover:bg-zinc-800 text-zinc-400'
              }`}
            >
              <div className={`p-2 rounded-lg ${activeModule.id === mod.id ? 'bg-emerald-500/20' : 'bg-zinc-800'}`}>
                {ICONS[mod.icon]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{mod.title}</div>
                <div className="text-xs opacity-70 truncate">{mod.description}</div>
              </div>
              {mod.completed ? (
                <CheckCircle2 size={16} className="text-emerald-500" />
              ) : (
                <Circle size={16} className="opacity-20" />
              )}
            </button>
          ))}
        </div>
        
        <div className="p-4 border-t border-zinc-800">
          <div className="bg-zinc-800 rounded-xl p-3 text-xs text-zinc-400">
            <div className="font-semibold text-zinc-200 mb-1">Ecossistema AJUDAÍ+</div>
            Aprenda programando projetos reais integrados.
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 border-b border-zinc-800 bg-zinc-900/30 flex items-center px-4 justify-between">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} className="text-zinc-400 hover:text-white">
                <Menu size={20} />
              </button>
            )}
            <h1 className="font-semibold text-zinc-200">{activeModule.title}</h1>
            <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-xs text-zinc-400 font-mono">
              {activeModule.language}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleRunCode}
              className="flex items-center gap-2 px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-medium rounded-lg text-sm transition-colors"
            >
              <Play size={16} className="fill-current" />
              Executar Código
            </button>
          </div>
        </header>

        {/* Workspace */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* AI Mentor Chat */}
          <div className="w-full md:w-1/3 border-r border-zinc-800 flex flex-col bg-zinc-900/20">
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'ai' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-300'
                  }`}>
                    {msg.role === 'ai' ? <Bot size={18} /> : <User size={18} />}
                  </div>
                  <div className={`flex-1 max-w-[85%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                    <div className="text-xs text-zinc-500 mb-1">
                      {msg.role === 'ai' ? 'EduCode AI' : 'Você'}
                    </div>
                    <div className={`inline-block rounded-2xl px-4 py-3 text-sm ${
                      msg.role === 'user' 
                        ? 'bg-zinc-800 text-zinc-200 rounded-tr-sm' 
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-tl-sm prose prose-invert prose-sm max-w-none prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-zinc-800'
                    }`}>
                      {msg.role === 'user' ? (
                        msg.content
                      ) : (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Bot size={18} />
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
              <div className="relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Pergunte ao EduCode AI ou envie sua resposta..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 resize-none"
                  rows={2}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 bottom-2 p-2 rounded-lg bg-emerald-500 text-zinc-950 hover:bg-emerald-400 disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-500 transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Editor & Preview */}
          <div className="w-full md:w-2/3 flex flex-col">
            {/* Code Editor */}
            <div className="flex-1 flex flex-col min-h-[50%] border-b border-zinc-800">
              <div className="h-10 bg-zinc-900/80 border-b border-zinc-800 flex items-center px-4 gap-2 text-xs font-mono text-zinc-400">
                <Terminal size={14} />
                <span>editor.{activeModule.language === 'javascript' ? 'js' : activeModule.language === 'python' ? 'py' : activeModule.language}</span>
              </div>
              <div className="flex-1 overflow-auto bg-[#282c34]">
                <CodeMirror
                  value={code}
                  height="100%"
                  theme={oneDark}
                  extensions={getLanguageExtension()}
                  onChange={(value) => setCode(value)}
                  className="h-full text-sm"
                />
              </div>
            </div>

            {/* Preview Area */}
            <div className="flex-1 flex flex-col min-h-[50%] bg-white">
              <div className="h-10 bg-zinc-100 border-b border-zinc-200 flex items-center px-4 gap-2 text-xs font-medium text-zinc-500">
                <Layout size={14} />
                <span>Preview (Resultado)</span>
              </div>
              <div className="flex-1 relative">
                {activeModule.language === 'html' || activeModule.language === 'css' || activeModule.language === 'javascript' ? (
                  <iframe
                    srcDoc={`
                      <!DOCTYPE html>
                      <html>
                        <head>
                          <style>body { font-family: system-ui, sans-serif; padding: 1rem; color: #1a1a1a; }</style>
                        </head>
                        <body>
                          ${previewCode}
                          <script>
                            // Intercept console.log to show in preview if needed
                            const originalLog = console.log;
                            console.log = function(...args) {
                              originalLog(...args);
                              const logDiv = document.createElement('div');
                              logDiv.style.fontFamily = 'monospace';
                              logDiv.style.background = '#f4f4f5';
                              logDiv.style.padding = '8px';
                              logDiv.style.marginTop = '8px';
                              logDiv.style.borderRadius = '4px';
                              logDiv.style.borderLeft = '3px solid #10b981';
                              logDiv.innerText = '> ' + args.join(' ');
                              document.body.appendChild(logDiv);
                            };
                          </script>
                        </body>
                      </html>
                    `}
                    title="preview"
                    className="w-full h-full border-none"
                    sandbox="allow-scripts"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-950 text-zinc-400 font-mono text-sm p-8 text-center">
                    <div>
                      <Server size={32} className="mx-auto mb-4 opacity-50" />
                      <p>A execução de backend ({activeModule.language}) requer um ambiente de servidor.</p>
                      <p className="mt-2 text-xs opacity-70">O EduCode AI avaliará seu código pelo chat.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
