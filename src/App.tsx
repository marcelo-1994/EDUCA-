import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MODULES, Module, Message } from './types';
import { initChat, sendMessage } from './services/geminiService';
import { ajudaiService } from './services/ajudaiService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
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
  X,
  Sparkles,
  ChevronRight,
  Monitor,
  Smartphone,
  Copy,
  RotateCcw,
  Zap
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ICONS: Record<string, React.ReactNode> = {
  layout: <Layout size={18} />,
  palette: <Palette size={18} />,
  code: <Code size={18} />,
  server: <Server size={18} />,
  database: <Database size={18} />,
  plug: <Plug size={18} />,
};

export default function App() {
  const [modules, setModules] = useState<Module[]>(MODULES);
  const [activeModule, setActiveModule] = useState<Module>(MODULES[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [code, setCode] = useState('<!-- Escreva seu código aqui -->\n<h1>Olá, EduCode AI!</h1>');
  const [previewCode, setPreviewCode] = useState(code);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  
  const userId = 'user-ajudai-123';
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadUserData = async () => {
      setIsSyncing(true);
      const syncedModules = await ajudaiService.fetchUserModules(userId, MODULES);
      setModules(syncedModules);
      setActiveModule(syncedModules[0]);
      setIsSyncing(false);
    };
    loadUserData();
  }, []);

  useEffect(() => {
    const startChat = async () => {
      setIsLoading(true);
      try {
        await initChat();
        const initialMsg = await sendMessage(`Olá! Sou um novo aluno. Gostaria de começar o módulo: ${activeModule.title}. Pode me dar as boas-vindas e a primeira lição seguindo o método de ensino?`);
        const aiMessage: Message = {
          id: Date.now().toString(),
          role: 'ai',
          content: initialMsg,
          timestamp: new Date(),
        };
        setMessages([aiMessage]);
        ajudaiService.saveChatMessage(userId, activeModule.id, aiMessage);
      } catch (error: any) {
        console.error("Error initializing chat:", error);
        let errorMessage = "Desculpe, não consegui iniciar o módulo. Tente novamente mais tarde.";
        if (error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('quota') || error?.message?.includes('RESOURCE_EXHAUSTED')) {
          errorMessage = "⚠️ **Limite de uso atingido.**\n\nO limite de requisições da inteligência artificial foi excedido. Por favor, aguarde um momento e tente novamente ou verifique as configurações da sua chave de API.";
        }
        setMessages([{
          id: Date.now().toString(),
          role: 'ai',
          content: errorMessage,
          timestamp: new Date(),
        }]);
      } finally {
        setIsLoading(false);
      }
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
    ajudaiService.saveChatMessage(userId, activeModule.id, userMsg);

    try {
      const aiResponse = await sendMessage(input, code);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: aiResponse,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      ajudaiService.saveChatMessage(userId, activeModule.id, aiMsg);
      
      if (aiResponse.toLowerCase().includes('parabéns') && aiResponse.toLowerCase().includes('concluído')) {
        handleModuleComplete(activeModule.id);
      }
    } catch (error: any) {
      console.error("Error sending message:", error);
      let errorMessage = "Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.";
      if (error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('quota') || error?.message?.includes('RESOURCE_EXHAUSTED')) {
        errorMessage = "⚠️ **Limite de uso atingido.**\n\nO limite de requisições da inteligência artificial foi excedido. Por favor, aguarde um momento e tente novamente ou verifique as configurações da sua chave de API.";
      }
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: errorMessage,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModuleComplete = async (moduleId: string) => {
    setIsSyncing(true);
    setModules(prev => prev.map(mod => 
      mod.id === moduleId ? { ...mod, completed: true } : mod
    ));
    await ajudaiService.syncProgress(userId, moduleId, true);
    setIsSyncing(false);
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
    <div className="flex h-screen bg-[#09090b] text-zinc-100 font-sans overflow-hidden selection:bg-emerald-500/30">
      
      {/* Sidebar / Learning Path */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.aside 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 300, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="flex-shrink-0 border-r border-zinc-800 bg-zinc-900/40 flex flex-col overflow-hidden relative z-20"
          >
            <div className="h-16 px-6 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3 font-bold text-lg tracking-tight">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-zinc-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                  <Zap size={18} fill="currentColor" />
                </div>
                <span className="text-white">Ajudaí<span className="text-emerald-500">+</span> Edu</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
              <div className="px-3 py-4">
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4">
                  Trilha de Aprendizado
                </div>
                <div className="space-y-1">
                  {modules.map((mod) => (
                    <button
                      key={mod.id}
                      onClick={() => setActiveModule(mod)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 group",
                        activeModule.id === mod.id 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.05)]' 
                          : 'hover:bg-zinc-800/50 text-zinc-400 border border-transparent'
                      )}
                    >
                      <div className={cn(
                        "p-2 rounded-lg transition-colors",
                        activeModule.id === mod.id ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-500 group-hover:text-zinc-300'
                      )}>
                        {ICONS[mod.icon]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-xs truncate">{mod.title}</div>
                        <div className="text-[10px] opacity-50 truncate mt-0.5">{mod.description}</div>
                      </div>
                      {mod.completed ? (
                        <CheckCircle2 size={14} className="text-emerald-500" />
                      ) : (
                        <ChevronRight size={14} className="opacity-20 group-hover:opacity-40 transition-opacity" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-zinc-800 bg-gradient-to-b from-transparent to-black/20">
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={14} className="text-emerald-400" />
                  <span className="text-xs font-bold text-zinc-200">Ecossistema AJUDAÍ+</span>
                </div>
                <p className="text-[10px] text-zinc-400 leading-relaxed opacity-80">
                  Aprenda criando projetos reais integrados à nossa plataforma.
                </p>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#09090b]">
        {/* Header */}
        <header className="h-16 border-b border-zinc-800 bg-[#09090b]/80 backdrop-blur-md flex items-center px-6 justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            {!sidebarOpen && (
              <button 
                onClick={() => setSidebarOpen(true)} 
                className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all"
              >
                <Menu size={20} />
              </button>
            )}
            <div className="flex flex-col">
              <h1 className="font-bold text-sm text-zinc-100">{activeModule.title}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-500 font-mono uppercase tracking-wider border border-white/5">
                  {activeModule.language}
                </span>
                {isSyncing && (
                  <span className="flex items-center gap-1 text-[10px] text-emerald-500 animate-pulse">
                    <Plug size={10} />
                    Sincronizando...
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleRunCode}
              className="flex items-center gap-2 px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
            >
              <Play size={14} className="fill-current" />
              Executar
            </button>
          </div>
        </header>

        {/* Workspace */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* AI Mentor Chat */}
          <div className="w-full lg:w-[400px] border-r border-zinc-800 flex flex-col bg-zinc-900/10">
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    key={msg.id} 
                    className={cn("flex gap-3", msg.role === 'user' ? 'flex-row-reverse' : '')}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm",
                      msg.role === 'ai' ? 'bg-emerald-500 text-zinc-950' : 'bg-zinc-800 text-zinc-300 border border-white/5'
                    )}>
                      {msg.role === 'ai' ? <Bot size={16} /> : <User size={16} />}
                    </div>
                    <div className={cn("flex-1 max-w-[85%]", msg.role === 'user' ? 'text-right' : '')}>
                      <div className={cn(
                        "inline-block rounded-2xl px-4 py-3 text-sm leading-relaxed",
                        msg.role === 'user' 
                          ? 'bg-emerald-500/10 text-emerald-50 border border-emerald-500/20 rounded-tr-sm' 
                          : 'bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-tl-sm prose prose-invert prose-sm max-w-none'
                      )}>
                        {msg.role === 'user' ? (
                          msg.content
                        ) : (
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                              code({node, inline, className, children, ...props}: any) {
                                const match = /language-(\w+)/.exec(className || '');
                                const isCodeBlock = !inline && match;
                                const codeString = String(children).replace(/\n$/, '');
                                
                                return isCodeBlock ? (
                                  <div className="relative group mt-3 mb-4 rounded-xl overflow-hidden border border-white/10 bg-zinc-950">
                                    <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
                                      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{match[1]}</span>
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => navigator.clipboard.writeText(codeString)}
                                          className="p-1.5 hover:bg-white/10 rounded-md text-zinc-500 hover:text-white transition-colors"
                                          title="Copiar Código"
                                        >
                                          <Copy size={12} />
                                        </button>
                                        <button
                                          onClick={() => {
                                            setCode(codeString);
                                            setPreviewCode(codeString);
                                          }}
                                          className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-md text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 transition-colors border border-emerald-500/20"
                                        >
                                          Aplicar
                                        </button>
                                      </div>
                                    </div>
                                    <div className="p-4 overflow-x-auto custom-scrollbar text-[13px]">
                                      <code className={className} {...props}>
                                        {children}
                                      </code>
                                    </div>
                                  </div>
                                ) : (
                                  <code className="bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded text-[13px] font-mono border border-emerald-500/20" {...props}>
                                    {children}
                                  </code>
                                );
                              }
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        )}
                      </div>
                      <div className="text-[10px] text-zinc-600 mt-1.5 font-medium px-1">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-500 text-zinc-950 flex items-center justify-center shadow-sm">
                    <Bot size={16} />
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="p-6 border-t border-zinc-800 bg-zinc-900/30">
              <div className="relative group">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Tire sua dúvida ou envie o código..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-4 pr-12 py-4 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 resize-none transition-all placeholder:text-zinc-600"
                  rows={1}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-emerald-500 text-zinc-950 hover:bg-emerald-400 disabled:opacity-30 disabled:grayscale transition-all active:scale-90 shadow-lg shadow-emerald-500/10"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Editor & Preview */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Code Editor */}
            <div className="flex-1 flex flex-col min-h-[40%] border-b border-zinc-800 relative">
              <div className="h-10 bg-zinc-900/20 border-b border-zinc-800 flex items-center px-4 justify-between">
                <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  <Terminal size={12} className="text-emerald-500" />
                  <span>Editor de Código</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-800/50 text-[10px] text-zinc-400 border border-white/5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {activeModule.language}
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-auto bg-[#282c34] custom-scrollbar relative">
                <CodeMirror
                  value={code}
                  height="100%"
                  theme={oneDark}
                  extensions={getLanguageExtension()}
                  onChange={(value) => setCode(value)}
                  className="h-full text-sm absolute inset-0"
                />
              </div>
            </div>

            {/* Preview Area */}
            <div className="flex-1 flex flex-col min-h-[40%] bg-zinc-50 relative">
              <div className="h-12 bg-white border-b border-zinc-200 flex items-center px-6 justify-between absolute top-0 left-0 right-0 z-10">
                <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  <Layout size={12} className="text-zinc-400" />
                  <span>Visualização em Tempo Real</span>
                </div>
                <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-lg">
                  <button 
                    onClick={() => setPreviewMode('desktop')}
                    className={cn(
                      "p-1.5 rounded-md transition-all",
                      previewMode === 'desktop' ? 'bg-white text-emerald-600 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'
                    )}
                  >
                    <Monitor size={14} />
                  </button>
                  <button 
                    onClick={() => setPreviewMode('mobile')}
                    className={cn(
                      "p-1.5 rounded-md transition-all",
                      previewMode === 'mobile' ? 'bg-white text-emerald-600 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'
                    )}
                  >
                    <Smartphone size={14} />
                  </button>
                </div>
              </div>
              <div className="flex-1 bg-zinc-200/50 p-6 flex justify-center overflow-auto custom-scrollbar pt-16">
                <div className={cn(
                  "bg-white shadow-2xl transition-all duration-500 overflow-hidden relative",
                  previewMode === 'desktop' ? 'w-full h-full rounded-xl' : 'w-[375px] h-[667px] rounded-[3rem] border-[8px] border-zinc-900'
                )}>
                  {activeModule.language === 'html' || activeModule.language === 'css' || activeModule.language === 'javascript' ? (
                    <iframe
                      srcDoc={`
                        <!DOCTYPE html>
                        <html>
                          <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <style>
                              body { 
                                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
                                padding: 2rem; 
                                color: #18181b;
                                line-height: 1.5;
                                margin: 0;
                              }
                              * { box-sizing: border-box; }
                            </style>
                          </head>
                          <body>
                            ${previewCode}
                            <script>
                              const originalLog = console.log;
                              console.log = function(...args) {
                                originalLog(...args);
                                const logDiv = document.createElement('div');
                                logDiv.style.fontFamily = 'monospace';
                                logDiv.style.fontSize = '12px';
                                logDiv.style.background = '#18181b';
                                logDiv.style.color = '#10b981';
                                logDiv.style.padding = '12px';
                                logDiv.style.marginTop = '16px';
                                logDiv.style.borderRadius = '8px';
                                logDiv.style.borderLeft = '4px solid #10b981';
                                logDiv.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)';
                                logDiv.innerText = '> ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ');
                                document.body.appendChild(logDiv);
                              };
                            </script>
                          </body>
                        </html>
                      `}
                      title="preview"
                      className="w-full h-full border-none"
                      sandbox="allow-scripts allow-modals"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-950 text-zinc-400 font-mono text-sm p-8 text-center">
                      <div className="max-w-xs">
                        <Server size={40} className="mx-auto mb-6 text-emerald-500/50" />
                        <h3 className="text-zinc-100 font-bold mb-2">Ambiente de Backend</h3>
                        <p className="text-xs leading-relaxed opacity-60">
                          O código {activeModule.language} é processado pelo EduCode AI. O resultado será exibido no chat após a análise.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
