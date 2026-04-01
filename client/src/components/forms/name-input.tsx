import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";

interface NameInputProps {
  onNameSubmit: (name: string) => void;
  title: string;
  description: string;
  placeholder?: string;
}

export default function NameInput({ 
  onNameSubmit, 
  title, 
  description, 
  placeholder = "Enter your name" 
}: NameInputProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError("Name is required to proceed with analysis");
      return;
    }
    
    if (name.trim().length < 2) {
      setError("Please enter a valid name (at least 2 characters)");
      return;
    }
    
    setError("");
    onNameSubmit(name.trim());
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
          <User className="w-8 h-8 text-medium" />
        </div>
        <CardTitle className="text-xl text-black bg-white">{title}</CardTitle>
        <p className="text-sm text-black">{description}</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
             onChange={(e) => {
                setName(e.target.value);
                if (error) setError("");
              }}
              placeholder={placeholder}
              className={error ? "border-red-500" : ""}
              autoComplete="name"
              maxLength={50}
            />
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
          </div>
          
          <Button type="submit" className="w-full">
            Enter A New Name for Analysis
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}