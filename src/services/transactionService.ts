export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
}

export interface CreateTransactionRequest {
  type: 'receita' | 'despesa';
  title: string;
  amount: number;
  category: string;
  date: string;
}

export interface UpdateTransactionRequest {
  type: 'receita' | 'despesa';
  title: string;
  amount: number;
  category: string;
  date: string;
}

export interface TransactionResponse {
  success: boolean;
  data?: Transaction;
  message?: string;
  error?: string;
}

export interface TransactionsResponse {
  success: boolean;
  data?: Transaction[];
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}

class TransactionService {
  private baseURL: string;

  constructor() {
    // Configurar URL base da API
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  }

  // GET /api/transactions - Listar todas as transações
  async getTransactions(page: number = 1, limit: number = 50): Promise<TransactionsResponse> {
    try {
      const response = await fetch(`${this.baseURL}/transactions?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Adicionar token de autenticação quando implementar
          // 'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data: data.transactions, pagination: data.pagination };
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  }

  // GET /api/transactions/:id - Buscar transação específica
  async getTransaction(id: string): Promise<TransactionResponse> {
    try {
      const response = await fetch(`${this.baseURL}/transactions/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Erro ao buscar transação:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  }

  // POST /api/transactions - Criar nova transação
  async createTransaction(transaction: CreateTransactionRequest): Promise<TransactionResponse> {
    try {
      const response = await fetch(`${this.baseURL}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(transaction),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data, message: 'Transação criada com sucesso!' };
    } catch (error) {
      console.error('Erro ao criar transação:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  }

  // PUT /api/transactions/:id - Atualizar transação existente
  async updateTransaction(id: string, transaction: UpdateTransactionRequest): Promise<TransactionResponse> {
    try {
      const response = await fetch(`${this.baseURL}/transactions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(transaction),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data, message: 'Transação atualizada com sucesso!' };
    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  }

  // DELETE /api/transactions/:id - Excluir transação
  async deleteTransaction(id: string): Promise<TransactionResponse> {
    try {
      const response = await fetch(`${this.baseURL}/transactions/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return { success: true, message: 'Transação excluída com sucesso!' };
    } catch (error) {
      console.error('Erro ao excluir transação:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  }

  // GET /api/transactions/summary - Buscar resumo financeiro
  async getFinancialSummary(): Promise<{
    success: boolean;
    data?: {
      saldo: number;
      totalReceitas: number;
      totalDespesas: number;
    };
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.baseURL}/transactions/summary`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Erro ao buscar resumo financeiro:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  }

  // GET /api/transactions/chart-data - Buscar dados para o gráfico
  async getChartData(months: number = 6): Promise<{
    success: boolean;
    data?: Array<{
      month: string;
      receita: number;
      despesa: number;
    }>;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.baseURL}/transactions/chart-data?months=${months}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Erro ao buscar dados do gráfico:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  }
}

export default new TransactionService();
