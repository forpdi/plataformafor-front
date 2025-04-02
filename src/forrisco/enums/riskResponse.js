import { createEnum } from 'forpdi/src/utils/util';

const riskResponse = {
  accept: { id: 5, name: 'Aceitar' },
  mitigate: { id: 10, name: 'Mitigar' },
  share: { id: 15, name: 'Compartilhar' },
  avoid: { id: 20, name: 'Evitar' },
};

export default createEnum(riskResponse);
