import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import QuestionSelector from '@/components/support/QuestionSelector';
import SupportForm from '@/components/support/SupportForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type SupportState = 'questions' | 'form' | 'success';

const Support = () => {
  const [currentState, setCurrentState] = useState<SupportState>('questions');
  const [selectedQuestion, setSelectedQuestion] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const handleSelectQuestion = (question: string, category: string) => {
    setSelectedQuestion(question);
    setSelectedCategory(category);
    setCurrentState('form');
  };

  const handleCustomQuestion = () => {
    setSelectedQuestion('');
    setSelectedCategory('');
    setCurrentState('form');
  };

  const handleBack = () => {
    setCurrentState('questions');
  };

  const handleSuccess = () => {
    setCurrentState('success');
  };

  const handleBackToQuestions = () => {
    setSelectedQuestion('');
    setSelectedCategory('');
    setCurrentState('questions');
  };

  return (
    <div className="min-h-screen bg-gradient-subtle p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-electric bg-clip-text text-transparent">
              MS-Scooter Support
            </h1>
            <p className="text-muted-foreground">Get help with your electric scooter</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/dashboard'}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </div>

        {/* Content */}
        {currentState === 'questions' && (
          <QuestionSelector 
            onSelectQuestion={handleSelectQuestion}
            onCustomQuestion={handleCustomQuestion}
          />
        )}

        {currentState === 'form' && (
          <SupportForm
            initialQuestion={selectedQuestion}
            initialCategory={selectedCategory}
            onBack={handleBack}
            onSuccess={handleSuccess}
          />
        )}

        {currentState === 'success' && (
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-soft border-0 text-center">
              <CardContent className="pt-8">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                <CardTitle className="mb-2">Request Submitted Successfully!</CardTitle>
                <CardDescription className="mb-6">
                  Your support ticket has been created. Our team will review your request and get back to you within 24 hours.
                </CardDescription>
                <div className="space-y-3">
                  <Button onClick={handleBackToQuestions} variant="electric" className="w-full max-w-xs">
                    Submit Another Request
                  </Button>
                  <br />
                  <Button 
                    onClick={() => window.location.href = '/dashboard'} 
                    variant="outline" 
                    className="w-full max-w-xs"
                  >
                    Back to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Support;