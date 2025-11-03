**PONTIFÍCIA UNIVERSIDADE CATÓLICA DE MINAS GERAIS\
PUC Minas Virtual**

**\
\
**

**\
\
SISTEMAS DE INFORMAÇÃO\
\
**

João Gabriel Alves\
João Victor dos Anjos Sales

Lucas de Paula Martins

Belo Horizonte\
2025

**RESUMO**

Este relatório apresenta a All Service Industrial Ltda., seu mercado de
atuação e seus processos e sistemas atuais, identificando gargalos
operacionais. Em seguida, desenvolve-se um Plano de Inteligência
Competitiva (IC) que traduz KIQs em requisitos informacionais e
funcionais para um sistema/BI, alinhado às normas de LGPD, Marco Civil e
ISO/IEC 27001. O fluxo operacional real foi adotado como referência:
ficha de OS em papel → modal do Financeiro → instância de Serviço
(estados) → emissão de NF/fatura → certificado ao estado "encerrada".

Palavras‑chave: Ordem de Serviço. Manutenção Industrial. Inteligência
Competitiva. LGPD. BI. Auditoria.

# APRESENTAÇÃO DA EMPRESA

A All Service Industrial Ltda. é uma empresa de serviços industriais
sediada em Contagem/MG, especializada em balanceamento de equipamentos
rotativos e manutenção preditiva, preventiva e corretiva. Atende os
setores de mineração, siderurgia, energia, saneamento, papel e celulose.

A estrutura física possibilita manusear peças de grande porte (diâmetro,
comprimento e peso elevados), com logística interna adequada. A equipe é
multidisciplinar (técnica e administrativa), e os valores incluem
excelência técnica, segurança, ética e capacitação contínua.

Justificativa da escolha: o setor é intensivo em dados técnicos e
documentos fiscais; há oportunidades claras de integração entre operação
e financeiro (OS→NF→fatura) e ganhos com governança de dados, automação
e auditoria.

2.  **ANÁLISE DE MERCADO**

A All Service Industrial Ltda atua no segmento de serviços industriais
especializados, com foco em balanceamento de equipamentos rotativos e
manutenção industrial. Esse setor é vital para empresas de mineração,
siderurgia, cimenteiras, papel e celulose, entre outras que operam com
máquinas de grande porte. A atividade exige alta precisão técnica,
equipamentos adequados e atendimento ágil.

O mercado nacional apresenta concorrência moderada, formada por empresas
regionais e grandes fornecedores com atuação interestadual. Em Minas
Gerais, destacam-se concorrentes como Vibratec e Balanceatec Ltda.

As práticas do setor incluem atendimento em campo e oficina, emissão de
laudos técnicos, uso de softwares de análise de vibração, manutenção
preditiva, preventiva e corretivas. Especialização, cumprimento de
prazos e confiabilidade são determinantes na escolha dos fornecedores.

## MATRIZ SWOT -- All Service Industrial Ltda

Forças

-   capacidade técnica e física

-   atendimento multissetorial

-   desenvolvimento de dispositivos próprios

-   proximidade de polos industriais

> Fraquezas

-   dependência de planilhas/sistema legado

-   risco na transcrição do papel

-   ausência de trilha de auditoria por estado

-   porte relativamente menor que grandes players

> Oportunidades

-   automação do fluxo OS→NF/fatura

-   integração fiscal explicável

-   dashboards operacionais e financeiros

-   expansão geográfica

Ameaças

-   concorrentes mais digitalizados

-   variação macroeconômica

-   riscos regulatórios e de governança de dados

# ANÁLISE DOS PROCESSOS E SISTEMAS

O fluxo de trabalho da empresa inicia-se com a solicitação de um serviço
de balanceamento pelo cliente. A partir dessa demanda, o operador
executa o balanceamento e, ao final do processo, gera um OS (Ordem de
Serviço) contendo as informações necessárias para o faturamento e
emissão do certificado.

**FLUXO OPERACIONAL REAL (VISÃO ATUAL + ALVO DO PROJETO):**

1.  **Origem dos dados:** **Folha física de OS** preenchida na recepção
    > do equipamento.

2.  **Entrada no sistema:** operadora do **Financeiro** preenche um
    > **modal "Nova OS/Serviço"**; o backend cria uma **instância de
    > Serviço**.

3.  **Estados do Serviço:** {**ordem_de_servico**, **aberta**,
    > **em_analise**, **encerrada**, **aguardando_pagamento**,
    > **abatida**, **cancelada**}.

4.  **Listagens:** a **mesma instância** aparece como **1 linha** nas
    > páginas **Ordem de Serviço**, **Serviços** e **Faturas**.

5.  **Eventos chave:** ao entrar em **encerrada**, o sistema **gera o
    > Certificado (PDF)** e numera; **aguardando_pagamento/abatida**
    > alimenta faturas e baixa.

**Sistemas e maturidade:** uso de **planilhas** e **sistema legado**
(baixa integração); processos fiscais feitos manualmente (cálculo de
tributos, retenções, boletos). **Gargalos:** quebras de fórmulas,
inconsistência cadastral, retrabalho, ausência de trilha de auditoria e
validações por estado; risco de erro na transcrição do papel.

TABELA -- **ESTADOS DO SERVIÇO E TRANSIÇÕES** (VISÃO CONCEITUAL)

  ----------------------------------------------------------------------------------
  **ESTADO ATUAL**       **PRÓXIMOS**           **VALIDAÇÕES**     **SAÍDAS
                                                                   AUTOMÁTICAS**
  ---------------------- ---------------------- ------------------ -----------------
  ordem_de_servico       aberta, cancelada      Cliente,           Criação + log
                                                descrição, Ø,      
                                                peso, valor        

  aberta                 em_analise, cancelada  Dados técnicos     Log
                                                mínimos completos  

  em_analise             encerrada, cancelada   Medições           Prévia do
                                                finais/checagens   certificado
                                                                   (rascunho)

  encerrada              aguardando_pagamento   Aprovação técnica  PDF Certificado +
                                                                   número; trava
                                                                   campos técnicos

  aguardando_pagamento   abatida                NF/fatura          Atualiza aging;
                                                vinculadas         notifica
                                                                   Financeiro

  abatida                ---                    Baixa concluída    Encerramento
                                                                   financeiro

  cancelada              ---                    Motivo obrigatório Log + bloqueio de
                                                                   edição
  ----------------------------------------------------------------------------------

Fonte: Elaborado pelo autor (2025).

**DIAGRAMAS E MAPEAMENTOS DE PROCESSOS**

