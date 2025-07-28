import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

interface NameInputProps {
  validNames: string[];
  onNameSubmit: (name: string) => void;
}

export const NameInput = ({ validNames, onNameSubmit }: NameInputProps) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = () => {
    const trimmedName = inputValue.trim();
    
    if (!trimmedName) {
      toast({
        title: "Name Required",
        description: "Please enter your name",
        variant: "destructive"
      });
      return;
    }

    const matchedName = validNames.find(
      name => name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (matchedName) {
      onNameSubmit(matchedName);
      toast({
        title: "Welcome!",
        description: `Welcome ${matchedName}! Let's find you a partner.`,
      });
    } else {
      toast({
        title: "Name Not Found",
        description: "Please enter one of the registered names",
        variant: "destructive"
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md mx-4 shadow-elevated border-border/50">
        <CardHeader className="text-center space-y-4">
          <CardTitle className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Partner Picker
          </CardTitle>
          <p className="text-muted-foreground">
            Enter your name to find your partner for the week
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Input
              placeholder="Enter your name..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              className="text-center text-lg py-6"
            />
            
            <Button 
              onClick={handleSubmit}
              className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300 text-lg py-6"
            >
              Continue
            </Button>
          </div>

          <div className="pt-4 border-t border-border/50">
            <p className="text-sm text-muted-foreground text-center mb-3">
              Valid names:
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {validNames.map((name) => (
                <div 
                  key={name} 
                  className="text-center py-1 px-2 bg-secondary rounded-md text-secondary-foreground"
                >
                  {name}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};