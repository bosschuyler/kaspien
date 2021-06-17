import React from 'react';
import UploadForm from './UploadForm';

class UploadPage extends React.Component {
  render() {
    return (
      <div className='container-sm'>
        <h1>Product Uploader</h1>
        <UploadForm />
      </div>
    );
  }
}


export default UploadPage;