import { createEnum } from 'forpdi/src/utils/util';

export const otherTypologyLabel = 'Outras';

const typologies = {
  'Risco Operacional': { label: 'Risco Operacional', value: 'Risco Operacional', color: '#ed3737' },
  'Risco de imagem/reputação de órgão': { label: 'Risco de imagem/reputação de órgão', value: 'Risco de imagem/reputação de órgão', color: '#ef8a49' },
  'Risco legal': { label: 'Risco legal', value: 'Risco legal', color: '#f6cd2b' },
  'Risco financeiro/orçamentário': { label: 'Risco financeiro/orçamentário', value: 'Risco financeiro/orçamentário', color: '#cce655' },
  'Risco de Integridade': { label: 'Risco de Integridade', value: 'Risco de Integridade', color: '#79cbc1' },
  [otherTypologyLabel]: { label: 'Outras', value: 'Outras', color: '#9ec3f4' },
};

export default createEnum(typologies);
