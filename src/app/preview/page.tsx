"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

function PreviewContent() {
  const searchParams = useSearchParams();
  const [code, setCode] = useState<string>("");

  useEffect(() => {
    const encodedCode = searchParams.get('code');
    if (encodedCode) {
      try {
        const decoded = decodeURIComponent(atob(encodedCode));
        setCode(decoded);
      } catch (e) {
        console.error("Failed to decode code from URL", e);
      }
    }
  }, [searchParams]);

  if (!code) {
    return (
      <div className="flex h-screen items-center justify-center font-sans text-gray-500">
        Loading preview...
      </div>
    );
  }

  return (
    <iframe
      srcDoc={code}
      className="h-screen w-full border-none"
      title="Live Preview"
      sandbox="allow-scripts allow-forms allow-same-origin"
    />
  );
}

export default function PreviewPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PreviewContent />
    </Suspense>
  );
}
