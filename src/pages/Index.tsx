
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import ImageUploader from '@/components/ImageUploader';
import DetectionResult from '@/components/DetectionResult';
import AnimatedLogo from '@/components/AnimatedLogo';
import LoadingAnimation from '@/components/LoadingAnimation';
import { Detection, PlantPrediction, detectPlant, formatPlantName } from '@/lib/api';
import { ArrowDown, Info, Upload, History, X, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const Index: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [predictions, setPredictions] = useState<Detection[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageDetails, setImageDetails] = useState<{width: number, height: number} | null>(null);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [recentImages, setRecentImages] = useState<string[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Load recent images from localStorage on mount
  useEffect(() => {
    const savedImages = localStorage.getItem('recentImages');
    if (savedImages) {
      try {
        setRecentImages(JSON.parse(savedImages).slice(0, 3));
      } catch (e) {
        console.error('Error parsing recent images', e);
      }
    }
  }, []);

  // Save recent images to localStorage when they change
  useEffect(() => {
    if (recentImages.length > 0) {
      localStorage.setItem('recentImages', JSON.stringify(recentImages));
    }
  }, [recentImages]);

  const handleImageSelected = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setPredictions(null);
    setHasAnalyzed(false);
    
    try {
      // Create preview and save to recent images
      const reader = new FileReader();
      reader.onload = () => {
        const imageUrl = reader.result as string;
        setPreviewUrl(imageUrl);
        
        // Save to recent images (avoid duplicates)
        if (!recentImages.includes(imageUrl)) {
          setRecentImages(prev => [imageUrl, ...prev].slice(0, 3));
        }
      };
      reader.readAsDataURL(file);
      
      // Get the image dimensions first
      const dimensions = await getImageDimensions(file);
      setImageDetails(dimensions);
      
      // Process the image
      const result = await detectPlant(file);
      console.log("Detection result:", result);
      
      // Handle the response
      if (result?.prediction) {
        if (result.prediction.detections && result.prediction.detections.length > 0) {
          setPredictions(result.prediction.detections);
          
          // Show success toast
          const topResult = result.prediction.detections[0];
          if (topResult) {
            toast.success(`Identified as ${formatPlantName(topResult.class)}`, {
              description: `${Math.round((topResult.confidence || 0) * 100)}% confidence`
            });
          } else {
            toast.info("Analysis complete", { 
              description: "No plants were confidently identified" 
            });
          }
        } else {
          setError('No plant species detected in the image');
          toast.error('Analysis failed', { 
            description: 'No plant species could be detected' 
          });
        }
      } else {
        setError('No valid response from the detection service');
        toast.error('Analysis failed', { 
          description: 'No response from the detection service' 
        });
      }
    } catch (err) {
      console.error('Error processing image:', err);
      setError('Error analyzing image. Please try again.');
      toast.error('Analysis failed', { 
        description: 'There was an error processing your image' 
      });
    } finally {
      setIsLoading(false);
      setHasAnalyzed(true);
    }
  };

  const getImageDimensions = (file: File): Promise<{width: number, height: number}> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleRecentImageClick = (imageUrl: string) => {
    // Convert base64 to file and process
    const arr = imageUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    const file = new File([u8arr], "recent-image.jpg", { type: mime });
    handleImageSelected(file);
  };

  const clearResults = () => {
    setPredictions(null);
    setError(null);
    setHasAnalyzed(false);
    setPreviewUrl(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <motion.header 
        className="w-full border-b glass sticky top-0 z-10"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto py-4 px-4 sm:px-6 flex justify-between items-center">
          <AnimatedLogo />
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-xs gap-1">
              <Info className="h-3.5 w-3.5" />
              About
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Main content */}
      <main className="flex-1 container mx-auto px-4 sm:px-6 py-8 max-w-5xl">
        <motion.div 
          className="mb-10 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-block mb-2 px-3 py-1 bg-primary/10 rounded-full text-xs font-medium text-primary animate-fade-in">
            Medicinal Plant Identification
          </div>
          <h1 className="text-4xl font-bold mb-3 tracking-tight animate-fade-up [animation-delay:200ms]">
            Identify Medicinal Plants
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto animate-fade-up [animation-delay:300ms]">
            Upload an image of any medicinal plant and our AI will identify the species.
            Get instant results with high accuracy.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload section */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="p-6 glass border-0 shadow-sm">
              <CardContent className="p-0">
                <ImageUploader 
                  onImageSelected={handleImageSelected} 
                  isLoading={isLoading} 
                />
                
                {/* Recent images */}
                {recentImages.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center gap-2 mb-3">
                      <History className="h-4 w-4 text-muted-foreground" />
                      <h3 className="text-sm font-medium text-muted-foreground">Recent Plants</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {recentImages.map((img, idx) => (
                        <div 
                          key={idx} 
                          className="aspect-square rounded-lg overflow-hidden border border-muted cursor-pointer hover:border-primary/50 transition-all hover:shadow-md"
                          onClick={() => handleRecentImageClick(img)}
                        >
                          <img src={img} alt={`Recent ${idx+1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Results section */}
          <motion.div 
            className="lg:col-span-1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Card className="glass border-0 shadow-sm">
                    <CardContent className="py-6">
                      <LoadingAnimation />
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (predictions || error) ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative"
                >
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute -top-2 -right-2 z-10 bg-background rounded-full shadow-sm"
                    onClick={clearResults}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <DetectionResult 
                    predictions={predictions} 
                    error={error}
                    imageWidth={imageDetails?.width}
                    imageHeight={imageDetails?.height}
                    className="glass border-0 shadow-sm"
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Card className="glass border-0 shadow-sm">
                    <CardContent className="p-6 text-center">
                      <div className="flex flex-col items-center">
                        <motion.div 
                          className="flex items-center justify-center rounded-full bg-primary/10 p-3 mb-3"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                        >
                          <ArrowDown className="h-5 w-5 text-primary" />
                        </motion.div>
                        <h3 className="font-medium mb-1">Upload a Plant Image</h3>
                        <p className="text-sm text-muted-foreground">
                          Results will appear here after analysis
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
        
        {/* Info section */}
        <motion.div 
          className="mt-16 mb-10"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-2">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our advanced AI model helps you identify medicinal plants with just a photo
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "1",
                title: "Upload",
                description: "Take a photo of any medicinal plant leaf and upload it",
                icon: <Upload className="h-5 w-5 text-primary" />
              },
              {
                step: "2",
                title: "Analyze",
                description: "Our AI model processes the image and analyzes the leaf patterns",
                icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
              },
              {
                step: "3",
                title: "Identify",
                description: "Get accurate identification results with confidence scores",
                icon: <Leaf className="h-5 w-5 text-primary" />
              }
            ].map((item, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                className={cn(
                  "glass rounded-xl p-6 text-center transition-all hover-lift",
                  "border-0 shadow-sm"
                )}
              >
                <div className="inline-flex items-center justify-center rounded-full bg-primary/10 w-12 h-12 mb-4">
                  {item.icon}
                </div>
                <h3 className="text-lg font-medium mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <motion.footer 
        className="border-t py-6 glass"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <AnimatedLogo className="scale-75" />
            </div>
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} MediLeaf Plant Identifier • All Rights Reserved
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
};

export default Index;
