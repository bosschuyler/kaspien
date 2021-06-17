import React from 'react';
import Search from './Search';
import {withRouter} from 'react-router-dom';

class SearchPage extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.uploadListings = this.uploadListings.bind(this);
    }

    uploadListings() {
        this.props.history.push('/upload');
    }

    render() {
        return (
          <div className='container-sm'>
            <h1>Product Listings <button onClick={this.uploadListings} className="btn btn-primary btn-xs mb-1"><i className="fa fa-plus"/> Upload</button></h1>
            <Search />
          </div>
        );
    }
}

export default withRouter(SearchPage);
