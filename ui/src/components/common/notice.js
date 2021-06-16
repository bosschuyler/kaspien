import React from 'react';
import PropTypes from 'prop-types';

class Notice extends React.Component {
  constructor(props, context) {
    super(props, context);
  }

  render() {
    const { title, type, messages, validations } = this.props;
    
    let notices = messages || [];
    if (validations) {
      let keys = Object.keys(validations);
      if (keys.length) {
        notices = keys.map(key => {
          return validations[key];
        });
      }
    }

    let classes = 'alert';
    if (type == 'danger') {
        classes += ' alert-danger';
    } else if (type == 'success') {
        classes += ' alert-success';
    } else if (type == 'warning') {
        classes += ' alert-warning';
    }

    return (
      <div className={classes}>
        <div className='mb-1'>{title}</div>
        <div className='mb-3'>
          {notices.length > 0 &&
            <ul>
              {notices.map((message, i) => {
                return <li key={'notice-message-' + i}>{message}</li>;
              })}
            </ul>
          }
        </div>
        {this.props.children}
      </div>
    );
  }
}

Notice.propTypes = {
  messages: PropTypes.array,
  validations: PropTypes.object,
  title: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired
};

export default Notice;
