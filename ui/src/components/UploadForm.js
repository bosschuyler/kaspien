import React from 'react';
import axios from 'axios';
import _ from 'lodash';

import Notice from './common/notice';
import Loading from './common/loading';
import { catchErrors, getBody } from '../managers/request';

import createHistory from 'history/createBrowserHistory'
const history = createHistory();

const validMimeTypes = ['text/csv'];

// REFACTOR:ADD_AUTHENTICATION
// should be sending requests using an authentication token with expirations
// and isolating to a particular logged in company/user

class UploadForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: {},
      initializing: true,
      failed: false,
      submitting: false,
      invalid: false,
      error: '',
      validations: {},
      warnings: [],
      was_validated: false,
      failures: [],
      success: ''
    };

    this.onChange = this.onChange.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
    this.reload = this.reload.bind(this);
  }

  componentDidMount() {
    this.setState({
      initializing: false
    });
  }

  validate() {
    const { data } = this.state;
    const errors = {};

    if (data.csv_file) {
      if (validMimeTypes.indexOf(data.csv_file.type) < 0) {
        errors.csv_file = "File must be of the mime type(s): " + validMimeTypes.join(', ');
      }
    } else
      errors.csv_file = "File is required to upload a product list.";

    if (!data.name) {
      errors.name = "Name is required.";
    }

    const valid = Object.keys(errors).length ? false : true;
    const error = !valid ? 'It appears some things are missing..' : '';
    this.setState({ validations: errors, invalid: !valid, error: error });
    return valid;
  }

  onChange(event) {
    const { data } = this.state;
    let files = event.target.files || event.dataTransfer.files;
    data['csv_file'] = null;
    if (files.length) {
      const file = files[0];
      data['csv_file'] = file;
    }
    this.validate();
  }


  onInputChange(event) {
    const { data } = this.state;
    const field = event.target.name;
    const value = event.target.value;
    data[field] = value;
    this.validate();
  }

  // Because this contains a complicated JSON payload to return all the error
  // reporting down to the row, we use a special flattening function to turn it into
  // more easily outputted display messages for this UI
  processErrors(response) {
    const messages = [];
    const errors = _.get(response, 'data.errors', []);
    for(const rowError of errors) {
      let row = rowError.row;
      if (rowError.validations) {
        for (const key in rowError.validations) {
          messages.push("Row " + row + ": " + rowError.validations[key].join(' '));
        }
      }
    }
    return messages;
  }

  submit(e) {
    e.preventDefault();
    const { data } = this.state;
    this.setState({ was_validated: true });
    if (!this.validate()) {
      return;
    }
    this.setState({ submitting: true });

    const formData = new FormData();
    formData.append('csv_file', data.csv_file, data.csv_file.name);

    // REFACTOR:SETUP_CONFIGURATIONS
    // Shouldn't be hardcoded, either setup to submit to self or make configurable
    // Short cutting to get a proof of concept
    axios.post('http://localhost:8000/api/listings/upload', formData)
      .then(getBody)
      .catch(catchErrors)
      .then((response) => {
        const messages = this.processErrors(response);
        this.setState({ success: response.message, warnings: messages });
      })
      .catch(response => {
        let validations = {};
        const errors = _.get(response, 'data.errors', []);
        if (errors && errors.length) {
          validations.csv_file = 'The file contained ' + errors.length + ' rows of bad data';
        }
        this.setState({ error: response.message, validations: validations });
      }).then(() => {
        this.setState({ submitting: false });
      });
  }

  reload() {
    history.go(0);
  }

  getForm() {
    const { submitting, invalid, error, validations, was_validated } = this.state;
    return (
      <form onSubmit={this.submit.bind(this)}>
        {was_validated && error &&
          <Notice type='danger' title={error} validations={validations} />
        }

        {/* To-Do... Planning to add a way to track the uploads themselves and their statuses, which we can provide
        a custom way to label this record, perhaps 'notes' is a better name and usage with a textarea 
        <div className="mb-3">
          <label for="name">Name</label>
          <input onChange={this.onInputChange} name='name' type="input" id="name" className={`form-control ${(was_validated && validations.name) ? 'is-invalid' : ''}`} placeholder="Name..." />
          <div className='invalid-feedback'>
            {validations.name}
          </div>
        </div> */}

        <div className="mb-3">
          <label for="csv-product-uploader">CSV File</label>
          <input onChange={this.onChange} name='csv_file' type="file" className={`form-control ${(was_validated && validations.csv_file) ? 'is-invalid' : ''}`} id="csv-product-uploader" placeholder="CSV File..." />
          <div className='invalid-feedback'>
            {validations.csv_file}
          </div>
        </div>

        <button type="submit" disabled={was_validated && (submitting || invalid)} class="btn btn-primary">
          {submitting ?
            <Loading>Submitting...</Loading> :
            <div>Submit</div>
          }
        </button>

      </form>
    );
  }

  render() {
    const { initializing, failed, success, failures, warnings } = this.state;

    let Content;

    if (initializing) {
      Content = <Loading>Loading...</Loading>;
    } else if (failed) {
      Content = <Notice type='danger' title="Page Encountered An Error" messages={failures}></Notice>;
    } else if (success) {
      Content = <Notice type={warnings.length ? 'warning' : 'success'} title={success} messages={warnings}>
        <button onClick={this.reload} className='btn btn-primary'><i className="fa fa-plus"></i> Upload New File</button>
      </Notice>;
    } else {
      Content = this.getForm();
    }

    return (
      <div className='container-sm'>
        <h1>Product Uploader</h1>
        {Content}
      </div>
    );
  }
}


export default UploadForm;