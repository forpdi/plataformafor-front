import Messages from 'forpdi/src/Messages';

const MIN_PAGE_SIZE = 5;
const MED_PAGE_SIZE = 10;
const FULL_PAGE_SIZE = 999999;
const DROPDOWN_NOTIFICATIONS_LIMIT = 7;
const SECONDARY_DEFAULT_PAGE_SIZE = 20;
const REPORT_TITLE_MAX_LENGTH = 150;
const toastrConfig = {
  timeOut: 3000,
  extendedTimeOut: 1000,
  closeButton: true,
  showAnimation: null,
  hideAnimation: 'animated bounceOut',
};
const SECONDARY_PAGINATION_OPTIONS = [
  { value: 20, label: Messages.get('label.twentyItems') },
  { value: 50, label: Messages.get('label.fiftyItems') },
  { value: 100, label: Messages.get('label.oneHundredItems') },
];
const useTermsPath = 'https://www.gov.br/mec/pt-br/plataformafor/documentos/MEC_FORPlataformaFOR_Termos_de_Uso_Outubro2023.pdf';
const privacyWarningPath = 'https://www.gov.br/mec/pt-br/plataformafor/documentos/MEC_FORPlataformaFOR_Aviso_de_Privacidade_Outubro2023.pdf';

export {
  MIN_PAGE_SIZE,
  MED_PAGE_SIZE,
  FULL_PAGE_SIZE,
  DROPDOWN_NOTIFICATIONS_LIMIT,
  SECONDARY_DEFAULT_PAGE_SIZE,
  REPORT_TITLE_MAX_LENGTH,
  SECONDARY_PAGINATION_OPTIONS,
  toastrConfig,
  useTermsPath,
  privacyWarningPath,
};
