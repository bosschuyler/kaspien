import React from 'react';
import Notice from './common/notice';
import Loading from './common/loading';

import createHistory from 'history/createBrowserHistory'
const history = createHistory();

const validMimeTypes = ['text/csv'];

class UploadForm extends React.Component {
    constructor(props) {
        super(props);
    
        this.state = {
          data: {},
          initializing: true,
          submitting: false,
          invalid: false,
          error: '',
          validations: {},
          was_validated: false,
          failed: false,
          failures: [],
          success: false
        };

        this.onChange = this.onChange.bind(this);
        this.onInputChange = this.onInputChange.bind(this);
        this.reload = this.reload.bind(this);
      }
    
      componentDidMount() {
        setTimeout(() => {
            this.setState({
                initializing: false
            });
        }, 1000);
      }
    
      validate() {
        const { data } = this.state;
        const errors = {};

        if (data.file) {
            console.log(data.file);
            if (validMimeTypes.indexOf(data.file.type) < 0) {
                errors.file = "File must be of the mime type text/csv";
            }
        } else
            errors.file = "File is required to upload a product list.";
        
        if (!data.name) {
            errors.name = "Name is required.";
        }

        const valid = Object.keys(errors).length ? false : true;
        const error = !valid ? 'Form didn\'t pass validation rules' : '';
        this.setState({validations: errors, invalid: !valid, error: error});
        return valid;
      }
    
      onChange(event) {
        const { data } = this.state;
        let files = event.target.files || event.dataTransfer.files;
        data['file'] = null;
        if (files.length) {
            const file = files[0];
            data['file'] = file;
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
    
    submit(e) {
        e.preventDefault();
        const {data} = this.state;
        const {goBack} = this.props;
        this.setState({was_validated: true});
        if(!this.validate()) {
          return;
        }
        this.setState({submitting: true});
    
        setTimeout(() => {
            this.setState({success: true});
        }, 1000);

        // const request = this.request.post('/api/payment/merchant_terminals', data);
        // request.then((response) => {
        //         this.setState({success: true});
        //     })
        //     .catch(response => {
        //         this.setState({error: response.message, validations: response.errors});
        //     }).then(() => {
        //         this.setState({submitting: false});
        //     });
      }

      reload() {
        history.go(0);
      }
    
      getForm() {
        const {submitting, invalid, terminal, error, validations, was_validated} = this.state;
        return (
          <form onSubmit={this.submit.bind(this)}>
            {was_validated && error &&
              <Notice type='danger' title={error} validations={validations} />
            }

            <div className="mb-3">
                <label for="name">Name</label>
                <input onChange={this.onInputChange} name='name' type="input" id="name" className={`form-control ${(was_validated && validations.name) ? 'is-invalid' : ''}`} placeholder="Name..." />
                <div className='invalid-feedback'>
                    {validations.name}
                </div>
            </div>

            <div className="mb-3">
                <label for="csv-product-uploader">CSV File</label>
                <input onChange={this.onChange} name='csv_file' type="file" className={`form-control ${(was_validated && validations.file) ? 'is-invalid' : ''}`} id="csv-product-uploader" placeholder="CSV File..." />
                <div className='invalid-feedback'>
                    {validations.file}
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
        const {initializing, failed, success, failures} = this.state;
    
        let Content;
    
        if (initializing) {
          Content = <Loading>Loading...</Loading>; 
        } else if (failed) {
          Content = <Notice type='danger' title="Page Encountered An Error" messages={failures}></Notice>;
        } else if (success) {
          Content = <Notice type='success' title="Successfully submitted file for upload.">
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