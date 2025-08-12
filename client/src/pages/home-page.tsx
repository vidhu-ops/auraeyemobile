import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { AuraGlow } from "@/components/ui/aura-glow";
import ServiceCard from "@/components/ui/service-card";
import TestimonialCard from "@/components/ui/testimonial-card";
import { useAuth } from "@/hooks/use-auth";
import { useCredits } from "@/hooks/use-credits";
import { ArrowRight, Camera, BookOpen, Upload, Star, HandHelping, Book, Calculator, Clover, Box, Loader2, Sparkles, Heart, AlertTriangle, CreditCard } from "lucide-react";
import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface QuickVibeResult {
  dominantColor: string;
  colorMeaning: {
    positive: string;
    negative: string;
  };
  energyLevel: number;
  message: string;
}

export default function HomePage() {
  const { user } = useAuth();
  const { credits, isLoading: creditsLoading } = useCredits();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [vibeResult, setVibeResult] = useState<QuickVibeResult | null>(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Quick vibe analysis mutation
  // Add watermark to image
  const addWatermark = (ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) => {
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    
    // Set watermark properties
    ctx.save();
    ctx.globalAlpha = 0.5; // 50% opacity
    ctx.fillStyle = 'white';
    ctx.font = '100px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Add text shadow for better visibility
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    // Draw watermark text
    ctx.fillText('AuraEye', centerX, centerY);
    
    ctx.restore();
  };

  // Process image with aura visualization and watermark
  const processImageWithVibeAura = (imageBase64: string, dominantColor: string) => {
    const img = new Image();
    img.src = imageBase64;
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // PRESERVE ORIGINAL IMAGE DIMENSIONS - DO NOT RESIZE
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw original image at full size
      ctx.drawImage(img, 0, 0, img.width, img.height);
      
      // Get color RGB values
      const colorRGB = getColorRGB(dominantColor);
      
      // Create dense smokey cloud effect around person
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const personRadius = Math.min(canvas.width, canvas.height) * 0.25; // Enhanced face protection radius for better visibility
      
      // Parse color RGB values
      const [r, g, b] = colorRGB.split(',').map(num => parseInt(num.trim()));
      
      // Create deterministic seeded random for consistent results
      let seed = dominantColor.charCodeAt(0) + canvas.width + canvas.height;
      const seededRandom = () => {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
      };
      
      // LAYER 1: Ultra-dense background smoke - massive cloud coverage
      ctx.save();
      ctx.filter = 'blur(40px)';
      ctx.globalCompositeOperation = 'multiply';
      for (let i = 0; i < 300; i++) {
        const x = seededRandom() * canvas.width;
        const y = seededRandom() * canvas.height;
        
        // Skip if too close to person's face - enhanced protection zone
        const distanceFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        if (distanceFromCenter < personRadius * 1.5) continue; // Larger clearance for face visibility
        
        const radius = 30 + seededRandom() * 150;
        const opacity = 0.35 + seededRandom() * 0.45;
        
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      
      // LAYER 2: Dense medium smoke particles - cloud density
      ctx.save();
      ctx.filter = 'blur(25px)';
      ctx.globalCompositeOperation = 'soft-light';
      for (let i = 0; i < 400; i++) {
        const x = seededRandom() * canvas.width;
        const y = seededRandom() * canvas.height;
        
        const distanceFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        if (distanceFromCenter < personRadius * 1.4) continue; // Enhanced face protection
        
        const radius = 20 + seededRandom() * 80;
        const opacity = 0.25 + seededRandom() * 0.35;
        
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      
      // LAYER 3: Super dense small particles - concentrated smoke
      ctx.save();
      ctx.filter = 'blur(18px)';
      ctx.globalCompositeOperation = 'overlay';
      for (let i = 0; i < 500; i++) {
        const x = seededRandom() * canvas.width;
        const y = seededRandom() * canvas.height;
        
        const distanceFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        if (distanceFromCenter < personRadius * 1.3) continue; // Enhanced face protection
        
        const radius = 8 + seededRandom() * 40;
        const opacity = 0.2 + seededRandom() * 0.3;
        
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      
      // LAYER 4: Fine smoke wisps - detail layer
      ctx.save();
      ctx.filter = 'blur(12px)';
      ctx.globalCompositeOperation = 'color-dodge';
      for (let i = 0; i < 600; i++) {
        const x = seededRandom() * canvas.width;
        const y = seededRandom() * canvas.height;
        
        const distanceFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        if (distanceFromCenter < personRadius * 1.3) continue; // Enhanced face protection
        
        const radius = 4 + seededRandom() * 20;
        const opacity = 0.15 + seededRandom() * 0.25;
        
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      
      // LAYER 5: Perimeter concentrated smoke - ultra-dense around person
      ctx.save();
      ctx.filter = 'blur(20px)';
      ctx.globalCompositeOperation = 'multiply';
      for (let i = 0; i < 400; i++) {
        // Create concentrated smoke around person's perimeter
        const angle = seededRandom() * Math.PI * 2;
        const distance = personRadius * 1.6 + seededRandom() * (Math.min(canvas.width, canvas.height) * 0.3); // Larger face clearance
        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;
        
        // Skip if outside canvas
        if (x < 0 || x > canvas.width || y < 0 || y > canvas.height) continue;
        
        const radius = 15 + seededRandom() * 60;
        const opacity = 0.2 + seededRandom() * 0.35;
        
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      
      // LAYER 6: Ultra-fine atmospheric mist - seamless merging
      ctx.save();
      ctx.filter = 'blur(35px)';
      ctx.globalCompositeOperation = 'screen';
      for (let i = 0; i < 200; i++) {
        const x = seededRandom() * canvas.width;
        const y = seededRandom() * canvas.height;
        
        const distanceFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        if (distanceFromCenter < personRadius * 1.2) continue; // Enhanced face protection
        
        const radius = 60 + seededRandom() * 120;
        const opacity = 0.08 + seededRandom() * 0.12;
        
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      
      // Reset composite operation for watermark
      ctx.globalCompositeOperation = 'source-over';
      
      // Add watermark
      addWatermark(ctx, canvas.width, canvas.height);
      
      // Convert to base64 - preserve original quality
      const processedImageBase64 = canvas.toDataURL('image/jpeg', 0.95);
      setProcessedImage(processedImageBase64);
    };
  };

  // Helper function to get color RGB values
  const getColorRGB = (color: string) => {
    const colorMap: { [key: string]: string } = {
      'Red': '255, 0, 0',
      'Orange': '255, 165, 0',
      'Yellow': '255, 255, 0',
      'Green': '0, 255, 0',
      'Blue': '0, 0, 255',
      'Violet': '138, 43, 226',
      'Indigo': '75, 0, 130',
      'White': '255, 255, 255',
      'Brown': '165, 42, 42',
      'Gold': '255, 215, 0',
      'Silver': '192, 192, 192',
      'Black': '0, 0, 0',
    };
    return colorMap[color] || '138, 43, 226'; // Default to violet
  };

  const quickVibeMutation = useMutation({
    mutationFn: async (imageFile: File) => {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const response = await fetch('/api/quick-vibe', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to analyze vibe');
      }
      
      return response.json();
    },
    onSuccess: (data: QuickVibeResult) => {
      setVibeResult(data);
      // Process image with aura visualization and watermark
      if (imagePreview) {
        processImageWithVibeAura(imagePreview, data.dominantColor);
      }
      // Invalidate credits cache to update the display
      queryClient.invalidateQueries({ queryKey: ['/api/credits'] });
      toast({
        title: "Vibe Analysis Complete!",
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const processImageFile = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file (JPG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    setVibeResult(null); // Clear previous results
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      processImageFile(file);
    }
  };

  const analyzeVibe = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to analyze your vibe.",
        variant: "destructive",
      });
      return;
    }
    
    if (credits < 1) {
      toast({
        title: "Insufficient Credits",
        description: "You need at least 1 credit to analyze your vibe. Please purchase credits to continue.",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedImage) {
      quickVibeMutation.mutate(selectedImage);
    }
  };

  const resetVibeCheck = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setProcessedImage(null);
    setVibeResult(null);
    setFeedbackSubmitted(false);
    setSelectedFeedback(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Feedback submission mutation
  const feedbackMutation = useMutation({
    mutationFn: async (feedbackData: { personalityColor: string; colorMeaning: string; feedback: string; sessionId?: string }) => {
      const response = await fetch('/api/vibe-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }
      
      return response.json();
    },
    onSuccess: () => {
      setFeedbackSubmitted(true);
      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback! It helps us improve our accuracy.",
      });
    },
    onError: (error) => {
      console.error('Feedback submission error:', error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFeedbackSubmit = (feedback: string) => {
    if (!vibeResult) return;
    
    setSelectedFeedback(feedback);
    
    const feedbackData = {
      personalityColor: vibeResult.dominantColor,
      colorMeaning: `${vibeResult.colorMeaning.positive} / ${vibeResult.colorMeaning.negative}`,
      feedback,
      sessionId: Date.now().toString(),
    };
    
    feedbackMutation.mutate(feedbackData);
  };

  // Color gradients for aura display - only 12 approved colors
  const getColorGradient = (color: string) => {
    const gradients = {
      'Red': 'from-red-800/30 to-red-800/80',
      'Orange': 'from-orange-800 to-orange-100',
      'Yellow': 'from-yellow-500/30 to-yellow-500/70',
      'Green': 'from-green-800/30 to-green-900/80',
      'Blue': 'from-blue-800/30 to-blue-900/80',
      'Violet': 'from-violet-900/100 to-violet-900/10',
      'Indigo': 'from-indigo-800 to-indigo-70',
      'White': 'from-white to-gray-300/10',
      'Brown': 'from-amber-800/30 to-amber-900/80',
      'Gold': 'from-yellow-800/30 to-yellow-900/80',
      'Silver': 'from-gray-400/30 to-gray-900/80',
      'Black': 'from-gray-800/30 to-gray-900/80',
    };
    return gradients[color as keyof typeof gradients] || 'getColorGradient';
  };

  // Color borders for result display
  function getColorBorder ({ color }: { color: string; }): string {
        const borders = {
            'Red': 'bg-red-500',
            'Orange': 'bg-orange-500',
            'Yellow': 'bg-yellow-500',
            'Green': 'bg-green-500',
            'Blue': 'bg-blue-500',
            'Violet': 'bg-violet-500',
            'Indigo': 'bg-indigo-500',
            'White': 'bg-white border-2 border-gray-300',
            'Brown': 'bg-amber-800',
            'Gold': 'bg-yellow-400',
            'Silver': 'bg-gray-400',
            'Black': 'bg-gray-800',
        };
        return borders[color as keyof typeof borders] || 'color';
    }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section id="home" className="relative overflow-hidden min-h-[90vh] flex items-center bg-gradient-to-br from-indigo-900 via-purple-800 to-violet-900 text-white">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSgzMCkiPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjEiIGZpbGw9IiNmZmZmZmYyMCIgLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjcGF0dGVybikiIC8+PC9zdmc+')]"></div>
        
        <AuraGlow 
          colors={[
            { color: "bg-pink-500/30", top: "top-1/4", left: "-left-20", size: "w-96 h-96", delay: "0s" },
            { color: "bg-cyan-500/30", bottom: "bottom-1/3", right: "right-10", size: "w-80 h-80", delay: "1.5s" },
            { color: "bg-amber-400/30", bottom: "bottom-10", left: "left-1/4", size: "w-72 h-72", delay: "3s" },
            { color: "bg-emerald-400/20", top: "top-10", right: "right-1/4", size: "w-64 h-64", delay: "4.5s" }
          ]} 
        />
        
        {/* Floating elements with animation */}
        <div className="absolute top-1/3 right-10 w-12 h-12 rounded-full bg-gradient-to-r from-amber-300 to-amber-500 opacity-60 animate-pulse"></div>
        <div className="absolute bottom-1/4 left-16 w-8 h-8 rounded-full bg-gradient-to-r from-emerald-300 to-emerald-500 opacity-40 animate-pulse animation-delay-1000"></div>
        <div className="absolute top-1/4 left-1/3 w-6 h-6 rounded-full bg-gradient-to-r from-cyan-300 to-cyan-500 opacity-50 animate-pulse animation-delay-2000"></div>
        
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="flex flex-col items-center text-center">
            <div className="mb-8 animate-fade-in-down">
              <h1 className="font-heading font-bold text-5xl md:text-6xl lg:text-7xl mb-6 leading-tight text-white bg-clip-text bg-gradient-to-r from-white to-violet-200">
                Your Energy made <span className="text-secondary to primary">Visible</span> <br />
                Embrace Your <span className="text-emerald-300">Energy</span>
              </h1>
            </div>
            
            <div className="max-w-2xl mx-auto mb-10 animate-fade-in">
              <p className="text-white/90 text-xl md:text-2xl">
                Unlock the power of your personal energy field with aura readings, personalized spiritual guidance, and healing practices.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center animate-fade-in">
              <Button asChild size="lg" className="bg-blue-600 hover:pink border-0 text-white px-8 py-6 rounded-full">
                <Link href="/aura-analysis">
                  <Camera className="mr-2 h-5 w-5" /> Human Aura & Chakra Analysis
                </Link>
              </Button>
              <Button asChild size="lg" className="bg-pink-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 border-0 text-white px-8 py-6 rounded-full">
                <Link href="/object-analysis">
                  <Box className="mr-2 h-5 w-5" /> Object & Space Aura Analysis
                </Link>
              </Button>
              <Button 
                onClick={() => document.getElementById('vibe-check-section')?.scrollIntoView({ behavior: 'smooth' })}
                size="lg" 
                className="bg-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 border-0 text-white px-8 py-6 rounded-full"
              >
                <Sparkles className="mr-2 h-5 w-5" /> What's My Vibe?
              </Button>
            </div>
            
            {/* Visual element replacing the image */}
            <div className="mt-16 flex justify-center animate-fade-in">
              <div className="relative w-72 h-72 md:w-80 md:h-80">
                <div className="absolute inset-0 rounded-full bg--pink-500/60 to-violet-500/60 blur-lg animate-pulse"></div>
                <div className="absolute inset-4 rounded-full bg-gradient-to-bl from-cyan-500/60 to-blue-500/60 blur-md animate-pulse animation-delay-1000"></div>
                <div className="absolute rounded-full bg-gradient-to-r from-amber-400/60 to-orange-500/60 blur-sm animate-pulse animation-delay-2000"></div>
                <div className="absolute inset-20 rounded-full bg-purple-600 opacity-60 backdrop-blur-sm"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Wave divider - updated with new color */}
        <div className="absolute bottom-0 left-0 w-0 overflow-hidden leading-none">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-16" fill="#F7FAFC">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"></path>
          </svg>
        </div>
      </section>
      
      {/* What's My Vibe? Section */}
      <section id="vibe-check-section" className="py-20 bg-gradient-to-br from-violet-50 to-indigo-50">
        <div className="container mx-auto px-7">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-violet-500 mr-3" />
              <h2 className="font-heading font-bold text-4xl md:text-5xl text-gray-900">
                What's My Vibe?
              </h2>
              <Sparkles className="h-8 w-8 text-violet-500 ml-3" />
            </div>
            <p className="text-gray-600 text-xl max-w-3xl mx-auto">
              Get an instant glimpse into your spiritual energy! Upload your photo for a quick aura color reading.
            </p>
          </div>

          <div className="max-w-8xl border-white p-19 mx-auto">
            <Card className="bg-white backdrop-blur-sm">
              <CardContent className="p-1">
                {!imagePreview ? (
                  /* Upload Section with Drag & Drop */
                  <div className="text-center">
                    <div 
                      className={`border-2 border-dashed rounded-xl p-12 transition-all cursor-pointer ${
                        isDragging 
                          ? 'border-violet-500 bg-violet-100/80 scale-105' 
                          : 'border-violet-300 bg-violet-50/50 hover:bg-violet-50'
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="flex flex-col items-center">
                        <div className={`w-20 h-20 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-full flex items-center justify-center mb-4 transition-transform ${
                          isDragging ? 'scale-110' : ''
                        }`}>
                          <Camera className="h-10 w-10 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {isDragging ? 'Drop Your Photo Here' : 'Upload Your Photo'}
                        </h3>
                        <p className="text-gray-600 mb-6 max-w-md">
                          {isDragging 
                            ? 'Release to upload your photo for aura analysis'
                            : 'Drag & drop your photo here, or click to browse. Choose a clear photo of yourself to discover your dominant aura color and energy signature.'
                          }
                        </p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
                          className="hidden"
                        />
                        {!isDragging && (
                          <Button
                            size="lg"
                            className="bg-secondary hover:from-violet-600 hover:to-indigo-700"
                          >
                            <Upload className="mr-2 h-5 w-5" />
                            Choose Photo
                          </Button>
                        )}
                        <div className="mt-4 text-sm text-gray-500">
                          Supports JPG, PNG • Max 10MB
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Analysis Section */
                  <div className="space-y-8">
                    <div className="flex flex-col lg:flex-row gap-8 justify-center">
                      {/* Image Preview */}
                      <div className="flex-1 flex justify-center">
                        <div className="relative max-w-md w-full">
                          <img
                            src={processedImage || imagePreview}
                            alt="Your photo"
                            className="w-full rounded-lg shadow-lg justify-center"
                          />
                          {vibeResult && !processedImage && (
                            <div className={`absolute inset-0 rounded-lg bg-gradient-radial ${getColorGradient(vibeResult.dominantColor)} pointer-events-none`}></div>
                          )}
                        </div>
                      </div>

                      {/* Results or Analysis Button */}
                      <div className="flex-1 space-y-6">
                        {!vibeResult ? (
                          <div className="text-center">
                            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                              Ready to discover your vibe?
                            </h3>
                            <p className="text-gray-600 mb-2">
                              Click analyze to reveal your dominant aura color and its spiritual meaning.
                            </p>
                            {user && (
                              <div className="flex items-center justify-center text-sm text-gray-600 mb-4">
                                <CreditCard className="h-4 w-4 mr-1" />
                                <span>Cost: 1 credit | Your balance: {credits} credits</span>
                              </div>
                            )}
                            {!user && (
                              <p className="text-sm text-gray-600 mb-4">
                                Login required to analyze your vibe (1 credit)
                              </p>
                            )}
                            <div className="space-y-3">
                              <Button
                                onClick={analyzeVibe}
                                disabled={quickVibeMutation.isPending}
                                size="lg"
                                className="w-full bg-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700"
                              >
                                {quickVibeMutation.isPending ? (
                                  <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Analyzing Your Vibe...
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="mr-2 h-5 w-5" />
                                    Analyze My Vibe
                                  </>
                                )}
                              </Button>
                              <Button
                                onClick={resetVibeCheck}
                                variant="outline"
                                className="w-full"
                              >
                                Choose Different Photo
                              </Button>
                            </div>
                          </div>
                        ) : (
                          /* Results Display - New Layout matching screenshot */
                          <div className="w-full">
                            {/* Header with scan count and upgrade info */}
                            <div className="flex justify-between items-center mb-6">
                              <h3 className="text-2xl font-bold text-gray-900">
                                Your Vibe: <span className="text-violet-600">{vibeResult.dominantColor}</span>
                              </h3>
                              <div className="text-right">
                                <div className="text-sm text-gray-600">Today's Scan: 1/1</div>
                                <div className="text-xs text-gray-500">Next free scan in 30 days - Upgrade for daily scans</div>
                              </div>
                            </div>

                            <div className="text-center mb-4">
                              <p className="text-lg text-violet-600 font-medium">
                                {vibeResult.message}
                              </p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                              {/* Left Column - Aura Visualization (keeping existing) */}
                              <div className="flex justify-center">
                                <div className="relative max-w-sm w-full">
                                 
                                  {vibeResult && !processedImage && (
                                    <div className={`absolute inset-0 rounded-lg bg-gradient-radial ${getColorGradient(vibeResult.dominantColor)} pointer-events-none`}></div>
                                  )}
                                 
                                </div>
                              </div>

                              {/* Right Column - Information Cards */}
                              <div className="space-y-4">
                                {/* Positive Section */}
                                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                  <div className="flex items-center mb-2">
                                    <Heart className="h-5 w-5 text-green-600 mr-2" />
                                    <span className="text-sm font-semibold text-green-800">Positive</span>
                                  </div>
                                  <h4 className="font-semibold text-gray-900 mb-2">What's bright right now</h4>
                                  <ul className="text-sm text-gray-700 space-y-1">
                                    {vibeResult.colorMeaning.positive.split('.').slice(0, 2).map((item, index) => (
                                      item.trim() && <li key={index} className="flex items-start"><span className="text-green-500 mr-1">•</span>{item.trim()}</li>
                                    ))}
                                  </ul>
                                </div>

                                {/* Areas to Balance Section */}
                                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                                  <div className="flex items-center mb-2">
                                    <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
                                    <span className="text-sm font-semibold text-orange-800">Area to Balance</span>
                                  </div>
                                  <h4 className="font-semibold text-gray-900 mb-2">What needs grounding</h4>
                                  <ul className="text-sm text-gray-700 space-y-1">
                                    {vibeResult.colorMeaning.negative.split('.').slice(0, 2).map((item, index) => (
                                      item.trim() && <li key={index} className="flex items-start"><span className="text-orange-500 mr-1">•</span>{item.trim()}</li>
                                    ))}
                                  </ul>
                                </div>

                                {/* Blurred Premium Content Preview */}
                                <div className="space-y-3">
                                  {/* Main Blurred Section */}
                                  <div className="relative bg-gray-100 rounded-lg p-4 overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-gray-400/80 to-gray-500/80 backdrop-blur-sm z-10 flex items-center justify-center">
                                      <div className="text-center">
                                        <div className="text-sm font-semibold text-white mb-1">🔒 Premium Content</div>
                                        <div className="text-xs text-white/90">Upgrade to unlock detailed insights</div>
                                      </div>
                                    </div>
                                    <div className="text-sm font-medium text-gray-700 mb-2">Chakra & Aura Analysis</div>
                                    <div className="text-xs text-gray-600 mb-2">📍 Premium - Pay by Session</div>
                                    <div className="text-xs text-gray-500">
                                      Your {vibeResult.dominantColor.toLowerCase()} aura indicates specific chakra imbalances that require attention. 
                                      The crown chakra shows elevated activity while your root chakra may need grounding. 
                                      Detailed energy mapping reveals 3 primary areas for spiritual development...
                                    </div>
                                  </div>

                                  {/* 2x2 Grid of Blurred Services */}
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="relative bg-gray-100 rounded-lg p-3 text-center overflow-hidden">
                                      <div className="absolute inset-0 bg-gradient-to-br from-gray-400/70 to-gray-500/70 backdrop-blur-sm z-10"></div>
                                      <div className="text-sm font-medium text-gray-600 mb-1">5th Aura Service</div>
                                      <div className="text-xs text-gray-500 mb-2">📍 Premium - Pay by Session</div>
                                      <div className="text-xs text-gray-500">Deep energy field analysis beyond basic aura reading...</div>
                                    </div>
                                    <div className="relative bg-gray-100 rounded-lg p-3 text-center overflow-hidden">
                                      <div className="absolute inset-0 bg-gradient-to-br from-gray-400/70 to-gray-500/70 backdrop-blur-sm z-10"></div>
                                      <div className="text-sm font-medium text-gray-600 mb-1">Mindmapping Service</div>
                                      <div className="text-xs text-gray-500 mb-2">📍 Premium - Pay by Session</div>
                                      <div className="text-xs text-gray-500">Spiritual journey mapping and energy pathway visualization...</div>
                                    </div>
                                    <div className="relative bg-gray-100 rounded-lg p-3 text-center overflow-hidden">
                                      <div className="absolute inset-0 bg-gradient-to-br from-gray-400/70 to-gray-500/70 backdrop-blur-sm z-10"></div>
                                      <div className="text-sm font-medium text-gray-600 mb-1">Reading</div>
                                      <div className="text-xs text-gray-500 mb-2">📍 Premium - Pay by Session</div>
                                      <div className="text-xs text-gray-500">Comprehensive spiritual reading with karmic patterns...</div>
                                    </div>
                                    <div className="relative bg-gray-100 rounded-lg p-3 text-center overflow-hidden">
                                      <div className="absolute inset-0 bg-gradient-to-br from-gray-400/70 to-gray-500/70 backdrop-blur-sm z-10"></div>
                                      <div className="text-sm font-medium text-gray-600 mb-1">1 Day Energy Trend</div>
                                      <div className="text-xs text-gray-500 mb-2">📍 Premium - Pay by Session</div>
                                      <div className="text-xs text-gray-500">Daily energy fluctuation tracking and prediction...</div>
                                    </div>
                                  </div>
                                </div>
                               
                              </div>
                            </div>

                            {/* Feedback Section */}
                            {!feedbackSubmitted && (
                              <Card className="bg-blue-50 border-blue-200 mt-4">
                                <CardContent className="p-4">
                                  <div className="text-center">
                                    <h4 className="font-semibold text-blue-800 mb-3">Which do you relate to more?</h4>
                                    <p className="text-sm text-blue-700 mb-4">Your feedback helps us improve our spiritual analysis accuracy.</p>
                                    <div className="flex justify-center space-x-4">
                                      <Button
                                        onClick={() => handleFeedbackSubmit('yes')}
                                        disabled={feedbackMutation.isPending}
                                        size="sm"
                                        className="bg-green-500 hover:bg-green-600 text-white"
                                      >
                                        {feedbackMutation.isPending && selectedFeedback === 'yes' ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          'Positive'
                                        )}
                                      </Button>
                                      <Button
                                        onClick={() => handleFeedbackSubmit('no')}
                                        disabled={feedbackMutation.isPending}
                                        size="sm"
                                        variant="outline"
                                        className="border-red-300 text-red-700 hover:bg-red-50"
                                      >
                                        {feedbackMutation.isPending && selectedFeedback === 'no' ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          'Negative'
                                        )}
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )}

                            {/* Feedback Success Message */}
                            {feedbackSubmitted && (
                              <Card className="bg-green-50 border-green-200 mt-4">
                                <CardContent className="p-4">
                                  <div className="text-center">
                                    <h4 className="font-semibold text-green-800 mb-2">Thank you for your feedback!</h4>
                                    <p className="text-sm text-green-700">Your input helps us improve our spiritual analysis accuracy.</p>
                                  </div>
                                </CardContent>
                              </Card>
                            )}

                            {/* Premium Action Buttons - 3 columns as per screenshot */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                              <Card className="bg-gradient-to-br from-teal-400 to-cyan-500 text-white">
                                <CardContent className="p-4 text-center">
                                  <h4 className="font-semibold mb-2">Connect to a Healer</h4>
                                  <p className="text-xs mb-3 text-teal-50">
                                    Unlock live full report via a certified healer + Costs 1 credit
                                  </p>
                                  <Link to="/healers">
                                    <Button size="sm" variant="secondary" className="w-full bg-white text-teal-600 hover:bg-gray-100">
                                      Book Now
                                    </Button>
                                  </Link>
                                  <div className="flex items-center justify-center mt-2 text-xs text-teal-100">
                                    <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full">⚠️ Watermark on all reports (anti-abuse)</span>
                                  </div>
                                </CardContent>
                              </Card>

                              <Card className="bg-gradient-to-br from-purple-500 to-blue-600 text-white">
                                <CardContent className="p-4 text-center">
                                  <h4 className="font-semibold mb-2">Upgrade to Professional Healer Dashboard</h4>
                                  <p className="text-xs mb-3 text-purple-100">
                                    Full Aura + Chakra + Numerology + Weekly Plan + Daily Scans + Client management
                                  </p>
                                  <Link to="/healer-dashboard">
                                    <Button size="sm" variant="secondary" className="w-full bg-white text-purple-600 hover:bg-gray-100">
                                      Upgrade Now
                                    </Button>
                                  </Link>
                                  <div className="flex items-center justify-center mt-2 text-xs text-purple-100">
                                    <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full">⚡ One-tap connection or upgrade</span>
                                  </div>
                                </CardContent>
                              </Card>

                              <Card className="bg-gradient-to-br from-red-500 to-pink-500 text-white">
                                <CardContent className="p-4 text-center">
                                  <h4 className="font-semibold mb-2">Upgrade to Elite Healer Dashboard</h4>
                                  <p className="text-xs mb-3 text-red-100">
                                    Everything in Pro + Object 1st Scans + Professional listing + Recommended against in our list of healers
                                  </p>
                                  <Button size="sm" variant="secondary" className="w-full bg-white text-red-600 hover:bg-gray-100">
                                    Upgrade Elite
                                  </Button>
                                  <div className="flex items-center justify-center mt-2 text-xs text-red-100">
                                    <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full">🎁 Bonus: 3 object scans on first upgrade</span>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>

                            {/* Bottom features row */}
                            <div className="grid grid-cols-4 gap-4 mt-4 text-center">
                              <div className="text-xs text-gray-600">
                                <span className="block text-orange-500">⚠️</span>
                                <span>Watermark on all reports</span>
                              </div>
                              <div className="text-xs text-gray-600">
                                <span className="block text-green-500">⚡</span>
                                <span>One-tap connection or upgrade</span>
                              </div>
                              <div className="text-xs text-gray-600">
                                <span className="block text-blue-500">🎁</span>
                                <span>Bonus: 3 object scans on first upgrade</span>
                              </div>
                              <div className="text-xs text-gray-600">
                                <span className="block text-purple-500">📱</span>
                                <span>Priority support for paid plans</span>
                              </div>
                            </div>

                            {/* Action Buttons Row */}
                            <div className="flex gap-3 mt-6">
                              <Link to="/aura-analysis" className="flex-1">
                                <Button className="w-full bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700">
                                  Get Full Analysis
                                </Button>
                              </Link>
                              
                              <Link to="/journal" className="flex-1">
                                <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                                  Journal with us
                                </Button>
                              </Link>
                              
                              <Button
                                onClick={resetVibeCheck}
                                variant="outline"
                                className="flex-1"
                              >
                                Try Another Photo
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Aura Upload Preview */}
      <section id="upload-preview" className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-dark mb-4">Scan Your Aura</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Upload your photo and our analyzer will analyze your energy field, revealing your aura colors and providing personalized insights.</p>
          </div>

          <div className="max-w-4xl mx-auto flex justify-center">
            <Button asChild size="lg" className="bg-primary hover:bg-primary-dark">
              <Link href="/aura-analysis" className="flex items-center">
                <Camera className="mr-3 h-5 w-5" /> Try Aura Analysis
              </Link>
            </Button>
          </div>

          {/* Sample readings */}
          <div className="mt-16">
            <h3 className="font-heading font-semibold text-2xl text-center mb-8">Sample Aura Readings</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Sample 1 */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="relative">
                  <img src="https://images.pexels.com/photos/3812944/pexels-photo-3812944.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Woman with purple aura" className="w-full h-56 object-cover" />
                  <div className="absolute inset-0 bg-gradient-radial from-purple-500/30 to-transparent"></div>
                </div>
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <span className="inline-block w-4 h-4 rounded-full bg-purple-500 mr-2"></span>
                    <h4 className="font-heading font-semibold">Purple Dominant</h4>
                  </div>
                  <p className="text-gray-600 text-sm">A spiritual individual with strong intuition. Your crown chakra shows high activity, indicating a deep connection to higher consciousness.</p>
                </div>
              </div>
              
              {/* Sample 2 */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="relative">
                  <img src="https://images.pexels.com/photos/428364/pexels-photo-428364.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Man with green-gold aura" className="w-full h-56 object-cover" />
                  <div className="absolute inset-0 bg-gradient-radial from-green-500/30 to-transparent"></div>
                </div>
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <span className="inline-block w-4 h-4 rounded-full bg-green-500 mr-2"></span>
                    <h4 className="font-heading font-semibold">Green Dominant</h4>
                  </div>
                  <p className="text-gray-600 text-sm">A natural healer with a compassionate heart. Your heart chakra radiates strongly, showing your capacity for unconditional love and healing others.</p>
                </div>
              </div>
              
              {/* Sample 3 */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="relative">
                  <img src="https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Person with blue aura" className="w-full h-56 object-cover" />
                  <div className="absolute inset-0 bg-gradient-radial from-blue-500/30 to-transparent"></div>
                </div>
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <span className="inline-block w-4 h-4 rounded-full bg-blue-500 mr-2"></span>
                    <h4 className="font-heading font-semibold">Blue Dominant</h4>
                  </div>
                  <p className="text-gray-600 text-sm">A clear communicator with strong self-expression. Your throat chakra shows vibrant energy, indicating authentic expression and creative abilities.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 bg-dark text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4">What Our Community Says</h2>
            <p className="text-black/80 max-w-5xl mx-auto">Hear from members who have experienced transformation through our spiritual services.</p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <TestimonialCard 
                rating={5}
                testimonial="The aura reading was incredibly accurate! It revealed colors I've always been drawn to and explained energy patterns that made so much sense. The guidance provided helped me focus on areas where my energy was blocked."
                name="Sarah M."
                title="Yoga Instructor"
                initials="SM"
                bgColor="primary"
              />
              
              <TestimonialCard 
                rating={5}
                testimonial="I was skeptical at first, but the numerology reading was eye-opening. The insights about my life path number explained challenges I've faced and provided clarity about my purpose. I've recommended AuraEye to all my friends."
                name="James T."
                title="Business Consultant"
                initials="JT"
                bgColor="secondary"
              />
              
              <TestimonialCard 
                rating={4.5}
                testimonial="The guided meditations have been transformative for my spiritual practice. I feel more connected to my inner self and have noticed a significant improvement in my energy levels. The journal feature helps me track my progress."
                name="Elena P."
                title="Art Therapist"
                initials="EP"
                bgColor="accent"
              />
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
