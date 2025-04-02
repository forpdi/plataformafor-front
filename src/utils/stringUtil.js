export function cutPhrase(phrase, maxLetters) {
  if (!phrase) {
    return ' ';
  }
  return phrase.length > maxLetters ? phrase.substr(0, maxLetters).concat('...') : phrase;
}

export function concatCompanyLocalization(company) {
  const { county } = company;
  const { uf } = county;
  return `${county.name}/${uf.acronym}`;
}
