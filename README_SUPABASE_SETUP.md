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


## Atualização (Novas Tabelas: Malhas e Comissões)

Para ativar as funcionalidades de Malhas e Comissões no Supabase, rode também o novo script:

1. Vá novamente ao **SQL Editor**.
2. Clique em **"New Query"**.
3. Copie o conteúdo do arquivo `supabase_migration_meshes_commissions.sql`.
4. Cole no editor e clique em **Run**.

Isso adicionará:
*   **meshes**: Para salvar os tipos de malhas.
*   **companies**: Para salvar as empresas da comissão.
*   **commission_entries**: Para salvar os valores mensais.
*   **financial_records**: Para salvar adiantamentos e recebimentos.

