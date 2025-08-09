
import React, { useState } from 'react';
import { FabricCanvasApi } from './FabricCanvas';

interface ImageUploaderProps {
  fabricCanvasRef: React.RefObject<FabricCanvasApi | null>;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ fabricCanvasRef }) => {
  const [imageUrl, setImageUrl] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      fabricCanvasRef.current?.addImageFromFile(file);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(e.target.value);
  };

  const addImageFromUrl = () => {
    if (imageUrl) {
      fabricCanvasRef.current?.addImageFromUrl(imageUrl);
      setImageUrl('');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
      <div>
        <label>Upload Image:</label>
        <input type="file" accept="image/*" onChange={handleFileChange} />
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={imageUrl}
          onChange={handleUrlChange}
          placeholder="Enter image URL"
          style={{ flexGrow: 1 }}
        />
        <button onClick={addImageFromUrl}>Add from URL</button>
      </div>
    </div>
  );
};

export default ImageUploader;
