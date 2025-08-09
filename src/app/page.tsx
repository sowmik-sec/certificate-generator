'use client';

import React, { useRef } from 'react';
import FabricCanvas, { FabricCanvasApi } from '../components/FabricCanvas';
import ToolbarText from '../components/ToolbarText';

export default function Home() {
  const fabricCanvasRef = useRef<FabricCanvasApi>(null);

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ flex: 1, borderRight: '1px solid #ccc', padding: '10px' }}>
        <ToolbarText fabricCanvasRef={fabricCanvasRef} />
      </div>
      <div style={{ flex: 3, padding: '10px' }}>
        <FabricCanvas ref={fabricCanvasRef} />
      </div>
    </div>
  );
}