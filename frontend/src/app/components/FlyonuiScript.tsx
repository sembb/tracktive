'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import jQuery from 'jquery';

// Only run in browser
if (typeof window !== 'undefined') {
  window.$ = jQuery;
  window.jQuery = jQuery;
}

// Now import datatables.net after jQuery is on window
import dt from 'datatables.net';

if (typeof window !== 'undefined') {
  dt(window.jQuery); // initialize DataTables with jQuery
}

import noUiSlider from 'nouislider';
import 'dropzone/dist/dropzone-min.js';

window.noUiSlider = noUiSlider;

async function loadFlyonUI() {
  return import('flyonui/flyonui');
}

export default function FlyonuiScript() {
  const path = usePathname();

  useEffect(() => {
    loadFlyonUI().then(() => {
      if (window.HSStaticMethods && typeof window.HSStaticMethods.autoInit === 'function') {
        window.HSStaticMethods.autoInit();
      }
    });
  }, [path]);

  return null;
}
