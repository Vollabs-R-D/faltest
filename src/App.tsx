import React, { useState } from 'react';
import { ModelForm } from './components/ModelForm';
import { ModelList } from './components/ModelList';
import { TrainingLogs } from './components/TrainingLogs';
import { AIModel, ModelFormData } from './types/model';
import { Brain } from 'lucide-react';
import { trainModel } from './services/falai';
import { supabase } from './services/supabase';

function App() {
  const [models, setModels] = useState<AIModel[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingLogs, setTrainingLogs] = useState<string[]>([]);

  const handleCreateModel = async (modelData: ModelFormData) => {
    const newModel: AIModel = {
      ...modelData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      status: 'training',
      trainingLogs: []
    };

    try {
      setIsTraining(true);
      setTrainingLogs([]);
      setModels([newModel, ...models]);

      const { requestId, logs } = await trainModel(modelData.images);

      const { error: supabaseError } = await supabase
        .from('models')
        .insert({
          id: newModel.id,
          name: modelData.name,
          status: 'completed',
          zip_url: modelData.images,
          created_at: newModel.createdAt,
          fal_model_id: requestId
        });

      if (supabaseError) throw supabaseError;

      setModels(currentModels => 
        currentModels.map(model => 
          model.id === newModel.id 
            ? { ...model, status: 'completed', requestId, trainingLogs: logs }
            : model
        )
      );

      setTrainingLogs(logs);
    } catch (error) {
      setModels(currentModels => 
        currentModels.map(model => 
          model.id === newModel.id 
            ? { ...model, status: 'failed' }
            : model
        )
      );
      console.error('Failed to create model:', error);
    } finally {
      setIsTraining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="flex items-center justify-center">
            <Brain className="h-12 w-12 text-blue-600" />
            <h1 className="ml-3 text-3xl font-bold text-gray-900">AI Model Creator</h1>
          </div>
          <p className="mt-2 text-gray-600">Create and manage your custom AI models</p>
        </div>

        <div className="mt-12 rounded-lg bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">Create New Model</h2>
          <div className="mt-6">
            <ModelForm onSubmit={handleCreateModel} isLoading={isTraining} />
            <TrainingLogs logs={trainingLogs} />
          </div>
        </div>

        <div className="mt-12">
          <h2 className="mb-6 text-xl font-semibold text-gray-900">Your Models</h2>
          <ModelList models={models} />
        </div>
      </div>
    </div>
  );
}

export default App;