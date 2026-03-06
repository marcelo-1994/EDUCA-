import { Message, Module } from '../types';

// URL base do backend AJUDAÍ+, configurada nas variáveis de ambiente
const API_URL = (import.meta as any).env.VITE_AJUDAI_API_URL || 'https://api.ajudai.exemplo.com/v1';
const API_KEY = (import.meta as any).env.VITE_AJUDAI_API_KEY || '';

/**
 * Serviço responsável por sincronizar os dados do EduCode AI com o backend do AJUDAÍ+
 */
export const ajudaiService = {
  /**
   * Sincroniza o progresso do usuário em um módulo específico
   */
  async syncProgress(userId: string, moduleId: string, completed: boolean): Promise<void> {
    try {
      console.log(`[AJUDAÍ+ Sync] Sincronizando progresso... Usuário: ${userId}, Módulo: ${moduleId}, Concluído: ${completed}`);
      
      // Implementação real da chamada à API:
      /*
      const response = await fetch(`${API_URL}/users/${userId}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({ moduleId, completed }),
      });

      if (!response.ok) {
        throw new Error('Falha ao sincronizar progresso com AJUDAÍ+');
      }
      */
      
      // Simulando delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log(`[AJUDAÍ+ Sync] Progresso sincronizado com sucesso!`);
    } catch (error) {
      console.error('[AJUDAÍ+ Sync Error] Falha ao sincronizar progresso:', error);
    }
  },

  /**
   * Salva o histórico de mensagens do chat no banco de dados do AJUDAÍ+
   */
  async saveChatMessage(userId: string, moduleId: string, message: Message): Promise<void> {
    try {
      console.log(`[AJUDAÍ+ Sync] Salvando mensagem no histórico... Usuário: ${userId}`);
      
      // Implementação real da chamada à API:
      /*
      const response = await fetch(`${API_URL}/users/${userId}/chat-history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({ 
          moduleId,
          messageId: message.id,
          role: message.role,
          content: message.content,
          timestamp: message.timestamp
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao salvar mensagem no AJUDAÍ+');
      }
      */
    } catch (error) {
      console.error('[AJUDAÍ+ Sync Error] Falha ao salvar mensagem:', error);
    }
  },

  /**
   * Busca o estado inicial dos módulos do usuário no AJUDAÍ+
   */
  async fetchUserModules(userId: string, defaultModules: Module[]): Promise<Module[]> {
    try {
      console.log(`[AJUDAÍ+ Sync] Buscando módulos do usuário... Usuário: ${userId}`);
      
      // Implementação real da chamada à API:
      /*
      const response = await fetch(`${API_URL}/users/${userId}/modules`, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Mesclar dados remotos com os módulos padrão
        return defaultModules.map(mod => {
          const remoteMod = data.find((m: any) => m.id === mod.id);
          return remoteMod ? { ...mod, completed: remoteMod.completed } : mod;
        });
      }
      */
      
      // Retornando os módulos padrão por enquanto
      return defaultModules;
    } catch (error) {
      console.error('[AJUDAÍ+ Sync Error] Falha ao buscar módulos:', error);
      return defaultModules;
    }
  }
};
