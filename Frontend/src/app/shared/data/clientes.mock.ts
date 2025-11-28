import { Cliente } from '../../paginas/principal/clientes/clientes-insight.config';

// Valid CNPJ examples with proper check digits
const cnpjMock = [
  '11.222.333/0001-81',
  '22.333.444/0001-05',
  '33.444.555/0001-29',
  '44.555.666/0001-43',
  '55.666.777/0001-67',
  '66.777.888/0001-81',
  '77.888.999/0001-95',
  '88.999.000/0001-09',
  '99.000.111/0001-13',
  '00.111.222/0001-37',
];

const razaoSocialMock = [
  'Indústria Horizonte Ltda',
  'Comércio Brasil S.A.',
  'Serviços Tecnologia e Inovação',
  'Outros Negócios Empresariais',
  'Metalúrgica São Paulo Ltda',
  'Varejo Distribuição Nacional',
  'Consultoria Empresarial Premium',
  'Atacado Produtos Diversos',
  'Fabricação Industrial Avançada',
  'Logística e Transportes Brasil',
];

const enderecoMock = [
  'Rua das Indústrias, 1500 - Distrito Industrial - Campinas/SP - CEP 13054-750',
  'Av. Paulista, 2500 - Bela Vista - São Paulo/SP - CEP 01310-300',
  'Rua do Comércio, 800 - Centro - Sorocaba/SP - CEP 18010-100',
  'Av. Santos Dumont, 3200 - Embaré - Santos/SP - CEP 11065-100',
  'Rua José Bonifácio, 450 - Vila Nova - Campinas/SP - CEP 13073-110',
  'Av. Independência, 1800 - República - São Paulo/SP - CEP 01046-010',
  'Rua Barão de Jundiaí, 650 - Centro - Sorocaba/SP - CEP 18010-410',
  'Av. Conselheiro Nébias, 950 - Boqueirão - Santos/SP - CEP 11045-002',
  'Rua Dr. Quirino, 1234 - Cambuí - Campinas/SP - CEP 13025-002',
  'Rua Augusta, 2690 - Jardins - São Paulo/SP - CEP 01412-100',
];

const setoresMock = [
  'FINANCEIRO',
  'COMERCIAL',
  'VENDAS',
  'COMPRAS',
  'OPERACIONAL',
  'JURIDICO',
  'RH',
  'LOGISTICA',
  'ADMINISTRACAO',
  'FISCAL',
] as const;

export const CLIENTES_MOCK: Cliente[] = Array.from({ length: 24 }).map((_, i) => {
  const idx = i % 10;
  const telefone = `11${(987654321 + i).toString().padStart(9, '0')}`;
  return {
    id: `EMP-${100 + i}`,
    razaoSocial: razaoSocialMock[idx] + (i >= 10 ? ` ${Math.floor(i / 10) + 1}` : ''),
    cnpj: cnpjMock[idx],
    endereco: enderecoMock[idx],
    // Optional legacy fields for insights
    categoria: (['Industria', 'Comercio', 'Servico', 'Outro'] as const)[i % 4],
    cidade: ['São Paulo', 'Campinas', 'Sorocaba', 'Santos'][i % 4],
    uf: 'SP',
    ativo: i % 5 !== 0,
    faturamento12m: 50000 + i * 2500,
    contatos: i % 3 === 0 ? [] : [
      {
        id: `CONT-${100 + i}-1`,
        idEmpresa: `EMP-${100 + i}`,
        idUsuario: `USR-${(i % 7) + 1}`,
        responsavel: `Contato ${i + 1}`,
        setor: setoresMock[i % setoresMock.length],
        telefone,
        email: `contato${i + 1}@empresa${idx + 1}.com.br`,
      },
    ],
  };
});

