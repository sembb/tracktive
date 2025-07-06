import jQuery from 'jquery';

if (typeof window !== 'undefined') {
  window.$ = jQuery;
  window.jQuery = jQuery;
}

export default jQuery;