Atualmente, a empresa utiliza planilhas eletrônicas e um sistema legado
para gerenciar pedidos, faturamento e emissão de notas fiscais. Os dados
dos clientes (razão social, CNPJ e contatos) são coletados no primeiro
serviço e reutilizados para fins fiscais e de
comunicação.![](media/image1.png){width="6.2822922134733155in"
height="3.4166852580927385in"}

Principais falhas e dificuldades:

-   Alteração indevida das fórmulas nas planilhas, gerando erros de
    > cálculo, principalmente de impostos.

-   Ausência de validação e padronização nos cadastros, resultando em
    > inconsistências.

-   Dependência de lançamentos manuais e retrabalho entre operação,
    > vendas e faturamento.

-   Falta de rastreabilidade e controle de versões das planilhas.

Gargalos operacionais:

-   Retrabalho na transferência de dados entre OS, planilha e sistema
    > legado.

-   Cálculo tributário manual e sujeito a erros.

-   Emissão manual de boletos e certificados.

-   Baixa de pagamentos feita manualmente, atrasando o processo.

# IDENTIFICAÇÃO DAS NECESSIDADES DE IC (KIT E KIQs)

-   Automatizar e explicar a classificação fiscal (ISSQN/ICMS/ret.) por
    > OS/NF.

-   Reduzir lead time OS→encerrada e encerrada→abatida.

-   Aumentar confiabilidade e completude do cadastro (do papel para o
    > modal).

-   Melhorar a visibilidade financeira (faturamento por tributo,
    > inadimplência).

1.  ## DECISÕES ESTRATÉGICAS DA EMPRESA

    -   Escopo fiscal: ICMS, ISSQN

    -   Cobertura: Nacional

    -   Pipeline de ingestão: Ordem de serviço em papel, planilhas, API

    -   Explicabilidade e auditoria: trilha por OS, regra aplicada,
        > versão, fonte tributária.

    -   Compliance: bases legais LGPD, retenção, criptografia, controle
        > de acesso, logs.

    -   KPIs do produto: acurácia, cobertura de regras, % intervenção
        > humana, tempo de processamento, valor recuperado em
        > auditorias.

2.  ## DECISÃO-CHAVE

> Projetar/validar um motor fiscal explicável com ≥ 95% de acurácia e
> trilha Regra → Fonte → Versão.

## KIT (KEY INTELLIGENCE TOPIC)

> Motor fiscal e pipeline de dados para classificação automática e
> explicável de faturamento por esferas tributárias brasileiras, com
> cobertura inicial dos clientes‑piloto.

4.  ## KIQ (KEY INTELLIGENCE QUESTIONS)

    -   **D1**: Qual a volumetria de OS/NFs por
        > cliente/município/serviço?

    -   **R1**: Quais regras fiscais (fonte/versão/vigência) determinam
        > a tributação?

    -   **DM1**: Quais campos críticos do modal precisam estar completos
        > para decidir corretamente?

    -   **I1**: Como estão SLA e erros dos conectores (planilha,
        > NFS‑e/NF‑e)?

    -   **F1**: Qual o faturamento por tributo e a inadimplência
        > (aging)?

    -   **O1**: Qual o lead time por estado (OS→encerrada;
        > encerrada→abatida) e onde travam as OS?

**JUSTIFICATIVA:** essas KIQs cobrem as dimensões **operacional
(dados/integração), regulatória (regras/compliance)** e **estratégica
(mercado/KPIs)** necessárias para uma decisão segura e para o desenho
correto do produto.

5.  ## PRIORIZAÇÃO (MVP)

    -   ## MUST: atributos mínimos do motor (item LC116/NBS, municípios tomador/prestador, valor de serviços, regime, presença de materiais, indicadores de retenção).

    -   ## SHOULD: reconciliação, CFOP/NCM, versionamento de regras/evidências

    -   ## COULD: simulações "e se?", coleta automática em APIs de prefeituras/SEFAZ

    -   ## WON'T: integrações não essenciais ao piloto e preditivos avançados 

6.  ## MAPEAMENTO DE DADOS E NECESSIDADES DE INFORMAÇÃO 

    -   OS/Serviço: cliente, descrição, Ø/LT/L/P, RPM, G.Q., valores,
        > observações, estado e timestamps.

    -   Fatura: idNF, valor, vencimento, status (aberta/abatida),
        > comissão.

    -   Cadastros: clientes (CNPJ/CNAE/regime/esfera/contatos), serviços
        > (item LC 116/NBS), tabelas fiscais.

    -   Integrações/Auditoria: conectores, logs, telemetria, histórico
        > de transições.

7.  ## MAPA KIQ → INFORMAÇÃO → DADOS → FONTES → PRIORIDADE

  -------------------------------------------------------------------------------------------------
  **KIQ**        **Informação necessária**   **Dados/atributos**   **Fontes**        **Pri.**
  -------------- --------------------------- --------------------- ----------------- --------------
  D1             Série temporal de OS/NFs    idOS, cliente,        Modal/DB;         Alta
                 por                         serviço, UF/mun,      NFS‑e/NF‑e        
                 cliente/município/serviço   data, estado                            

  R1             Catálogo de regras          RegraID, Fonte,       Tabelas fiscais;  Alta
                 (fonte/versão/vigência) e   Versão, Notas         cadastro de       
                 notas afetadas                                    regras            

  DM1            Score de completude do      CNAE, item LC116/NBS, Modal/DB          Alta
                 modal                       tomador/prestador,                      
                                             valor, regime                           

  I1             SLA de conectores (p95/p99, latência, taxa de     Logs/telemetria   Alta
                 erros)                      erro, throughput                        

  F1             Faturamento por tributo e   tributo, valor,       NF/Faturas        Alta
                 aging                       vencimento, status                      

  O1             Lead time por estado;       timestamps de         Logs de estados   Alta
                 retrabalho                  transição,                              
                                             reaberturas                             
  -------------------------------------------------------------------------------------------------

###  FONTES DE DADOS

-   Planilha de Faturamento (Excel) --- Formatação variável;
    > mensal/contínua; responsável: Financeiro. Ação: saneamento,
    > padronização, ETL.

-   Cadastros de Clientes --- planilha + sistema; sob
    > Financeiro/Comercial. Ação: unificar, adicionar regime/esfera.

-   APIs NFS-e (municípios) / SEFAZ (NF-e) --- externos oficiais. Ação:
    > desenvolver conectores.

-   Tabelas legais (LC 116, CNAE, NBS/NCM, CFOP, ISS municípios,
    > retenções) --- externos oficiais. Ação: catálogo versionado.

-   Logs/auditoria do motor --- interno (novo). Ação: especificar schema
    > e retenção.

###  DISPONIBILIDADE E CONFIABILIDADE

