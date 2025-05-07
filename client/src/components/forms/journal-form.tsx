import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const journalFormSchema = z.object({
  energyLevel: z.number().min(1).max(5),
  reflections: z.string().min(5, "Please share your reflections"),
  gratitude1: z.string().min(5, "Please enter at least 5 characters"),
  gratitude2: z.string().optional(),
  gratitude3: z.string().optional(),
});

type JournalFormValues = z.infer<typeof journalFormSchema>;

export default function JournalForm() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  const form = useForm<JournalFormValues>({
    resolver: zodResolver(journalFormSchema),
    defaultValues: {
      energyLevel: 3,
      reflections: "",
      gratitude1: "",
      gratitude2: "",
      gratitude3: "",
    },
  });

  const onSubmit = async (data: JournalFormValues) => {
    setIsSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log("Journal entry:", data);
    setIsSaving(false);
    
    toast({
      title: "Journal Entry Saved",
      description: "Your spiritual insights have been recorded.",
    });
    
    form.reset({
      energyLevel: 3,
      reflections: "",
      gratitude1: "",
      gratitude2: "",
      gratitude3: "",
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="energyLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>How is your energy today?</FormLabel>
              <div className="flex justify-between items-center pt-2">
                <span className="text-xs text-gray-500">Low</span>
                <div className="w-full px-2">
                  <FormControl>
                    <Slider
                      min={1}
                      max={5}
                      step={1}
                      value={[field.value]}
                      onValueChange={(value) => field.onChange(value[0])}
                      className="w-full"
                    />
                  </FormControl>
                </div>
                <span className="text-xs text-gray-500">High</span>
              </div>
              <div className="flex justify-center mt-1">
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div 
                      key={level}
                      className={`w-8 h-3 rounded-full ${level <= field.value ? 'bg-primary' : 'bg-gray-200'}`}
                    ></div>
                  ))}
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="reflections"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Today's Reflections</FormLabel>
              <FormControl>
                <Textarea 
                  rows={4} 
                  placeholder="What spiritual insights or experiences did you have today?" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div>
          <FormLabel>Gratitude Practice</FormLabel>
          <div className="space-y-2 mt-1">
            <FormField
              control={form.control}
              name="gratitude1"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center space-x-2">
                    <Star className="text-accent h-4 w-4" />
                    <FormControl>
                      <Input placeholder="I am grateful for..." {...field} />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="gratitude2"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center space-x-2">
                    <Star className="text-accent h-4 w-4" />
                    <FormControl>
                      <Input placeholder="I am grateful for..." {...field} />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="gratitude3"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center space-x-2">
                    <Star className="text-accent h-4 w-4" />
                    <FormControl>
                      <Input placeholder="I am grateful for..." {...field} />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <div className="text-right pt-4">
          <Button 
            type="submit" 
            className="bg-primary hover:bg-primary-dark"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                Saving...
              </>
            ) : "Save Entry"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
