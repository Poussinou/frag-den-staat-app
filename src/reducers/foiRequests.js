const initialState = {
  isPending: false,
  requests: [],
  error: '',
  nPage: 0,
  nResults: -1,
  isRefreshing: false,
  firstPageFetchedAt: null,
  filter: {
    status: null,
    jurisdiction: null,
    category: null,
    publicBody: null,
    user: null,
  },
};

function foiRequests(state = initialState, action) {
  switch (action.type) {
    case 'FOI_REQUESTS_ERROR':
      return {
        ...state,
        isPending: false,
        isRefreshing: false,
        error: action.error,
      };
    case 'FOI_REQUESTS_INVALIDATE_DATA':
      return {
        ...state,
        requests: [],
        nResults: -1,
        nPage: 0,
      };
    case 'FOI_REQUESTS_PENDING':
      return { ...state, isPending: true };
    case 'FOI_REQUESTS_SUCCESS': {
      return {
        ...state,
        isPending: false,
        requests: [...state.requests, ...action.requests.objects],
        nPage: state.nPage + 1,
        nResults: action.requests.meta.total_count,
        firstPageFetchedAt: Date.now(),
      };
    }
    case 'FOI_REQUESTS_REFRESHING':
      return {
        ...state,
        isRefreshing: true,
      };
    case 'FOI_REQUESTS_REFRESHING_SUCCESS': {
      return {
        ...state,
        isRefreshing: false,
        requests: action.requests.objects,
        nPage: 1, // because we already got 1
        nResults: action.requests.meta.total_count,
      };
    }
    case 'FOI_REQUESTS_FILTER_CHANGE': {
      return {
        ...state,
        filter: {
          ...state.filter,
          ...action.filter,
        },
      };
    }
    case 'FOI_REQUESTS_ERROR_CLEAR':
      return {
        ...state,
        error: '',
      };
    case 'OAUTH_LOGOUT':
      return initialState;
    default:
      return state;
  }
}

export default foiRequests;
