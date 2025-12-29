import { createEnum } from 'forpdi/src/utils/util';

const appVersion = {
  forVersion: { label: 'forVersion', value: 0 },
  pdiVersion: { label: 'pdiVersion', value: 1 },
  riscoVersion: { label: 'riscoVersion', value: 2 },
};

export default createEnum(appVersion, 'value');