-   Internas (planilhas/OS): alta disponibilidade; confiabilidade
    > variável → requer validação, dedup e reconciliação.

-   APIs oficiais: disponibilidade heterogênea, confiabilidade alta
    > quando integrações estáveis.

-   Tabelas legais: alta disponibilidade e confiabilidade; exigir
    > versionamento e data de validade.

8.  ## ESPECIFICAÇÃO DE REQUISITOS INFORMACIONAIS (LIGANDO KIQ → KPIS → FUNCIONALIDADES)

    -   ### INFORMAÇÕES QUE O SISTEMA DEVE COLETAR

  -------------------------------------------------------------------------------------------------
  **CAMPO NO MODAL**      **ATRIBUTO**                                      **TIPO/UNIDADE**
  ----------------------- ------------------------------------------------- -----------------------
  Data                    dataAbertura                                      data

  NF‑e                    numeroNFe                                         texto

  Cliente                 clienteId/clienteNome                             ref/texto

  Nº OS                   numeroOs                                          texto

  Quantidade de peça      qtdPecas                                          inteiro

  Descrição               descricaoServico                                  texto longo

  Ø/LT/L/P                diametroMm/comprimentoMm/larguraMm/pesoKg         numeral

  RPM                     rpm                                               numera

  G.Q.                    grauQualidade                                     enum/texto

  Valor R\$               valorServico                                      moeda

  Observações             observacaoExterna/interna                         texto

  Medições/Planos         Permitido/Encontrado/Remanescente/Plano1/Plano2   numeral

  Vendedor/Comissão       vendedorId/comissaoPercentual                     ref/numeral

  Orçamento               orcamentoId                                       ref

  Estado                  estado                                            enum

  Nº Certificado          numeroCertificado                                 texto
  -------------------------------------------------------------------------------------------------

Fonte: Elaborado pelo autor (2025).

-   ### KPIs (com meta inicial)

> Acurácia de classificação (≥95%); Cobertura de regras (≥98%); %
> intervenção humana (≤10%); Tempo de processamento (≤5 min/1.000 docs);
> Valor recuperado (mensal).

-   **KPIS ESSENCIAIS E ONDE APARECEM**

  ------------------------------------------------------------------------------
  **KPI**              **DEFINIÇÃO**     **META INICIAL**   **TELA/RELATÓRIO**
  -------------------- ----------------- ------------------ --------------------
  Lead time            Média             −10% em 3 meses    OS
  OS→Encerrada         (dataAbertura →                      
                       encerrada)                           

  Lead time            Média (encerrada  −10% em 3 meses    Faturas
  Encerrada→Abatida    → baixa)                             

  Acurácia de          Certificados sem  ≥ 95%              Serviços
  certificado          retrabalho ÷                         
                       total                                

  \% intervenção       Mudanças manuais  ≤ 10%              Serviços
  manual               pós‑análise ÷                        
                       decisões                             

  Taxa de cancelamento OS canceladas ÷   ≤ 5%               OS
                       OS abertas                           

  Valor faturado por   Soma por          Meta mensal        Faturas
  tributo              ISSQN/ICMS/ret.                      

  Inadimplência        Em aberto por     Política           Faturas
  (aging)              faixa                                
  ------------------------------------------------------------------------------

-   ### FUNCIONALIDADES ESSENCIAIS (CRITÉRIOS DE ACEITE)

    i.  Máquina de estados com logs de transição
        > (quem/quando/de→para/motivo).

    ii. Geração de certificado (PDF) ao estado encerrada (com número e
        > versão).

    iii. Grids nas três páginas, filtros, ordenação e drill‑down OS → NF
         > → Fatura.

    iv. Exportações CSV/XLSX (e PDF para fatura/certificado),
        > preservando filtros.

    v.  Desempenho: consultas de 12 meses ≤ 10 s (p95).

    vi. Qualidade: bloqueio se completude \< 80%; reconciliação OS↔NF ≥
        > 98%.

-   ### LEVANTAMENTO DE FONTES DE DADOS EXISTENTES

+-----------+----------------+-----------+-------------+-------------+
| **BASE**  | **OWNER**      | **        | **AT        | **ACESSO**  |
|           |                | FORMATO** | UALIZAÇÃO** |             |
+===========+================+===========+=============+=============+
| Folha de  | Opera          | Físico    | Diário      | Local       |
| OS        | ção/Financeiro |           |             |             |
| (papel)   |                |           |             |             |
+-----------+----------------+-----------+-------------+-------------+
| Planilha  | Financeiro     | XLSX      | M           | Pasta       |
| de        |                |           | ensal/cont. | segura      |
| Fa        |                |           |             |             |
| turamento |                |           |             |             |
+-----------+----------------+-----------+-------------+-------------+
|   -       |                | A         | Diário      | DB local    |
| --------- | -------------- | ccess/SQL |             |             |
|   S       |   TI/Operações |           |             |             |
| istema OS |                |           |             |             |
|           | -------------- |           |             |             |
|  (legado) |                |           |             |             |
|   -       |                |           |             |             |
| --------- | -------------- |           |             |             |
|           |                |           |             |             |
|   -       |   -----------  |           |             |             |
| --------- |                |           |             |             |
|           |   -----------  |           |             |             |
|   ------  |                |           |             |             |
|           |                |           |             |             |
|   ------  |                |           |             |             |
+-----------+----------------+-----------+-------------+-------------+
| Cadastros | Comerc         | XLSX/DB   | Eventual    | Planilha/DB |
| de        | ial/Financeiro |           |             |             |
| Clientes  |                |           |             |             |
+-----------+----------------+-----------+-------------+-------------+
| SEFAZ     | Integrações    | REST/SOAP | Di          | Token/Cert. |
| NF-e      |                |           | ário/diário |             |
+-----------+----------------+-----------+-------------+-------------+
| SEFAZ     | Integrações    | W         | Diário      | Certificado |
| N         |                | ebService |             |             |
| F‑elegais |                |           |             |             |
+-----------+----------------+-----------+-------------+-------------+
| Tabelas   | Conteúdo       | CSV       | Mensal/Ad   | Repositório |
| legais    | Fiscal         | /Planilha | hoc         |             |
+-----------+----------------+-----------+-------------+-------------+

