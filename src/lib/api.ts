
/**
 * API functions for plant detection service
 */

// Types for the API response
export interface DetectionResult {
  prediction: PlantPrediction;
  status: string;
  time: number;
  model: string;
  version: string;
}

export interface PlantPrediction {
  top: string;
  confidence: number;
  detections: Detection[];
  image: {
    width: number;
    height: number;
  };
}

export interface Detection {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  confidence: number;
  class: string;
  class_id: number;
}

/**
 * Upload image and get plant detection result
 */
export const detectPlant = async (imageFile: File): Promise<DetectionResult> => {
  try {
    // Convert the file to base64
    const base64Image = await fileToBase64(imageFile);
    
    // Call the Roboflow API with the base64 image
    const response = await fetch('https://detect.roboflow.com/infer/workflows/aayuvu/classify-and-conditionally-detect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        api_key: 'LadGXocsnf9f2msQ7cfH',
        inputs: {
          "image": {"type": "base64", "value": base64Image.split(',')[1]}
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const responseData = await response.json();
    console.log('Roboflow API Response:', responseData);
    
    // Extract relevant data from the response
    if (responseData.outputs && responseData.outputs[0]) {
      const output = responseData.outputs[0];
      
      // If we have classification results
      if (output.classification_predictions) {
        const classificationResult = output.classification_predictions;
        
        // Format result to match our interface
        const result: DetectionResult = {
          prediction: {
            top: classificationResult.top || "",
            confidence: classificationResult.confidence || 0,
            detections: classificationResult.predictions ? classificationResult.predictions.map((pred: any) => ({
              confidence: pred.confidence,
              class: pred.class,
              class_id: pred.class_id || 0
            })) : [],
            image: classificationResult.image || { width: 0, height: 0 }
          },
          status: "success",
          time: classificationResult.time || 0,
          model: output.model || "unknown",
          version: responseData.version || "1.0"
        };
        
        return result;
      } 
      // If we have detection results
      else if (output.detection_predictions) {
        const detectionResult = output.detection_predictions;
        
        // Format detection results
        const result: DetectionResult = {
          prediction: {
            top: output.top_class || "",
            confidence: detectionResult.predictions?.[0]?.confidence || 0,
            detections: detectionResult.predictions || [],
            image: detectionResult.image || { width: 0, height: 0 }
          },
          status: "success",
          time: detectionResult.time || 0,
          model: output.model || "unknown",
          version: responseData.version || "1.0"
        };
        
        return result;
      }
    }
    
    // If we couldn't parse the response in the expected format
    throw new Error('Invalid response format from detection API');
  } catch (error) {
    console.error('Error detecting plant:', error);
    throw error;
  }
};

/**
 * Convert file to base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Convert base64 string to file object
 */
export const base64ToFile = (base64: string, filename: string): File => {
  const arr = base64.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new File([u8arr], filename, { type: mime });
};

// Helper function to get plant name from class string
export const formatPlantName = (className: string): string => {
  if (!className) return "Unknown Plant";
  
  // Replace underscores and hyphens with spaces
  let formatted = className.replace(/[_-]/g, ' ');
  
  // Capitalize each word
  formatted = formatted
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  
  return formatted;
};
