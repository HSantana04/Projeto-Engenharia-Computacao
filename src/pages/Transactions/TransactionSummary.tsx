import { type FinancialSummary } from './types/index';

function classNames(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(' ');
}

interface TransactionSummaryProps {
  summary: FinancialSummary;
  filteredCount: number;
  totalCount: number;
}

export const TransactionSummary = ({ summary, filteredCount, totalCount }: TransactionSummaryProps) => {
  return (
    <div className="transactions-summary">
      <div className="summary-item">
        <span className="summary-label">Total de Receitas:</span>
        <span className="summary-value positive">
          {summary.totalReceitas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </span>
      </div>
      <div className="summary-item">
        <span className="summary-label">Total de Despesas:</span>
        <span className="summary-value negative">
          {summary.totalDespesas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </span>
      </div>
      <div className="summary-item">
        <span className="summary-label">Saldo:</span>
        <span className={classNames('summary-value', summary.saldo >= 0 ? 'positive' : 'negative')}>
          {summary.saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </span>
      </div>
    </div>
  );
};
