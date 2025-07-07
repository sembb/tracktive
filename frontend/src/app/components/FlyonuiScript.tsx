// src/app/components/FlyonuiScript.tsx
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function FlyonuiScript() {
  const path = usePathname();

  useEffect(() => {
    const loadClientLibs = async () => {
      if (typeof window === 'undefined') return;

      // Dynamically import jQuery and assign to global
      const jQuery = (await import('jquery')).default;
      const _ = (await import('lodash')).default;
      const noUiSlider = (await import('nouislider')).default;

      window.$ = jQuery;
      window.jQuery = jQuery;
      window._ = _;
      window.noUiSlider = noUiSlider;

      // Import jQuery plugins after jQuery is set globally
      await import('datatables.net'); // now $.extend is defined
      await import('dropzone/dist/dropzone-min.js');

      window.DataTable = jQuery.fn.dataTable;

      // Now load FlyonUI
      await import('flyonui/flyonui');
    };

    loadClientLibs();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (
        window.HSStaticMethods &&
        typeof window.HSStaticMethods.autoInit === 'function'
      ) {
        window.HSStaticMethods.autoInit();
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, [path]);

  return null;
}
