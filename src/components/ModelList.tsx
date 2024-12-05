import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { AIModel } from '../types/model';
import { Brain, CheckCircle, XCircle, Loader2 } from 'lucide-react';

// Initialize Supabase client with environment variables
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface ModelListProps {
  models: AIModel[];
}

export function ModelList() {
  const [models, setModels] = useState<AIModel[]>([]);

  useEffect(() => {
    // Fetch models from Supabase
    const fetchModels = async () => {
      const { data, error } = await supabase
        .from('models')
        .select('*');

      if (error) {
        console.error('Error fetching models:', error);
      } else {
        setModels(data);
      }
    };

    fetchModels();
  }, []);

  if (models.length === 0) {
    return (
      <div className="text-center text-gray-500">
        <p>No models created yet</p>
      </div>
    );
  }

  const getStatusIcon = (status: AIModel['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'training':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
    }
  };

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {models.map((model) => (
        <div
          key={model.id}
          className="overflow-hidden rounded-lg bg-white shadow transition-shadow hover:shadow-md"
        >
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Brain className="h-8 w-8 text-blue-500" />
                <h3 className="ml-2 text-lg font-semibold text-gray-900">{model.name}</h3>
              </div>
              {getStatusIcon(model.status)}
            </div>
            <p className="mt-2 text-sm text-gray-600">{model.description}</p>
            <div className="mt-4">
              <p className="text-xs text-gray-500">
                Created {new Date(model.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-3">
            <div className="flex -space-x-2 overflow-hidden">
              {/* Assuming model.images is an array of image URLs */}
              {model.images?.slice(0, 3).map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Training ${index + 1}`}
                  className="h-8 w-8 rounded-full border-2 border-white object-cover"
                />
              ))}
              {model.images?.length > 3 && (
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-200 text-xs text-gray-500">
                  +{model.images.length - 3}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}