9.  ## COMPLIANCE DE TI E SEGURANÇA DA INFORMAÇÃO

    -   NORMAS E REGULATÓRIOS APLICÁVEIS

        i.  LGPD: tratamento de dados de contato e operacionais com base
            > em execução de contrato e/ou interesse legítimo;
            > mapeamento dado → finalidade → base → retenção no
            > dicionário de dados; pseudonimização em ambientes de
            > teste.

        ii. Marco Civil: logs de acesso a aplicações: 6 meses; registros
            > de conexão: 1 ano; política de expurgo automático.

        iii. Documentos fiscais: XML de NF‑e/NFS‑e por 5 anos
             > (emitente); certificado técnico com versão, integridade e
             > trilha

        iv. ISO/IEC 27001: RBAC/ABAC, criptografia em trânsito/repouso,
            > segregação DEV/TEST/PROD, gestão de incidentes,
            > continuidade e logs imutáveis

    -   POLÍTICAS E CONTROLES

        i.  Minimização de dados e least privilege; pseudonimização em
            > ambientes de teste; retenção por tipo de dado (ex.: fiscal
            > ≥5 anos; contatos conforme necessidade).

        ii. Criptografia TLS/HTTPS + at-rest (campos sensíveis); gestão
            > de chaves.

        iii. Auditoria e monitoramento: logs imutáveis, detecção de
             > anomalias, RACI de resposta a incidentes; atendimento a
             > titulares (SLA interno).

        iv. Versionamento fiscal: regra→fonte→validade→responsável;
            > testes unitários de regra.

**MAPA DE DADOS E CONFORMIDADE**

  -------------------------------------------------------------------------------------------
  **DADO/CAMPO**   **FINALIDADE**            **BASE LEGAL    **RETENÇÃO**   **CONTROLES**
                                             (LGPD ART.                     
                                             7º)**                          
  ---------------- ------------------------- --------------- -------------- -----------------
  Contatos do      Comunicação/faturamento   Execução de     Relação +      RBAC; registro de
  cliente                                    contrato /      prazos fiscais acesso;
                                             Interesse                      pseudonimização
                                             legítimo                       em teste

  OS/Serviço       Execução do serviço       Execução de     5 anos após    Log imutável;
  (dados técnicos)                           contrato        conclusão      trilha de estados
                                                             fiscal         

  NF (NFS‑e/NF‑e)  Obrigações fiscais        Obrigação legal 5 anos         Guarda do XML;
                                                                            criptografia em
                                                                            repouso

  Logs de          Segurança/auditoria       Interesse       6 meses / 1    Retenção
  acesso/conexão                             legítimo /      ano            automática;
                                             Marco Civil                    alerta de expurgo
  -------------------------------------------------------------------------------------------

Fonte: Elaborado pelo autor (2025).\
\
**CONEXÃO COM O PLANO DE IC E PLANEJAMENTO DA SOLUÇÃO**

A construção da solução tecnológica proposta tem origem direta no Plano
de Inteligência Competitiva (IC) desenvolvido anteriormente, o qual
definiu como **KIT (Key Intelligence Topic)** a criação de um motor
fiscal e pipeline de dados para classificação automática e explicável de
faturamento por esferas tributárias brasileiras. Nesse contexto, a
solução ***All Service Gestão Fiscal*** surge como resposta prática às
**KIQs** estabelecidas, voltadas à automação de processos, melhoria da
acurácia tributária e consolidação das informações fiscais e
operacionais em um único ambiente digital.

Entre as KIQs destacam-se: a necessidade de compreender a volumetria de
ordens de serviço e notas fiscais por cliente e município (D1),
estabelecer e auditar regras fiscais aplicáveis (R1), avaliar a
completude dos cadastros operacionais (DM1), monitorar o desempenho dos
conectores e integrações (I1), e acompanhar o faturamento, aging e lead
time de cada processo (F1 e O1). Esses elementos serviram de base para
definir tanto o escopo funcional do sistema quanto os indicadores
estratégicos de desempenho e auditoria.

O desenvolvimento do ***All Service Gestão Fiscal*** tem como principal
objetivo resolver gargalos críticos identificados no fluxo OS→NF→fatura,
cuja execução manual e fragmentada gerava riscos de inconsistência,
perda de dados e ausência de rastreabilidade. O sistema integrará os
módulos de **ordens de serviço, faturamento e controle fiscal**,
eliminando a dependência de planilhas e permitindo rastreabilidade
completa de cada operação, desde a criação da OS até a baixa financeira,
com trilhas de auditoria e logs de transição em conformidade com os
requisitos da LGPD e ISO/IEC 27001.

No planejamento inicial, as **funcionalidades prioritárias** contemplam:

-   a implementação de uma **máquina de estados automatizada**, com logs
    > de transição e bloqueio de campos críticos;

-   a geração automática de **certificados e notas fiscais** vinculados
    > a cada OS encerrada;

-   dashboards operacionais e financeiros que consolidam indicadores
    > como acurácia de classificação, lead time e inadimplência;

-   integração direta com APIs fiscais (NFS-e, SEFAZ) para conciliação
    > de dados e auditoria contínua;

-   um módulo de **cadastro padronizado** com validação de regime
    > tributário, CNAE e item de serviço.

A seguir, apresenta-se o **quadro-resumo** dos principais problemas
diagnosticados, suas soluções correspondentes e a forma como cada um
será tratado no sistema ***All Service Gestão Fiscal***.

  ------------------------------------------------------------------------
  **PROBLEMA MAPEADO** **SOLUÇÃO           **COMO SERÁ RESOLVIDA NO
                       PROPOSTA**          SISTEMA**
  -------------------- ------------------- -------------------------------
  Dependência de       Criação de um       Unificação dos módulos de OS,
  planilhas e          sistema integrado   Fatura e NF-e com automação de
  retrabalho manual no de gestão fiscal e  transições e logs de auditoria
  fluxo OS→NF→Fatura   operacional         

  Ausência de trilha   Implementação de    Cada mudança de estado
  de auditoria e       máquina de estados  (aberta→em
  validação de estados e registro          análise→encerrada→abatida) será
                       automático de       registrada com data, usuário e
                       eventos             motivo

  Inconsistência e     Padronização e      Campos obrigatórios (CNAE,
  duplicidade de dados validação de        regime, esfera, valor, item LC
  cadastrais           cadastros no modal  116) com validação automática e
                       de serviço          bloqueio de edição

  Risco de erro        Desenvolvimento de  Cada OS/NF será classificada
  tributário e         motor fiscal        conforme regra fiscal
  ausência de          explicável          registrada (fonte, versão e
  explicabilidade nas                      validade), com trilha reversa
  regras                                   

  Falta de             Implementação de    Indicadores de lead time,
  visibilidade         dashboards e        acurácia, aging e faturamento
  financeira e         relatórios          por tributo em painéis de
  operacional          dinâmicos           controle atualizados

  Cálculo manual de    Automação do        Aplicação de regras
  impostos e retenções cálculo fiscal e    automatizadas via pipeline
                       integração com      fiscal com reconciliação e
                       tabelas legais      validação de XMLs

  Ausência de          Mecanismo de        Sistema identifica divergências
  reconciliação entre  reconciliação       e aciona o Financeiro para
  OS e NF              automática e        validação via workflow interno
                       alertas             
  ------------------------------------------------------------------------

