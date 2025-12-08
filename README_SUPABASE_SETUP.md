# Configuração do Banco de Dados Supabase (Completa)

Para que todas as funcionalidades do sistema (Agenda, Trefila, Treliça, Orçamentos) salvem os dados na nuvem, você precisa criar as tabelas no seu banco de dados Supabase.

## Passo a Passo

1. Acesse o painel do seu projeto no Supabase: [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Vá até a seção **SQL Editor** (ícone de terminal na barra lateral esquerda).
3. Clique em **"New Query"**.
4. Copie **todo o conteúdo** do arquivo `supabase_full_schema.sql` que está na raiz do seu projeto.
5. Cole no editor do Supabase e clique em **Run** (botão verde).

---

## O que isso fará?

Isso criará 4 novas tabelas no seu banco de dados:

*   **consulting_jobs**: Para salvar sua agenda de consultorias.
*   **trefila_recipes**: Para salvar as receitas/cálculos da máquina de trefila.
*   **trusses**: Para salvar os modelos de treliças calculados.
*   **saved_quotes**: Para salvar os orçamentos gerados.

Após fazer isso, o sistema começará automaticamente a ler e gravar nessas tabelas.
