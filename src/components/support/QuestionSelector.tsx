import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Zap, Wrench, Shield, HelpCircle, Settings, Package, Circle, Square, Triangle, Star, Hexagon, Phone, Mail } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";

// Icon mapping for dynamic icons
const iconMap: Record<string, any> = {
  Circle,
  Square,
  Triangle,
  Star,
  Hexagon,
  Wrench,
  Settings,
  Shield,
  Package,
  HelpCircle,
  Phone,
  Mail,
  MessageSquare,
  Zap
};

interface Question {
  id: string;
  category_id: string;
  category_title: string;
  category_description: string;
  category_icon: string;
  question_text: string;
}

interface QuestionCategory {
  id: string;
  icon: any;
  title: string;
  description: string;
  questions: string[];
}

interface QuestionSelectorProps {
  onSelectQuestion: (question: string, category: string) => void;
  onCustomQuestion: () => void;
}

const QuestionSelector = ({ onSelectQuestion, onCustomQuestion }: QuestionSelectorProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from("questions")
        .select("*")
        .order("category_id", { ascending: true })
        .order("created_at", { ascending: true });

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  };

  // Group questions by category
  const groupedQuestions = questions.reduce((acc, question) => {
    if (!acc[question.category_id]) {
      acc[question.category_id] = {
        id: question.category_id,
        icon: iconMap[question.category_icon] || HelpCircle,
        title: question.category_title,
        description: question.category_description,
        questions: []
      };
    }
    acc[question.category_id].questions.push(question.question_text);
    return acc;
  }, {} as Record<string, QuestionCategory>);

  const predefinedQuestions = Object.values(groupedQuestions);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">How can we help you today?</h2>
          <p className="text-muted-foreground">Loading questions...</p>
        </div>
      </div>
    );
  }

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