Fonte: Elaborado pelo autor (2025).

# LEVANTAMENTO DE REQUISITOS E MODELAGEM INICIAL

A solução ***All Service Gestão Fiscal*** será desenvolvida como um
**Sistema de Informação (SI)** completo, integrando o fluxo operacional
e fiscal da organização (OS→NF→Fatura) e materializando as necessidades
informacionais mapeadas no Plano de IC. O objetivo é eliminar a
dependência de planilhas e do sistema legado, assegurar rastreabilidade
por estados, ampliar a explicabilidade fiscal e prover indicadores de
desempenho (lead time, acurácia de classificação, envelhecimento de
faturas e faturamento por tributo) em linha com as metas estabelecidas

## HISTÓRIAS DE USUÁRIO (HU)

**HU-01 --- Cadastro padronizado de OS\
** **COMO** operadora do Financeiro\
**DESEJO** registrar uma nova Ordem de Serviço com validações
obrigatórias (cliente, item LC 116, regime, valores e dados técnicos)\
**PARA** garantir consistência cadastral e evitar retrabalho entre
operação e faturamento.

**HU-02 --- Máquina de estados com trilha\
** **COMO** gestor operacional\
**DESEJO** alterar o estado da OS (ordem_de_servico → aberta →
em_analise → encerrada → aguardando_pagamento → abatida) com logs de
usuário, data e motivo\
**PARA** assegurar rastreabilidade e auditoria completa do processo.

**HU-03 --- Certificado automático ao encerrar\
** **COMO** engenheiro responsável\
**DESEJO** gerar automaticamente o certificado técnico (PDF numerado e
versionado) ao encerrar uma OS\
**PARA** padronizar a emissão, garantir integridade dos dados e travar
campos técnicos após validação.

**HU-04 --- Conciliação fiscal e explicabilidade\
** **COMO** analista fiscal\
**DESEJO** classificar automaticamente as OS e NFs conforme regras
fiscais registradas (fonte, versão e validade)\
**PARA** assegurar explicabilidade e auditoria das decisões tributárias,
com acurácia mínima de 95 %.

**HU-05 --- Dashboards operacionais e financeiros\
** **COMO** gestor\
**DESEJO** acessar painéis dinâmicos com indicadores de lead time,
acurácia de certificados, faturamento por tributo e inadimplência
(aging)\
**PARA** monitorar o desempenho operacional e apoiar decisões
estratégicas baseadas em dados.

**HU-06 --- Integração com fontes externas\
** **COMO** equipe de integração\
**DESEJO** conectar o sistema a APIs oficiais (NFS-e e SEFAZ) e importar
planilhas legadas (XLSX/XML)\
**PARA** automatizar cálculos fiscais, reduzir intervenção manual e
garantir conciliação de dados em tempo real.

## Requisitos Funcionais (RF)

  ---------------------------------------------------------------------------
  **CÓDIGO**   **REQUISITO      **DESCRIÇÃO**
               FUNCIONAL**      
  ------------ ---------------- ---------------------------------------------
  RF-01        Cadastro de OS   O sistema deve validar campos mínimos
               com validações   (cliente, item LC116/NBS, regime tributário,
                                valores e atributos técnicos), bloqueando o
                                prosseguimento quando a completude for
                                inferior a 80%.

  RF-02        Máquina de       Implementar estados e transições
               estados          {ordem_de_servico, aberta, em_analise,
                                encerrada, aguardando_pagamento, abatida,
                                cancelada}, com logs imutáveis e motivo
                                obrigatório para cancelamento.

  RF-03        Certificado      Gerar automaticamente o certificado técnico
               automático       em PDF numerado ao transitar para
                                "encerrada", travando campos técnicos e
                                armazenando o histórico de versões.

  RF-04        Conciliação      Vincular Notas Fiscais e Faturas à OS e
               OS↔NF/Fatura     atualizar o aging (envelhecimento de
                                faturas); emitir alertas automáticos de
                                divergência para revisão pelo setor
                                Financeiro.

  RF-05        Motor fiscal     Classificar tributos e retenções segundo
               explicável       regras fiscais com trilha de rastreabilidade
                                (Regra → Fonte → Versão → Validade),
                                registrando o racional aplicado.

  RF-06        Integrações      Disponibilizar conectores com NFS-e e SEFAZ e
               oficiais         permitir ingestão de planilhas (ETL), com
                                telemetria de latência, taxa de erro e
                                throughput.

  RF-07        Painéis e        Exibir dashboards de lead time por estado,
               relatórios       acurácia de certificados, faturamento por
                                tributo e inadimplência (aging), com opções
                                de exportação em CSV, XLSX e PDF.
  ---------------------------------------------------------------------------

Fonte: Elaborado pelo autor (2025).

## Requisitos Não Funcionais (RNF)

  ----------------------------------------------------------------------------
  **CÓDIGO**   **REQUISITO NÃO   **DESCRIÇÃO**
               FUNCIONAL**       
  ------------ ----------------- ---------------------------------------------
  RNF-01       Segurança e       Implementar controles de acesso RBAC/ABAC,
               conformidade      comunicação segura via TLS/HTTPS,
                                 criptografia em repouso para campos sensíveis
                                 e logs imutáveis. Garantir segregação entre
                                 ambientes (DEV/TEST/PROD) e cumprimento das
                                 retenções legais: notas fiscais por 5 anos,
                                 logs de acesso por 6 meses e registros de
                                 conexão por 1 ano.

  RNF-02       Desempenho        As consultas históricas de até 12 meses devem
                                 responder em até 10 segundos (p95). O
                                 processamento do pipeline fiscal deve
                                 respeitar as metas de tempo definidas pelos
                                 KPIs operacionais.

  RNF-03       Qualidade e       Assegurar deduplicação de registros,
               governança de     reconciliação OS↔NF igual ou superior a 98%,
               dados             versionamento de regras fiscais e manutenção
                                 de um dicionário de dados contendo
                                 finalidade, base legal, política de retenção
                                 e controles aplicáveis.

  RNF-04       Observabilidade   Monitorar os conectores externos por meio de
                                 telemetria (p95/p99, taxa de erro e
                                 throughput), com alertas automáticos de
                                 degradação de desempenho e falhas críticas.
  ----------------------------------------------------------------------------

# Ferramentas e Plataformas

