// src/services/aiExtractor.ts
import { supabase } from '../lib/supabase';

export interface ExtractedPosition {
  asset_name: string;
  institution: string;
  asset_type: string;
  amount: number;
  quantity: number;
}

export interface ExtractedTransaction {
  description: string;
  amount: number;
  type: 'receita' | 'despesa';
  category: string;
  date: string;
}

export interface ExtractionResult {
  positions: ExtractedPosition[];
  transactions: ExtractedTransaction[];
}

export const extractPositionsWithAI = async (text: string): Promise<ExtractionResult> => {
  const { data, error } = await supabase.functions.invoke('extract-positions', {
    body: { text },
  });

  if (error) {
    throw new Error(error.message || 'Erro ao comunicar com a IA');
  }

  // Retorna o objeto completo contendo { positions, transactions }
  // Isso evita que as transações sejam perdidas no caminho!
  return data;
};
