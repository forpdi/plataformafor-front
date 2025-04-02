import { createEnum } from 'forpdi/src/utils/util';

const riskType = {
  threat: {
    label: 'Ameaça', pluralLabel: 'Ameaças', name: 'Ameaça', id: 1, color: '#d87a67',
  },
  opportunity: {
    label: 'Oportunidade', pluralLabel: 'Oportunidades', name: 'Oportunidade', id: 2, color: '#6f80e1',
  },
};

export default createEnum(riskType);
