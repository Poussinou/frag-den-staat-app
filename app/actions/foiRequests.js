import R from 'ramda';

import { ORIGIN } from '../globals';
import { fetchAndDispatch } from '../utils/networking';
import { mapToFakeStatus } from '../utils';

function foiRequestsErrorAction(error) {
  return {
    type: 'FOI_REQUESTS_ERROR',
    error,
  };
}

function foiRequestsErrorClearAction() {
  return {
    type: 'FOI_REQUESTS_ERROR_CLEAR',
  };
}

function foiRequestsInvalidateDataAction() {
  return {
    type: 'FOI_REQUESTS_INVALIDATE_DATA',
  };
}

function foiRequestsPendingAction() {
  return {
    type: 'FOI_REQUESTS_PENDING',
  };
}

function foiRequestsSuccessAction(requests) {
  return {
    type: 'FOI_REQUESTS_SUCCESS',
    requests,
  };
}

function foiRequestsRefreshingAction() {
  return {
    type: 'FOI_REQUESTS_REFRESHING',
  };
}

function foiRequestsRefreshingSuccessAction(requests) {
  return {
    type: 'FOI_REQUESTS_REFRESHING_SUCCESS',
    requests,
  };
}

function foiRequestsFilterChangeAction(filter) {
  return {
    type: 'FOI_REQUESTS_FILTER_CHANGE',
    filter,
  };
}

const PAGE_SIZE = 20;
const DEFAULT_PATH = '/api/v1/request/';

function buildUrl(getState) {
  const { filter, nPage, isRefreshing } = getState().foiRequests;
  let offset = PAGE_SIZE * nPage;

  // page is still the former value in case the refresh fails
  if (isRefreshing) {
    offset = 0;
  }

  const url = `${ORIGIN}${DEFAULT_PATH}`;

  const params = new Map([
    ['limit', `${PAGE_SIZE}`],
    ['offset', `${offset}`],
    ['is_foi', 'true'], // filter out crappy requests
  ]);

  if (filter.status) {
    // fake status and resolition
    const { status, resolution } = mapToFakeStatus(filter.status.param);

    params.set('status', status);
    if (resolution) {
      params.set('resolution', resolution);
    }
  }

  if (filter.publicBody) {
    params.set('public_body', filter.publicBody.param);
    params.delete('is_foi'); // show all requests here. it's irritating when the numbers show on the button don't match with the one in the table.
  } else {
    // when the requests are filtered by public body, ignore jurisdiction and category
    if (filter.jurisdiction) {
      params.set('jurisdiction', filter.jurisdiction.param);
    }

    // TODO: Not supported by the API?
    // if (filter.category) {
    //   params += `&category=${filter.category}`;
    // }
  }

  const paramsAsString = [...params].map(x => `${x[0]}=${x[1]}`).join('&');

  return `${url}?${paramsAsString}`;
}

function fetchRequests(beforeFetchDispatchedAction, onSuccessFetch) {
  return (dispatch, getState) => {
    const { filter } = getState().foiRequests;

    const buildUrlFunc = (function makeBuildUrlFunc() {
      return () => buildUrl(getState);
    })();

    // only dispatch if the filter is still the same
    const onSuccess = (function makeOnSuccessFunc(
      innerDispatch,
      innerGetState,
      innerFilter
    ) {
      return data => {
        if (R.equals(innerFilter, innerGetState().foiRequests.filter)) {
          innerDispatch(onSuccessFetch(data));
        }
      };
    })(dispatch, getState, filter);

    fetchAndDispatch(
      buildUrlFunc,
      dispatch,
      beforeFetchDispatchedAction,
      onSuccess,
      foiRequestsErrorAction,
      filter
    );
  };
}

function foiRequestsFetchData() {
  return fetchRequests(foiRequestsPendingAction, foiRequestsSuccessAction);
}

function foiRequestsRefreshData() {
  return fetchRequests(
    foiRequestsRefreshingAction,
    foiRequestsRefreshingSuccessAction
  );
}

function foiRequestsFilterChange(filter) {
  return dispatch => {
    dispatch(foiRequestsFilterChangeAction(filter));
    // first delete old data
    dispatch(foiRequestsInvalidateDataAction());
    //  and second fetch new one
    dispatch(foiRequestsFetchData());
  };
}

export {
  foiRequestsFetchData,
  foiRequestsRefreshData,
  foiRequestsFilterChange,
  foiRequestsErrorClearAction,
};
