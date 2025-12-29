import AppContainer from 'forpdi/src/components/AppContainer';
import ErrorControl from 'forpdi/src/components/ErrorControl';

const fixedHeaderOffset = 157;
const fixedLabelOffset = 14 + 17;

export default function scrollToError(
  opt = {
    headerOffset: fixedHeaderOffset,
    labelOffset: fixedLabelOffset,
    scrollableContentElement: AppContainer.ScrollableContent.getElement(),
    errorControlElement: ErrorControl.getElement(),
  },
) {
  const {
    headerOffset,
    labelOffset,
    scrollableContentElement,
    errorControlElement,
  } = opt;

  if (!scrollableContentElement || !errorControlElement) {
    return;
  }

  scrollableContentElement.scrollTo({ top: 0 });

  const position = errorControlElement.getBoundingClientRect().top
    - scrollableContentElement.getBoundingClientRect().top - headerOffset - labelOffset;

  scrollableContentElement.scrollTo({ top: position, behavior: 'smooth' });
}
