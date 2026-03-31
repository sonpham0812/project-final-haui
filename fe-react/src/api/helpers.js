export const getQuery = () => new URLSearchParams(window.location.search);

export const setQuery = (params) => {
  window.history.pushState({}, "", `?${params.toString()}`);
};
