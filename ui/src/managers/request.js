import axios from 'axios';
import _ from 'lodash';

class RequestManager {
  constructor() {
    this.requestHooks = {};
    this.responseHooks = {};
  }

  create(options) {
    const request = axios.create();
    const key = _.get(options, 'key', 'default');
    const requests = this.requestHooks[key] || [];
    for (const hook of requests) {
      const { intercept, exception } = hook;
      request.interceptors.request.use(
        intercept,
        exception
      );
    }

    const responses = this.responseHooks[key] || [];
    for (const hook of responses) {
      const { intercept, exception } = hook;
      request.interceptors.response.use(
        intercept,
        exception
      );
    }
    
    return request;
  }

  before(key, intercept, exception) {
    const hooks = this.requestHooks[key] || [];
    hooks.push({
      intercept: intercept,
      exception: exception
    });
    this.requestHooks[key] = hooks;
  }

  after(key, intercept, exception) {
    const hooks = this.responseHooks[key] || [];
    hooks.push({
      intercept: intercept,
      exception: exception
    });
    this.responseHooks[key] = hooks;
  }
}

class AuthRequestManager extends RequestManager {
  create(options) {
    const defaults = {
      key: 'auth'
    };
    return super.create(Object.assign({}, defaults, options));
  }

  setToken(intercept, exception) {
    super.before('auth', intercept, exception);
  }

  swapToken(intercept, exception) {
    super.after('auth', intercept, exception);
  }
}


const Request = new RequestManager();
const AuthRequest = new AuthRequestManager();

const catchErrors = (error) => {
    const response = error.response || null;
    
    let message = error.message;
    let data = {};
    if (response) {
      const body = response.data;
      message = _.get(body, 'message', message);
      data = _.get(body,'data', data);
    }

    return Promise.reject({
        message: message,
        data: data,
        response: response,
        exception: error //Send original just in case
    });
}

const getBody = (response) => {
    return response.data || null;
}
export { Request, AuthRequest, catchErrors, getBody };