function foiRequestsErrorAction(error) {
  return {
    type: 'FOI_REQUESTS_ERROR',
    error,
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

function fetchAndDispatch(url, beforeFetch, onSuccessFetch) {
  return (dispatch, getState) => {
    dispatch(beforeFetch());

    const { filter, nPage, isRefreshing } = getState().foiRequests;

    let offset = PAGE_SIZE * nPage;

    // page is still the former value in case the refresh fails
    if (isRefreshing) {
      offset = 0;
    }

    const baseParam = `?limit=${PAGE_SIZE}&offset=${offset}&is_foi=true`; // filter out crap
    let params = baseParam;

    if (filter.jurisdiction) {
      params += `&jurisdiction=${filter.jurisdiction}`;
    }

    if (filter.status) {
      params += `&status=${filter.status}`;
    }

    // TODO: Not supported by the API?
    // if (filter.category) {
    //   params += `&category=${filter.category}`;
    // }

    const fullUrl = `${url}${params}`;
    console.log('fullUrl', fullUrl);

    fetch(fullUrl)
      .then(response => {
        if (!response.ok) {
          throw Error(response.status);
        }
        setTimeout(() => null, 0); // workaround for issue-6679
        return response;
      })
      .then(response => response.json())
      .then(requests => dispatch(onSuccessFetch(requests)))
      .catch(error => dispatch(foiRequestsErrorAction(error.message)));
  };
}

const ORIGIN = 'https://fragdenstaat.de';
const DEFAULT_PATH = '/api/v1/request/';

function foiRequestsFetchData(path = DEFAULT_PATH) {
  return fetchAndDispatch(
    `${ORIGIN}${path}`,
    // filter,
    foiRequestsPendingAction,
    foiRequestsSuccessAction
  );
}

function foiRequestsRefreshData(filter) {
  return fetchAndDispatch(
    `${ORIGIN}${DEFAULT_PATH}`,
    // filter,
    foiRequestsRefreshingAction,
    foiRequestsRefreshingSuccessAction
  );
}

function foiRequestsFilterChange(filter) {
  return dispatch => dispatch(foiRequestsFilterChangeAction(filter));
}

export {
  foiRequestsFetchData,
  foiRequestsRefreshData,
  foiRequestsFilterChange,
};