**Banco de dados (PostgreSQL).** Persistência relacional para
**cadastros, OS, histórico de estados, NF/Faturas, regras fiscais e
trilhas de auditoria**, garantindo integridade transacional e
versionamento lógico das decisões fiscais (ex.: *EstadoOS*,
*RegraFiscal*, *AplicacaoRegra*). O modelo proposto continua aderente
aos dados críticos já mapeados.

**Back-end (Java).** Serviços REST responsáveis pela **máquina de
estados**, **emissão de certificado**, **reconciliação OS↔NF/Fatura** e
pelo **motor fiscal explicável**. Integrações com **NFS-e/SEFAZ** via
REST/SOAP com autenticação por token/certificado, conforme as fontes
externas previstas.

**Front-end (Angular).** Camada de apresentação para
**cadastro/validação de OS**, acompanhamento por **estados**, e
**dashboards operacionais/financeiros** (lead time, acurácia,
faturamento por tributo, *aging*), com **exportações CSV/XLSX/PDF**
conforme critérios já definidos.

**Contêineres (Docker).** Empacotamento e execução padronizados do
back-end, front-end e serviços auxiliares, com **segregação
DEV/TEST/PROD**, **TLS/HTTPS** e controles de segurança compatíveis com
**LGPD/ISO 27001**.

**Observabilidade e ETL.** Telemetria de conectores (p95/p99, taxa de
erro e throughput) e ingestão de **planilhas XLSX** e **XMLs fiscais**
para conciliação, mantendo aderência às fontes e formatos mapeados.

## Diagrama de Caso de Uso

![](media/image2.png){width="6.53125in" height="4.694444444444445in"}

  ---------------------------------------------------------------------------
  **CÓDIGO**   **CASO DE      **DESCRIÇÃO**
               USO**          
  ------------ -------------- -----------------------------------------------
  CU-01        Cadastrar OS   Realizar o cadastro de uma nova Ordem de
                              Serviço com validações obrigatórias e
                              verificação de completude dos campos técnicos e
                              fiscais.

  CU-02        Alterar estado Permitir a transição entre estados
               da OS          (ordem_de_servico → aberta → em_analise →
                              encerrada → aguardando_pagamento → abatida),
                              registrando logs de usuário, data e motivo.

  CU-03        Gerar          Emitir automaticamente o certificado técnico
               certificado    (PDF numerado e versionado) ao concluir o
                              serviço, bloqueando campos críticos.

  CU-04        Emitir e       Realizar a emissão e conciliação de Notas
               conciliar      Fiscais e Faturas, atualizando o aging
               NF/Fatura      (envelhecimento de faturas) e notificando o
                              Financeiro.

  CU-05        Classificar    Aplicar regras fiscais com trilha explicável
               fiscalmente    (Regra → Fonte → Versão), garantindo
                              conformidade e rastreabilidade.

  CU-06        Monitorar      Acompanhar desempenho e telemetria dos
               conectores     conectores (p95/p99, taxa de erro e
                              throughput), emitindo alertas automáticos em
                              caso de falhas.

  CU-07        Consultar      Exibir painéis interativos com indicadores de
               dashboards     lead time, acurácia de certificados, aging e
                              faturamento por tributo, com exportações
                              CSV/XLSX/PDF.
  ---------------------------------------------------------------------------

Fonte: Elaborado pelo autor (2025).

## Esboço do Modelo de Dados (ER)

**ENTIDADES-CHAVE E ATRIBUTOS DO SISTEMA *ALL SERVICE GESTÃO FISCAL***

  -------------------------------------------------------------------------
  **ENTIDADE**     **ATRIBUTOS PRINCIPAIS**            **DESCRIÇÃO**
  ---------------- ----------------------------------- --------------------
  Cliente          cliente_id, razao_social, cnpj,     Base para
                   cnae, regime, esfera, contatos      faturamento,
                                                       comunicação e
                                                       identificação de
                                                       regime tributário.

  OS (Ordem de     os_id, cliente_id, numero_os,       Consolida atributos
  Serviço)         descricao, diametro_mm,             técnicos e de
                   comprimento_mm, largura_mm,         negócio da execução
                   peso_kg, rpm, grau_qualidade,       de serviços.
                   valor_servico, estado_atual,        
                   data_abertura, numero_certificado,  
                   vendedor_id, comissao_percentual    

  EstadoOS         estado_id, os_id, de_estado,        Registra a trilha
                   para_estado, data_transicao,        imutável de
                   usuario, motivo                     transições de estado
                                                       da OS, assegurando
                                                       rastreabilidade.

  Certificado      cert_id, os_id, numero, versao,     Representa a emissão
                   data_emissao, hash_integridade      automática do
                                                       certificado técnico
                                                       vinculada à OS
                                                       "encerrada".

  NF (Nota Fiscal) nf_id, os_id, numero, serie, valor, Estabelece a ligação
                   data_emissao, xml, status,          entre a OS e o motor
                   tributos_calculados                 fiscal para
                                                       auditoria e
                                                       conciliação.

  Fatura           fatura_id, os_id, nf_id, valor,     Suporta o controle
                   vencimento, status, data_baixa      de aging
                                                       (envelhecimento de
                                                       faturas) e o
                                                       processo de baixa
                                                       financeira.

  RegraFiscal      regra_id, fonte, versao,            Armazena o catálogo
                   vigencia_inicio, vigencia_fim,      versionado de regras
                   escopo, parametros, retencoes       fiscais aplicáveis
                                                       por tipo de serviço.

  AplicacaoRegra   aplic_id, os_id, nf_id, regra_id,   Mantém a trilha
                   resultado, justificativa, timestamp explicável das
                                                       decisões fiscais,
                                                       vinculando regra
                                                       aplicada e
                                                       justificativa.

  ConectorEvento   evento_id, tipo, alvo, p95_ms,      Registra métricas de
                   p99_ms, taxa_erro, throughput,      observabilidade e
                   timestamp                           telemetria dos
                                                       conectores externos
                                                       (NFS-e/SEFAZ).
  -------------------------------------------------------------------------

Fonte: Elaborado pelo autor (2025).

**TABELA -- RELACIONAMENTOS ENTRE ENTIDADES**

  -----------------------------------------------------------------------
  **RELACIONAMENTO**         **DESCRIÇÃO**
  -------------------------- --------------------------------------------
  Cliente 1:N OS             Um cliente pode possuir diversas ordens de
                             serviço.

  OS 1:N EstadoOS            Cada OS possui um histórico completo de
                             transições de estado.

  OS 1:1 Certificado         Cada OS gera um certificado único ao ser
                             encerrada.

  OS 1:N NF                  Uma OS pode originar uma ou mais notas
                             fiscais.

  NF 1:1 Fatura              Cada nota fiscal está vinculada a uma única
                             fatura correspondente.

  RegraFiscal 1:N            Cada regra fiscal pode ser aplicada a várias
  AplicacaoRegra             OS ou notas fiscais.
  -----------------------------------------------------------------------

