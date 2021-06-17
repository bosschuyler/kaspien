import React from 'react';
import PropTypes from 'prop-types';

class Status extends React.Component {
  constructor(props, context) {
    super(props, context);
    const { status } = this.props;
    const classes = ['label','rounded'];

    if (status === 'active') {
      classes.push('label-success');
    } else if (status === 'inactive') {
      classes.push('label-danger');
    }

    this.state = {
      classNames: classes.join(' '),
      status: status
    };
  }

  render() {
    const {status, classNames} = this.state;
    return (
      <span className={classNames}>
        {status}
      </span>
    );
  }
}

Status.propTypes = {
  status: PropTypes.string.isRequired
}

export default Status;
