import React from "react";
import ReCAPTCHA from "react-google-recaptcha";

function captchaIsDisabled(isDisabled) {
  if (typeof isDisabled === 'boolean') {
    return isDisabled;
  } else if (typeof isDisabled === 'string') {
    return isDisabled === 'true';
  }
  return false;
};

const Captcha = ({ isDisabled, sitekey, onChange }) => (
  !captchaIsDisabled(isDisabled) && (
    <ReCAPTCHA
      sitekey={sitekey}
      onChange={onChange}
      hl="pt-BR"
    />
  )
);

export default Captcha;
