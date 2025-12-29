import { createEnum } from 'forpdi/src/utils/util';

const riskResponse = {
  accept: { id: 5, name: 'Aceitar' },
  mitigate: { id: 10, name: 'Mitigar' },
  share: { id: 15, name: 'Compartilhar' },
  avoid: { id: 20, name: 'Evitar' },
  transfer: { id: 25, name: 'Transferir' },
  explore: { id: 30, name: 'Explorar' },
  improve: { id: 35, name: 'Melhorar' },
};

const baseEnum = createEnum(riskResponse);

const riskResponseEnum = {
  ...baseEnum,

  threatResponseOptions: [
    baseEnum.avoid,
    baseEnum.mitigate,
    baseEnum.transfer,
    baseEnum.accept,
  ],
  opportunityResponseOptions: [
    baseEnum.explore,
    baseEnum.improve,
    baseEnum.share,
    baseEnum.accept,
  ],
};

export default riskResponseEnum;
