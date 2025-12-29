import CompanyStore from 'forpdi/src/forpdi/core/store/Company';

export function isValidUrl(url) {
  return /^http[s]?:\/\//.test(url);
}

export function parseRoutePathToLink(url) {
  return url.split('#')[1];
}

export function buildLevelUrl(planId, levelId) {
  return `/plan/${planId}/details/subplan/level/${levelId}`;
}

export function buildRiskUrl(riskId) {
  return `/forrisco/risk/${riskId}/details`;
}

export function getCompanyLogo(defaultLogo) {
  const { company } = EnvInfo;
  const { logoArchive } = company || {};

  return logoArchive ? `${CompanyStore.url}/logo` : defaultLogo;
}

export function getCompanyName() {
  return EnvInfo.company ? EnvInfo.company.name : '';
}
