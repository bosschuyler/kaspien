import React from 'react';

class Loading extends React.Component {
  constructor(props, context) {
    super(props, context);
    const { message } = this.props;

    this.state = {
      message: message
    };
  }

  render() {
    const Wrapper = this.props.wrapper || 'div';
    const {message} = this.state;
    return (
      <Wrapper>
        <i className='fa fa-spinner spin'></i>
        &nbsp;
        {this.props.children || message}
      </Wrapper>
    );
  }
}

export default Loading;
