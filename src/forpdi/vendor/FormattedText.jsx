import React from 'react';
import ReactQuill from 'react-quill';
import $ from 'jquery';

export default React.createClass({
  getInitialState() {
    return {
      value: this.props.defaultValue || '',
    }
  },

  contextTypes: {
    toastr: React.PropTypes.object.isRequired
  },

  onChangeHandler(content, delta, source, editor){
    const length = editor.getLength();
    const { onChange, maxLength } = this.props;
    if ( maxLength && length > this.props.maxLength) {
      this.context.toastr.addAlertError(`Limite de ${maxLength} caracteres atingido!`);
    }
    this.setState({ value: content });
    onChange && onChange(content, editor.getLength());
  },

  clean() {
    if (!this.editorElement) {
      this.editorElement = $(`#${this.props.id} .ql-editor`);
    }
    this.editorElement.html('');
    this.setState({ value: '' });
  },

  render() {
    return (
      <ReactQuill
        name={this.props.name}
        id={this.props.id}
        onChange={this.onChangeHandler}
        ref={'formatted-text'}
        value={this.state.value}
        modules = {{
          toolbar: [
            ['bold', 'italic', 'underline'],
          ]
        }}
        formats={['bold', 'italic', 'underline']}
      />
    );
  }
});
