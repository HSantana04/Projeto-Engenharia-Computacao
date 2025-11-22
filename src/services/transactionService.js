import { supabase } from '../config/supabaseClient';
class TransactionService {
    // Obter todas as transações do usuário
    async getTransactions(userId) {
        try {
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', userId)
                .order('date', { ascending: false });
            if (error)
                throw error;
            return { success: true, data: data || [] };
        }
        catch (error) {
            console.error('Error fetching transactions:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Erro ao buscar transações',
            };
        }
    }
    // Obter transações por período
    async getTransactionsByDateRange(userId, startDate, endDate) {
        try {
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', userId)
                .gte('date', startDate)
                .lte('date', endDate)
                .order('date', { ascending: false });
            if (error)
                throw error;
            return { success: true, data: data || [] };
        }
        catch (error) {
            console.error('Error fetching transactions by date range:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Erro ao buscar transações',
            };
        }
    }
    // Obter transações por categoria
    async getTransactionsByCategory(userId, category) {
        try {
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', userId)
                .eq('category', category)
                .order('date', { ascending: false });
            if (error)
                throw error;
            return { success: true, data: data || [] };
        }
        catch (error) {
            console.error('Error fetching transactions by category:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Erro ao buscar transações',
            };
        }
    }
    // Criar nova transação
    async createTransaction(userId, transactionData) {
        try {
            const amount = transactionData.type === 'receita' ? transactionData.amount : -transactionData.amount;
            const { data, error } = await supabase
                .from('transactions')
                .insert([
                {
                    user_id: userId,
                    date: transactionData.date,
                    description: transactionData.title,
                    amount,
                    category: transactionData.category,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
            ])
                .select()
                .single();
            if (error)
                throw error;
            return { success: true, data };
        }
        catch (error) {
            console.error('Error creating transaction:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Erro ao criar transação',
            };
        }
    }
    // Atualizar transação
    async updateTransaction(transactionId, transactionData) {
        try {
            const amount = transactionData.type === 'receita' ? transactionData.amount : -transactionData.amount;
            const { data, error } = await supabase
                .from('transactions')
                .update({
                date: transactionData.date,
                description: transactionData.title,
                amount,
                category: transactionData.category,
                updated_at: new Date().toISOString(),
            })
                .eq('id', transactionId)
                .select()
                .single();
            if (error)
                throw error;
            return { success: true, data };
        }
        catch (error) {
            console.error('Error updating transaction:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Erro ao atualizar transação',
            };
        }
    }
    // Deletar transação
    async deleteTransaction(transactionId) {
        try {
            const { error } = await supabase
                .from('transactions')
                .delete()
                .eq('id', transactionId);
            if (error)
                throw error;
            return { success: true };
        }
        catch (error) {
            console.error('Error deleting transaction:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Erro ao deletar transação',
            };
        }
    }
    // Obter resumo financeiro
    async getFinancialSummary(userId) {
        try {
            const { data, error } = await supabase
                .from('transactions')
                .select('amount')
                .eq('user_id', userId);
            if (error)
                throw error;
            const transactions = data || [];
            const totalReceitas = transactions
                .filter((t) => t.amount > 0)
                .reduce((sum, t) => sum + t.amount, 0);
            const totalDespesas = Math.abs(transactions.filter((t) => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));
            const saldo = totalReceitas - totalDespesas;
            return {
                success: true,
                data: { totalReceitas, totalDespesas, saldo },
            };
        }
        catch (error) {
            console.error('Error fetching financial summary:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Erro ao buscar resumo financeiro',
            };
        }
    }
}
const transactionService = new TransactionService();
export default transactionService;