Fonte: Elaborado pelo autor (2025).

# PROTÓTIPO E PLANEJAMENTO DA ARQUITETURA

A etapa de prototipagem e planejamento arquitetural do ***All Service
Gestão Fiscal*** tem como finalidade definir a estrutura de navegação do
sistema, a organização dos módulos funcionais e a disposição dos fluxos
de dados entre as camadas. Essa fase antecede o desenvolvimento final e
permite validar a usabilidade, a coerência do fluxo operacional
(OS→NF→Fatura) e a integração entre as áreas Fiscal, Financeira e
Operacional.

O **protótipo navegável**, desenvolvido em **Figma**, contempla as
principais interfaces do sistema:

-   **Tela de Login e Autenticação**, com controle de acesso RBAC e
    > ambiente segregado (DEV/TEST/PROD);

-   **Dashboard Geral**, com indicadores de *lead time*, acurácia, aging
    > e faturamento por tributo;

-   **Módulo de OS**, com listagem, filtros, detalhamento técnico e
    > controle de estados;

-   **Tela de Certificação**, exibindo o certificado emitido em PDF
    > numerado e histórico de versões;

-   **Módulo Fiscal**, para conciliação e explicabilidade de regras
    > (Regra → Fonte → Versão → Validade);

-   **Tela de Configurações**, para parametrização de regras fiscais,
    > retenções e usuários.

O fluxo de telas foi planejado para garantir **navegação intuitiva,
feedback visual em cada ação e coerência com o processo operacional**,
seguindo os princípios de design de sistemas de missão crítica ---
clareza, previsibilidade e rastreabilidade.

O armazenamento e acesso aos dados ocorrem em **camadas independentes**,
visando isolamento lógico, segurança e escalabilidade.

![](media/image3.png){width="6.53125in" height="2.5277777777777777in"}

  ------------------------------------------------------------------------
  **CAMADA**       **TECNOLOGIA**    **RESPONSABILIDADES PRINCIPAIS**
  ---------------- ----------------- -------------------------------------
  Apresentação     Angular           Gerenciar a interface com o usuário,
  (Front-end)                        controlar a navegação entre módulos
                                     (OS, NF, Certificados, Dashboards) e
                                     realizar validações em tempo real nos
                                     formulários. Implementar feedback
                                     visual (toasts, spinners, status) e
                                     comunicação assíncrona com a API.

  Aplicação        Java (Spring      Implementar os serviços REST
  (Back-end)       Boot)             responsáveis pela lógica de negócio,
                                     máquina de estados, emissão de
                                     certificados, conciliação fiscal e
                                     gestão das regras tributárias. Expor
                                     endpoints autenticados (JWT) para
                                     consumo pelo front-end Angular.

  Banco de Dados   PostgreSQL        Armazenar entidades operacionais e
  (Persistência)                     fiscais (OS, NF, Fatura, EstadoOS,
                                     Certificado, RegraFiscal,
                                     AplicacaoRegra) com versionamento e
                                     trilha de auditoria. Aplicar
                                     constraints, triggers e logs de
                                     transição.

  Infraestrutura e Docker / Docker   Padronizar os ambientes de
  Orquestração     Compose           desenvolvimento e produção,
                                     orquestrando os contêineres de
                                     aplicação, banco e serviços
                                     auxiliares. Facilitar a replicação e
                                     o versionamento do ambiente.

  Monitoramento e  Grafana /         Coletar métricas de desempenho
  Logs             Prometheus (via   (p95/p99, throughput, erro),
                   métricas Java e   disponibilizando dashboards técnicos
                   PostgreSQL)       e alertas automáticos.

  Armazenamento de MinIO (compatível Hospedar certificados em PDF e
  Documentos       com S3)           arquivos XML das notas fiscais,
                                     garantindo controle de acesso,
                                     versionamento e integridade via hash.
  ------------------------------------------------------------------------

Fonte: Elaborado pelo autor (2025).

**PREPARAÇÃO DO DESENVOLVIMENTO**

**TABELA -- PLANO DE EXECUÇÃO**

  -----------------------------------------------------------------------------
  **PRIORIDADE**   **FOCO**          **ENTREGAS-CHAVE**
  ---------------- ----------------- ------------------------------------------
  0 -- Fundacional Infra e dados     Repositório e CI; Docker Compose (Angular,
                                     API, PostgreSQL); schema inicial (Cliente,
                                     OS, EstadoOS, Certificado, NF, Fatura,
                                     RegraFiscal, AplicacaoRegra) e migrações.

  1 -- OS +        Máquina de        Formulário Angular com validações; API
  Estados (MVP)    estados           Java de transição {ordem_de_servico → ...
                                     → abatida}; logs imutáveis; bloqueio por
                                     completude \< 80%.

  2 --             Certificado       Emissão de PDF numerado ao "encerrada";
  Certificação     automático        versão do certificado e trava de campos
                                     técnicos.

  3 -- NF/Fatura   Conciliação       Vincular NF/Fatura à OS; atualização de
                                     aging; alertas de divergência para revisão
                                     do Financeiro.

  4 -- Motor       Explicabilidade   Catálogo de regras (fonte, versão,
  Fiscal (MVP)                       validade); aplicação com trilha Regra →
                                     Fonte → Versão e relatório de auditoria.

  5 -- Dashboards  Indicadores       Painéis de lead time, acurácia de
                                     certificados, aging e faturamento por
                                     tributo; exportações CSV/XLSX/PDF.

  6 -- Integrações NFS-e/SEFAZ + ETL Conectores REST/SOAP com
                                     token/certificado; ingestão de planilhas
                                     legadas (XLSX); telemetria p95/p99, erro e
                                     throughput.
  -----------------------------------------------------------------------------

Fonte: Elaborado pelo autor (2025).

