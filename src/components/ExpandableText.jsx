import React from 'react';
import PropTypes from 'prop-types';

import Text from 'forpdi/src/components/typography/Text';
import LinkButton from 'forpdi/src/components/buttons/LinkButton';

import { cutPhrase } from 'forpdi/src/utils/stringUtil';
import Messages from 'forpdi/src/Messages';

class ExpandableText extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: props.expanded,
    };
  }

  render() {
    const { text, minTextSize, textStyle } = this.props;
    const { expanded } = this.state;

    if (!text) {
      return null;
    }

    const formattedText = expanded ? text : cutPhrase(text, minTextSize);
    const buttonText = Messages.get(expanded ? 'label.showLess' : 'label.showMore');

    return (
      <div>
        <Text style={textStyle}>{formattedText}</Text>
        {
          (formattedText.length < text.length || expanded) && (
            <LinkButton
              text={buttonText}
              onClick={() => this.setState({ expanded: !expanded })}
              style={{ marginTop: '8px', padding: 0, color: '#0085d9' }}
            />
          )
        }
      </div>
    );
  }
}

ExpandableText.propTypes = {
  text: PropTypes.string,
  expanded: PropTypes.bool,
  minTextSize: PropTypes.number,
  textStyle: PropTypes.shape({}),
};

ExpandableText.defaultProps = {
  text: null,
  expanded: false,
  minTextSize: 80,
  textStyle: null,
};

ExpandableText.contextTypes = {
  theme: PropTypes.string,
};

export default ExpandableText;
