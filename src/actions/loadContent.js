import axios from 'axios';
import _ from 'lodash';
import parserRSS from '../parsers/parserRSS.js';
import PROXY from '../constants/proxy.js';

const loadContent = (state, url) => {
  state.form.processState = 'sending';

  axios.get(PROXY + encodeURIComponent(url))
    .then((response) => {
      const { feeds, posts } = parserRSS(response.data.contents);
      const postsWithUniqueId = posts.map((post) => ({ ...post, id: _.uniqueId() }));
      state.feeds = [feeds, ...state.feeds];
      state.posts = [...postsWithUniqueId, ...state.posts];
      state.urls = [...state.urls, url];
      state.form.errors = {};
      state.form.processState = 'successful';
    })
    .catch((err) => {
      console.log('loadContent error', err);
      if (err.name === 'AxiosError') {
        state.form.processError = 'networkError';
      } else if (err.name === 'invalidRSS') {
        state.form.processError = 'invalidRSS';
      } else {
        state.form.processError = 'unexpectedError';
      }
    });
};

export default loadContent;
