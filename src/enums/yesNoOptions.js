import { createEnum } from 'forpdi/src/utils/util';
import Messages from 'forpdi/src/Messages';

const options = {
  true: { label: Messages.get('label.yes'), value: true },
  false: { label: Messages.get('label.no'), value: false },
};

export default createEnum(options, 'value');
