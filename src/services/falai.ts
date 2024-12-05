import { fal } from "@fal-ai/client";

fal.config({
  credentials: "3b511e22-ac67-4f03-be03-bb33ab19c5b0:d426602948931daaeff08070074e67a0"
});

function isValidZipUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return url.toLowerCase().endsWith('.zip');
  } catch {
    return false;
  }
}

export async function trainModel(imagesData: string): Promise<{ requestId: string; logs: string[] }> {
  const logs: string[] = [];
  
  if (!isValidZipUrl(imagesData)) {
    throw new Error('imagesData must be a valid URL pointing to a zip archive');
  }

  try {
    console.log('Attempting to connect with credentials...');
    
    const result = await fal.subscribe("fal-ai/flux-lora-fast-training", {
      input: {
        images_data_url: imagesData,
        steps: 100
      },
      logs: true,
      onQueueUpdate: (update) => {
        console.log('Queue update:', update);
        if (update.status === "IN_PROGRESS") {
          const newLogs = update.logs.map((log) => log.message);
          logs.push(...newLogs);
        }
      },
    });

    console.log('API call successful:', result);

    return {
      requestId: result.requestId,
      logs
    };
  } catch (error: unknown) {
    const err = error as { message?: string; status?: number; response?: unknown };
    console.error('Training failed:', {
      error: err,
      message: err.message,
      status: err.status,
      response: err.response
    });
    throw error;
  }
}