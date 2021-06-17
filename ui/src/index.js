import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route } from "react-router";
import { createBrowserHistory } from "history";
import './scss/bootstrap-extension.scss';
import 'font-awesome/css/font-awesome.min.css';
import './index.css';

import UploadPage from './components/listings/UploadPage';
import SearchPage from './components/listings/SearchPage';
import reportWebVitals from './reportWebVitals';

const history = createBrowserHistory();


ReactDOM.render(
  <Router history={history}>
    <Route path='/upload'>
      <UploadPage/>
    </Route>
    <Route path='/search'>
      <SearchPage/>
    </Route>
  </Router>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
