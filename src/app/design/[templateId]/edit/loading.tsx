"use client";

import React from "react";

export default function Loading() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          Loading Your Certificate Editor
        </h2>
        <p className="text-gray-500">
          Preparing your creative workspace...
        </p>
      </div>
    </div>
  );
}
