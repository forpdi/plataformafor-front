export const EXISTENT_CONTROLLERS_OPTIONS = [
  { id: 1, label: 'Não há procedimentos de controle' },
  { id: 2, label: 'Há procedimentos de controles, mas são insuficientes' },
  { id: 3, label: 'Todos os controles existentes estão formalizados, mas são insuficientes para o nível de risco' },
  { id: 4, label: 'Os controles existentes são adequados (suficientes) ao nível de risco, mas nem todos (ou nenhum) estão formalizados' },
  { id: 5, label: 'Há procedimentos de controle adequados (suficientes) e todos estão formalizados' },
];

export const EXECUTION_CONTROLLERS_OPTIONS = [
  { id: 1, label: 'Não se aplica' },
  { id: 2, label: 'Os controles existentes não são executados' },
  { id: 3, label: 'Os controles existentes estão sendo parcialmente executados (alguns sim, outros não)' },
  { id: 4, label: 'Todos os controles existentes são executados, mas não há evidência (registros) de sua realização' },
  { id: 5, label: 'Todos os controles existentes são executados e tem evidência (registros) de sua realização' },
];
