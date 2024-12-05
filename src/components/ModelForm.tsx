import React, { useState } from 'react';
import { Upload, Plus, X } from 'lucide-react';
import { ModelFormData } from '../types/model';
import JSZip from 'jszip';
import { supabase } from '../services/supabase';

interface ModelFormProps {
  onSubmit: (model: ModelFormData) => Promise<void>;
  isLoading: boolean;
}

async function createImageZip(images: string[]): Promise<Blob> {
  const zip = new JSZip();
  
  // Convert base64 images to blobs and add to zip
  images.forEach((base64String, index) => {
    const imageData = base64String.split(',')[1];
    const extension = base64String.split(';')[0].split('/')[1];
    zip.file(`image_${index + 1}.${extension}`, imageData, { base64: true });
  });

  return await zip.generateAsync({ type: 'blob' });
}

async function uploadZipToSupabase(zipBlob: Blob): Promise<string> {
  const fileName = `training_images_${Date.now()}.zip`;
  
  const { data, error } = await supabase.storage
    .from('training-images')
    .upload(fileName, zipBlob, {
      contentType: 'application/zip',
    });

  if (error) {
    throw new Error('Failed to upload zip file: ' + error.message);
  }

  // Get public URL for the uploaded file
  const { data: { publicUrl } } = supabase.storage
    .from('training-images')
    .getPublicUrl(fileName);

  return publicUrl;
}

export function ModelForm({ onSubmit, isLoading }: ModelFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log('images', images);
      setUploadProgress('Creating zip file...');
      const zipBlob = await createImageZip(images);
      
      console.log('zipBlob', zipBlob);
      setUploadProgress('Uploading zip file...');
      const zipUrl = await uploadZipToSupabase(zipBlob);
      
      console.log('zipUrl', zipUrl);
      setUploadProgress('Submitting model...');
      await onSubmit({ name, description, images: zipUrl });
      
      setName('');
      setDescription('');
      setImages([]);
      setUploadProgress('');
    } catch (error) {
      console.error('Error processing images:', error);
      setUploadProgress('Error: Failed to process images');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImages([...images, base64String]);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Model Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Model Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Training Images</label>
        <div className="mt-2 grid grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative">
              <img
                src={image}
                alt={`Training ${index + 1}`}
                className="h-24 w-full rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
              >
                <X size={16} />
              </button>
            </div>
          ))}
          <label className="flex h-24 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <Plus className="text-gray-400" />
          </label>
        </div>
      </div>

      {uploadProgress && (
        <div className="text-sm text-blue-600">{uploadProgress}</div>
      )}

      <button
        type="submit"
        disabled={isLoading || images.length === 0}
        className={`flex w-full items-center justify-center rounded-md px-4 py-2 text-white ${
          isLoading || images.length === 0
            ? 'bg-blue-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        <Upload className="mr-2" size={20} />
        {isLoading ? 'Training Model...' : 'Create Model'}
      </button>
    </form>
  );
}