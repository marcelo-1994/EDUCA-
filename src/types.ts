export type Module = {
  id: string;
  title: string;
  description: string;
  language: 'html' | 'css' | 'javascript' | 'python' | 'json';
  icon: string;
  completed: boolean;
};

export type Message = {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
};

export const MODULES: Module[] = [
  {
    id: 'html-basics',
    title: 'Fundamentos HTML',
    description: 'Aprenda a estruturar páginas web.',
    language: 'html',
    icon: 'layout',
    completed: false,
  },
  {
    id: 'css-styling',
    title: 'Estilização com CSS',
    description: 'Deixe suas páginas bonitas.',
    language: 'css',
    icon: 'palette',
    completed: false,
  },
  {
    id: 'js-logic',
    title: 'Lógica com JavaScript',
    description: 'Adicione interatividade.',
    language: 'javascript',
    icon: 'code',
    completed: false,
  },
  {
    id: 'python-backend',
    title: 'Backend com Python',
    description: 'Crie lógicas de servidor.',
    language: 'python',
    icon: 'server',
    completed: false,
  },
  {
    id: 'nodejs-api',
    title: 'APIs com Node.js',
    description: 'Construa serviços robustos.',
    language: 'javascript',
    icon: 'database',
    completed: false,
  },
  {
    id: 'ajudai-integration',
    title: 'Integração AJUDAÍ+',
    description: 'Conecte seu app ao ecossistema AJUDAÍ+.',
    language: 'javascript',
    icon: 'plug',
    completed: false,
  },
];
