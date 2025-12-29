/* eslint-disable react/no-danger */
import React from 'react';
import PropTypes from 'prop-types';

import InputContainer from 'forpdi/src/components/inputs/InputContainer';
import Label from 'forpdi/src/components/typography/Label';
import DOMPurify from 'dompurify';

const SanitizeHtml = ({ html }) => (
  <div
    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }}
  />
);

SanitizeHtml.propTypes = {
  html: PropTypes.string.isRequired,
};

const InfoDisplayHtml = ({
  label,
  htmlInfo,
  className,
  style,
}) => (
  <InputContainer>
    {label && (
      <Label className="label-vertical">
        {label}
      </Label>
    )}
    <div
      className={`${className} info-display-html`}
      style={style}
    >
      <SanitizeHtml html={htmlInfo} />
    </div>
  </InputContainer>
);

InfoDisplayHtml.propTypes = {
  label: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.shape({}),
  htmlInfo: PropTypes.string.isRequired,
};

InfoDisplayHtml.defaultProps = {
  label: null,
  className: '',
  style: {},
};

export default InfoDisplayHtml;
