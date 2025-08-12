'use client';

import DOMPurify from 'dompurify';

interface SafeDescriptionProps {
  html: string;
}

export default function SafeDescription({ html }: SafeDescriptionProps) {
  const cleanHtml = DOMPurify.sanitize(html);
  return <div dangerouslySetInnerHTML={{ __html: cleanHtml }} />;
}