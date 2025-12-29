import IndicatorsDashboardStore from 'forpdi/src/forpdi/dashboard/store/IndicatorsDashboard';

const ALL_CARDS_ID = -1;
const REGIONS_COUNT_CARD_ID = 1;
const ACCESS_CARD_ID = 2;
const INSTITUTIONS_CARD_ID = 3;

function exportPdf(checkedValues, cardId) {
  const [regionId, typeId, beginDate, endDate, companyIds] = checkedValues;
  const period = `${(beginDate || '*')} ${(endDate || '*')}`;
  const selecao = [regionId, typeId, period].join(',');
  const selectedCompanyIds = companyIds.map(company => company.id).join(',');

  const url = `${IndicatorsDashboardStore.url}/exportBoardReport?selecao=${encodeURIComponent(selecao)}&selectedCompanies=${encodeURIComponent(selectedCompanyIds)}&specific=${cardId}`;
  window.open(url);
}

function exportCsv(filters, cardId) {
  const {
    regionId,
    typeId,
    companyIds,
    companyCreationBegin,
    companyCreationEnd,
  } = filters;
  let url = `${IndicatorsDashboardStore.url}/exportCSV?regionId=${encodeURIComponent(regionId)}&typeId=${encodeURIComponent(typeId)}&companyIds=${encodeURIComponent(companyIds)}&specific=${cardId}`;
  if (companyCreationBegin) {
    url += `&companyCreationBegin=${encodeURIComponent(companyCreationBegin)}`;
  }
  if (companyCreationEnd) {
    url += `&companyCreationEnd=${encodeURIComponent(companyCreationEnd)}`;
  }

  window.open(url);
}

export {
  ALL_CARDS_ID,
  REGIONS_COUNT_CARD_ID,
  ACCESS_CARD_ID,
  INSTITUTIONS_CARD_ID,
  exportPdf,
  exportCsv,
};
