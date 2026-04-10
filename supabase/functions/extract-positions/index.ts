import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();

    if (!text || typeof text !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Campo "text" ausente ou inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OPENAI_API_KEY não configurada' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `Você é um assistente financeiro especialista em extrair dados de extratos bancários brasileiros e notas de corretagem.
Sua tarefa é analisar o texto do extrato e extrair DUAS listas independentes (quando existirem):
1. POSIÇÕES DE INVESTIMENTOS (saldo em conta corrente, ações, fundos, CDBs, etc).
2. TRANSAÇÕES FINANCEIRAS (receitas e despesas do histórico da conta, PIX, pagamentos, etc).

IMPORTANTE: É muito comum extratos terem apenas transações e NENHUM investimento. Nesse caso, extraia todas as transações e retorne "positions": []. Se houver apenas investimentos, retorne "transactions": []. NUNCA retorne vazio se houver transações no texto!

Você DEVE retornar a resposta EXATAMENTE no formato JSON abaixo:
{
  "positions": [
    {
      "asset_name": "Nome do ativo",
      "institution": "Nome da instituição",
      "asset_type": "Tipo do ativo",
      "amount": 1500.50,
      "quantity": 10
    }
  ],
  "transactions": [
    {
      "description": "Descrição do lançamento",
      "amount": 150.00,
      "type": "receita",
      "category": "Categoria sugerida",
      "date": "YYYY-MM-DD"
    }
  ]
}

Regras OBRIGATÓRIAS:
- O campo "type" das transações DEVE ser ESTRITAMENTE a string "receita" para entradas de dinheiro ou "despesa" para saídas.
- O campo "amount" DEVE ser sempre um número (float) positivo.
- Analise cuidadosamente o texto e capture TODAS as transações de conta corrente identificadas.
- Retorne APENAS o JSON puro.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        response_format: { type: "json_object" },
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          { role: 'user', content: `Extraia as posições e transações do texto do extrato abaixo:\n\n${text.substring(0, 15000)}` },
        ],
        temperature: 0.0,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      return new Response(
        JSON.stringify({ error: `Erro na API OpenAI: ${response.status}`, details: errBody }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim() || '{}';

    let result;
    try {
      const jsonStr = content.replace(/```(?:json)?\n?/gi, '').replace(/```/g, '').trim();
      result = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Falha no JSON parse. Retorno da OpenAI:', content, parseError);
      return new Response(
        JSON.stringify({ error: 'O modelo da IA retornou um JSON inválido. Verifique os logs do Supabase.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
