import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Zap, Wrench, Shield, HelpCircle } from 'lucide-react';

const predefinedQuestions = [
  {
    id: 'battery',
    icon: Zap,
    title: 'Battery Issues',
    description: 'Battery not charging, low range, or power problems',
    questions: [
      'My scooter battery is not charging',
      'How can I improve my scooter battery life?',
      'Why does my battery drain so quickly?',
      'What is the expected battery range?'
    ]
  },
  {
    id: 'mechanical',
    icon: Wrench,
    title: 'Mechanical Problems',
    description: 'Brakes, wheels, steering, or motor issues',
    questions: [
      'My brakes are making strange noises',
      'The scooter is not accelerating properly',
      'How do I adjust the brake tension?',
      'The wheels are wobbling while riding'
    ]
  },
  {
    id: 'safety',
    icon: Shield,
    title: 'Safety Concerns',
    description: 'Safety features, helmet recommendations, or accident reports',
    questions: [
      'What safety gear do you recommend?',
      'How do I report a safety issue?',
      'My scooter suddenly stopped working while riding',
      'Are there age restrictions for using the scooter?'
    ]
  },
  {
    id: 'general',
    icon: HelpCircle,
    title: 'General Questions',
    description: 'Warranty, maintenance, or usage questions',
    questions: [
      'How do I maintain my electric scooter?',
      'What is covered under warranty?',
      'How often should I service my scooter?',
      'Can I ride in the rain?'
    ]
  }
];

interface QuestionSelectorProps {
  onSelectQuestion: (question: string, category: string) => void;
  onCustomQuestion: () => void;
}

const QuestionSelector = ({ onSelectQuestion, onCustomQuestion }: QuestionSelectorProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">How can we help you today?</h2>
        <p className="text-muted-foreground">Choose from common questions or ask your own</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {predefinedQuestions.map((category) => {
          const IconComponent = category.icon;
          return (
            <Card key={category.id} className="shadow-soft border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconComponent className="w-5 h-5 text-primary" />
                  {category.title}
                </CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {category.questions.map((question, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start text-left h-auto whitespace-normal p-3"
                    onClick={() => onSelectQuestion(question, category.id)}
                  >
                    <MessageSquare className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="text-sm">{question}</span>
                  </Button>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center">
        <Card className="shadow-soft border-0 bg-muted/30">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">Have a different question?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Ask us anything about your electric scooter
            </p>
            <Button onClick={onCustomQuestion} variant="electric" className="w-full max-w-xs">
              Ask Custom Question
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuestionSelector;