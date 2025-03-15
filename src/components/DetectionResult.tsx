
import React, { useState } from 'react';
import { Detection, formatPlantName } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Leaf, AlertCircle, Check, Info, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface DetectionResultProps {
  predictions: Detection[] | null;
  imageWidth?: number;
  imageHeight?: number;
  error?: string | null;
  className?: string;
}

const DetectionResult: React.FC<DetectionResultProps> = ({
  predictions,
  imageWidth,
  imageHeight,
  error,
  className
}) => {
  const [expanded, setExpanded] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState<Detection | null>(null);

  if (error) {
    return (
      <Card className={cn("border-destructive/50 w-full", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-destructive flex items-center gap-2 text-xl">
            <AlertCircle className="h-5 w-5" />
            Detection Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!predictions || predictions.length === 0) {
    return (
      <Card className={cn("border-muted w-full", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-muted-foreground flex items-center gap-2 text-xl">
            <Leaf className="h-5 w-5" />
            No Plants Detected
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Try uploading a clearer image of a medicinal plant.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Sort predictions by confidence
  const sortedPredictions = [...predictions].sort(
    (a, b) => (b.confidence || 0) - (a.confidence || 0)
  );

  const togglePlantDetails = (prediction: Detection) => {
    if (selectedPlant?.class === prediction.class) {
      setSelectedPlant(null);
    } else {
      setSelectedPlant(prediction);
    }
  };

  const hasMultiplePlants = sortedPredictions.length > 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className={cn("w-full shadow-sm overflow-hidden", className)}>
        <CardHeader className="pb-2 border-b bg-primary/5">
          <CardTitle className="flex items-center gap-2 text-xl">
            <div className="rounded-full bg-primary/20 p-1.5">
              <Leaf className="h-4 w-4 text-primary" />
            </div>
            Plant Identification Result
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {selectedPlant ? (
            <div className="p-4">
              <button 
                onClick={() => setSelectedPlant(null)}
                className="mb-4 text-sm flex items-center text-muted-foreground hover:text-primary transition-colors"
              >
                <ChevronUp className="h-4 w-4 mr-1" /> Back to all results
              </button>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold">{formatPlantName(selectedPlant.class)}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="bg-primary/10 hover:bg-primary/20">
                        {Math.round((selectedPlant.confidence || 0) * 100)}% Match
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 bg-muted/20 p-4 rounded-lg">
                  <h4 className="font-medium flex items-center gap-2 mb-2">
                    <Info className="h-4 w-4 text-primary" />
                    About This Plant
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {formatPlantName(selectedPlant.class)} is a medicinal plant that has been identified in your image.
                    The AI model has detected this plant with {Math.round((selectedPlant.confidence || 0) * 100)}% confidence.
                  </p>
                  
                  <div className="mt-4">
                    <Button variant="outline" size="sm" className="text-xs" onClick={() => window.open(`https://www.google.com/search?q=${formatPlantName(selectedPlant.class)}+medicinal+plant`, '_blank')}>
                      <ExternalLink className="h-3 w-3 mr-1" /> Learn More
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="divide-y">
              {sortedPredictions.slice(0, expanded ? undefined : 3).map((prediction, index) => {
                const confidence = Math.round((prediction.confidence || 0) * 100);
                const plantName = formatPlantName(prediction.class);
                
                return (
                  <motion.div
                    key={`${prediction.class}-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={cn(
                      "p-4 flex justify-between items-center cursor-pointer",
                      index === 0 ? "bg-primary/5" : "",
                      "transition-colors hover:bg-muted/30"
                    )}
                    onClick={() => togglePlantDetails(prediction)}
                  >
                    <div className="flex items-center gap-3">
                      {index === 0 && (
                        <div className="rounded-full bg-primary/20 p-1 text-primary">
                          <Check className="h-4 w-4" />
                        </div>
                      )}
                      <div>
                        <h3 className={cn(
                          "font-medium",
                          index === 0 ? "text-base" : "text-sm text-muted-foreground"
                        )}>
                          {plantName}
                        </h3>
                        {index === 0 && (
                          <Badge variant="outline" className="mt-1 bg-primary/10 hover:bg-primary/20">
                            Best Match
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right min-w-[65px]">
                      <div className={cn(
                        "text-sm font-medium",
                        confidence > 75 
                          ? "text-primary" 
                          : confidence > 40 
                          ? "text-amber-500" 
                          : "text-muted-foreground"
                      )}>
                        {confidence}%
                      </div>
                      {index === 0 && (
                        <div className="w-full h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                          <motion.div 
                            className="h-full bg-primary rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${confidence}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                          />
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
              
              {hasMultiplePlants && sortedPredictions.length > 3 && (
                <div className="p-2 flex justify-center">
                  <Button
                    variant="ghost" 
                    size="sm"
                    onClick={() => setExpanded(!expanded)}
                    className="text-xs flex items-center text-muted-foreground hover:text-primary"
                  >
                    {expanded ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-1" /> Show Less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-1" /> Show {sortedPredictions.length - 3} More
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DetectionResult;
