import React from 'react';
import axios from 'axios';

import Status from '../common/status';
import Loading from '../common/loading';

class Search extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.state = {
      loading: false,
      listings: [],
      pagination: {
        current_page: 1,
        from: null,
        last_page: 1,
        per_page: this.props.per_page || 1,
        to: null,
        total: 0
      }
    };
    this.load = this.load.bind(this);
  }

  componentDidMount() {
    this.load();
  }

  load() {
    const { per_page } = this.props;
    const { pagination } = this.state;
    const params = Object.assign({}, { per_page: per_page });

    this.setState({
      loading: true
    });

    this.search(params).then((body) => {
      this.setState({
        loading: false,
        listings: body.records,
        pagination: Object.assign(pagination, {
          current_page: body.current_page,
          total: body.total,
          to: body.to,
          from: body.from
        })
      });
    });
  }

  search(params) {
    // REFACTOR:SETUP_CONFIGURATIONS
    // Shouldn't be hardcoded, either setup to submit to self or make configurable
    // Short cutting to get a proof of concept
    return axios.get('http://localhost:8000/api/listings', {
      params: params
    })
      .then((response) => {
        return response.data || null;
      });
  }

  render() {
    const { listings, loading, pagination } = this.state;

    return (
      <div>
        <table className="table">
          <thead>
            <tr>
              <th><button onClick={this.load} className="btn btn-primary btn-sm"><i className="fa fa-refresh" /></button></th>
              <th>ASIN</th>
              <th>Title</th>
              <th>Price</th>
              <th>Net Margin</th>
              <th>Status</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {loading &&
              <tr>
                <td colSpan='4'><Loading>Loading...</Loading></td>
              </tr>
            }
            {(listings.length > 0) && !loading &&
              listings.map((item, i) => {
                const created_at = new Date(item.created_at);
                return (<tr key={item.id}>
                  <td></td>
                  <td>
                    {item.asin}
                  </td>
                  <td>
                    {item.title}
                  </td>
                  <td>
                    {item.price}
                  </td>
                  <td>
                    {item.net_margin * 100}%
                  </td>
                  <td>
                    <Status status={item.status} />
                  </td>
                  <td>
                    {created_at.toLocaleDateString() + ' ' + created_at.toLocaleTimeString()}
                  </td>
                </tr>);
              })
            }
          </tbody>
        </table>
        <div className="row">
          {pagination.total > 0 &&
            <div className="col-md-6">
              {pagination.current_page > 1 &&
                <button className="btn btn-primary" onClick={(e) => this.changePage(pagination.current_page - 1)}>Prev</button>
              }
              &nbsp;
              <button className="btn" disabled={true}>Viewing {pagination.from}-{pagination.to} of {pagination.total}</button>
              &nbsp;
              {pagination.last_page && pagination.current_page < pagination.last_page &&
                <button className="btn btn-primary" onClick={(e) => this.changePage(pagination.current_page + 1)}>Next</button>
              }
            </div>
          }
        </div>
      </div>
    );
  }
}

export default Search;
