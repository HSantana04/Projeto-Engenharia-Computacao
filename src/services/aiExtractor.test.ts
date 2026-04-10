import { describe, it, expect, vi, beforeEach } from 'vitest';
import { extractPositionsWithAI } from './aiExtractor';
import { supabase } from '../lib/supabase';

// Mock do cliente do Supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

describe('Service: aiExtractor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve extrair posições e transações com sucesso', async () => {
    const mockResponse = {
      data: {
        positions: [{ asset_name: 'PETR4', amount: 1500, type: 'Ação' }],
        transactions: [{ description: 'Pix Recebido', amount: 200, type: 'receita' }]
      },
      error: null
    };
    
    (supabase.functions.invoke as any).mockResolvedValue(mockResponse);

    const result = await extractPositionsWithAI('texto do pdf falso');
    
    expect(supabase.functions.invoke).toHaveBeenCalledWith('extract-positions', {
      body: { text: 'texto do pdf falso' }
    });
    expect(result.positions).toHaveLength(1);
    expect(result.transactions[0].type).toBe('receita');
  });

  it('deve disparar um erro se a Edge Function falhar', async () => {
    const mockError = { data: null, error: { message: 'Erro na API OpenAI' } };
    (supabase.functions.invoke as any).mockResolvedValue(mockError);

    await expect(extractPositionsWithAI('texto do pdf')).rejects.toThrow('Erro na API OpenAI');
  });
});