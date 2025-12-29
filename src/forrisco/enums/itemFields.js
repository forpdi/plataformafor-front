import { createEnum } from 'forpdi/src/utils/util';
import Messages from 'forpdi/src/Messages';

const itemFieldsEnum = {
  text: {
    id: 0, name: Messages.get('label.msg.text'), label: 'Área de texto',
  },
  file: {
    id: 1, name: Messages.get('label.msg.file'), label: 'Upload de arquivo(PDF ou imagem)',
  },
};

export default createEnum(itemFieldsEnum);