**TABELA -- DIVISÃO DE TAREFAS ENTRE INTEGRANTES**

  -----------------------------------------------------------------------
  **INTEGRANTE**   **RESPONSABILIDADES**
  ---------------- ------------------------------------------------------
  João Gabriel     Front-end (Angular): desenvolvimento das interfaces do
  Alves            sistema, criação dos formulários de cadastro e
                   validação de OS, implementação da navegação entre
                   telas e integração com a API Java. Responsável também
                   pelo protótipo navegável e alinhamento de UX.

  João Victor dos  Back-end (Java -- Spring Boot): implementação dos
  Anjos Sales      serviços REST, regras de negócio e integrações fiscais
                   (NFS-e/SEFAZ). Desenvolvimento da máquina de estados,
                   emissão de certificados, motor fiscal e conexão com o
                   banco de dados PostgreSQL.

  Lucas de Paula   Produto e Documentação Técnica: elaboração dos
  Martins          requisitos, critérios de aceite e documentação
                   funcional; padronização das histórias de usuário;
                   definição dos KPIs e dashboards; e revisão da
                   aderência do sistema ao Plano de Inteligência
                   Competitiva.
  -----------------------------------------------------------------------

Fonte: Elaborado pelo autor (2025).

# GERAÇÃO DE RELATÓRIOS E DASHBOARDS INTERNOS

O módulo de relatórios e dashboards do ***All Service Gestão Fiscal***
foi projetado para apoiar a **tomada de decisão estratégica**,
consolidando informações fiscais e operacionais em tempo real e
traduzindo os indicadores definidos nas **KIQs e KPIs** do Plano de
Inteligência Competitiva. A partir das métricas obtidas, o sistema
viabiliza uma gestão proativa dos processos de faturamento, conciliação
e auditoria fiscal, reduzindo riscos e otimizando o desempenho
organizacional.

As visualizações foram desenvolvidas na interface **Angular**,
consumindo dados processados pela **API Java (Spring Boot)** e
armazenados em **PostgreSQL**. A integração direta entre as camadas
garante consistência e atualização imediata dos indicadores
apresentados, permitindo ao gestor interpretar resultados de forma
simples e acionável.

  ---------------------------------------------------------------------------
  **RELATÓRIO /  **DESCRIÇÃO**      **INDICADORES-CHAVE   **CONTRIBUIÇÃO PARA
  DASHBOARD**                       (KPI)**               A IC**
  -------------- ------------------ --------------------- -------------------
  Painel         Exibe o fluxo de   Lead time por estado; Permite identificar
  Operacional    Ordens de Serviço  taxa de OS encerradas gargalos
  (OS)           com seus           dentro do prazo;      operacionais e
                 respectivos        índice de retrabalho. otimizar a
                 estados, tempo de                        produtividade das
                 ciclo e status                           equipes.
                 fiscal.                                  

  Painel de      Consolida valores  Faturamento total por Oferece visão
  Faturamento e  faturados por      tributo; aging médio; financeira
  Financeiro     período, cliente e inadimplência por     estratégica,
                 tipo de serviço,   faixa.                apoiando a
                 com cálculo                              priorização de
                 automático de                            cobranças e
                 aging                                    controle de fluxo
                 (envelhecimento de                       de caixa.
                 faturas).                                

  Painel Fiscal  Apresenta o        Percentual de regras  Garante
  e de           desempenho do      aplicadas com         transparência e
  Conformidade   motor fiscal e a   sucesso; acurácia da  explicabilidade das
                 acurácia das       classificação fiscal; decisões fiscais,
                 classificações     taxa de               reduzindo risco de
                 tributárias        inconsistência.       penalidades e erros
                 aplicadas.                               tributários.

  Painel de      Monitora a emissão Tempo médio de        Aumenta a
  Certificação   e versionamento    geração de            rastreabilidade e
  Técnica        dos certificados   certificados; índice  assegura a
                 técnicos (PDFs).   de revisões por OS.   padronização
                                                          técnica dos
                                                          serviços prestados.

  Relatórios de  Lista transições   Número de logs        Fortalece a
  Auditoria e    de estado, acessos gerados por dia;      governança e a
  Logs           e alterações       tempo médio entre     integridade das
                 relevantes do      eventos; taxa de      informações,
                 sistema, conforme  falhas.               apoiando auditorias
                 os requisitos de                         internas e
                 conformidade.                            externas.
  ---------------------------------------------------------------------------

Fonte: Elaborado pelo autor (2025).

REFERÊNCIAS

PORTER, Michael E. **Competição: estratégias competitivas essenciais**.
15. reimp. Rio de Janeiro: Campus, 2009.

TAKEUCHI, Hirotaka; NONAKA, Ikujiro. **Gestão do conhecimento**. 20.
reimp. Porto Alegre: Bookman, 2008.

DAVENPORT, Thomas H. **Ecologia da informação: por que só a tecnologia
não basta para o sucesso na era da informação**. 10. reimp. São Paulo:
Futura, 2000.

SORDI, José Osvaldo de. **Administração de sistemas de informação**. 2.
ed. São Paulo: Saraiva, 2018.

GOMES, Elisabeth; BRAGA, Fabiane. **Inteligência competitiva em tempos
de big data**. São Paulo: Elsevier, 2017.

STAREC, Claudio (org.). **Gestão da informação, inovação e inteligência
competitiva**. São Paulo: Saraiva, 2012.

SCHWAB, Klaus. **A quarta revolução industrial**. São Paulo: Edipro,
2016.

BRASIL. **Lei nº 13.709, de 14 de agosto de 2018. Lei Geral de Proteção
de Dados Pessoais (LGPD)**. Diário Oficial da União, Brasília, DF, 15
ago. 2018.

BRASIL. **Lei nº 12.965, de 23 de abril de 2014. Marco Civil da
Internet**. Diário Oficial da União, Brasília, DF, 24 abr. 2014.

ASSOCIAÇÃO BRASILEIRA DE NORMAS TÉCNICAS. **ABNT NBR ISO/IEC 27001:2013
--- Tecnologia da informação --- Técnicas de segurança --- Sistemas de
gestão de segurança da informação --- Requisitos**. Rio de Janeiro:
ABNT, 2013.

PINHEIRO, Patrícia Peck. **Proteção de dados pessoais: comentários à Lei
13.709/2018**. São Paulo: Saraiva, 2018.

BIONI, Bruno Ricardo. **Proteção de dados pessoais: a função e os
limites do consentimento**. São Paulo: Forense, 2018.

**IEEE Security & Privacy**. Piscataway, NJ: IEEE. ISSN 1540-7993.

ALL SERVICE INDUSTRIAL LTDA. **Planilha de faturamento** \[documento
interno\]. Contagem, 2025.

ALL SERVICE INDUSTRIAL LTDA. **ODS -- Ordens de Serviço e processos
operacionais** \[documento interno\]. Contagem, 2025.

IBGE -- Instituto Brasileiro de Geografia e Estatística. **Portal
institucional**. Disponível em:
[[https://www.ibge.gov.br]{.underline}](https://www.ibge.gov.br). Acesso
em: 01 set. 2025.
