import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Question {
  id: string;
  category_id: string;
  category_title: string;
  category_description: string;
  category_icon: string;
  question_text: string;
  created_at: string;
}

interface QuestionForm {
  category_id: string;
  category_title: string;
  category_description: string;
  category_icon: string;
  question_text: string;
}

const iconOptions = [
  { value: "Wrench", label: "Wrench" },
  { value: "Settings", label: "Settings" },
  { value: "Shield", label: "Shield" },
  { value: "Package", label: "Package" },
  { value: "HelpCircle", label: "Help Circle" },
  { value: "Phone", label: "Phone" },
  { value: "Mail", label: "Mail" },
  { value: "MessageSquare", label: "Message Square" }
];

export default function AdminQuestions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<QuestionForm>({
    category_id: "",
    category_title: "",
    category_description: "",
    category_icon: "HelpCircle",
    question_text: ""
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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
      toast({
        title: "Error",
        description: "Failed to load questions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      if (!formData.category_id || !formData.category_title || !formData.question_text) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from("questions")
        .insert([formData]);

      if (error) throw error;

      await fetchQuestions();
      setShowAddForm(false);
      setFormData({
        category_id: "",
        category_title: "",
        category_description: "",
        category_icon: "HelpCircle",
        question_text: ""
      });
      
      toast({
        title: "Success",
        description: "Question added successfully",
      });
    } catch (error) {
      console.error("Error adding question:", error);
      toast({
        title: "Error",
        description: "Failed to add question",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async (id: string) => {
    try {
      const { error } = await supabase
        .from("questions")
        .update(formData)
        .eq("id", id);

      if (error) throw error;

      await fetchQuestions();
      setEditingId(null);
      
      toast({
        title: "Success",
        description: "Question updated successfully",
      });
    } catch (error) {
      console.error("Error updating question:", error);
      toast({
        title: "Error",
        description: "Failed to update question",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("questions")
        .delete()
        .eq("id", id);

      if (error) throw error;

      await fetchQuestions();
      
      toast({
        title: "Success",
        description: "Question deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting question:", error);
      toast({
        title: "Error",
        description: "Failed to delete question",
        variant: "destructive",
      });
    }
  };

  const startEdit = (question: Question) => {
    setEditingId(question.id);
    setFormData({
      category_id: question.category_id,
      category_title: question.category_title,
      category_description: question.category_description,
      category_icon: question.category_icon,
      question_text: question.question_text
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({
      category_id: "",
      category_title: "",
      category_description: "",
      category_icon: "HelpCircle",
      question_text: ""
    });
  };

  const groupedQuestions = questions.reduce((acc, question) => {
    if (!acc[question.category_id]) {
      acc[question.category_id] = {
        title: question.category_title,
        description: question.category_description,
        icon: question.category_icon,
        questions: []
      };
    }
    acc[question.category_id].questions.push(question);
    return acc;
  }, {} as Record<string, { title: string; description: string; icon: string; questions: Question[] }>);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Manage Support Questions</h1>
            <p className="text-muted-foreground">Add and manage domain-specific questions for customer support</p>
          </div>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </Button>
        </div>

        {showAddForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Add New Question</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category_id">Category ID</Label>
                  <Input
                    id="category_id"
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    placeholder="e.g., vehicle-issues"
                  />
                </div>
                <div>
                  <Label htmlFor="category_title">Category Title</Label>
                  <Input
                    id="category_title"
                    value={formData.category_title}
                    onChange={(e) => setFormData({ ...formData, category_title: e.target.value })}
                    placeholder="e.g., Vehicle Issues"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="category_description">Category Description</Label>
                <Textarea
                  id="category_description"
                  value={formData.category_description}
                  onChange={(e) => setFormData({ ...formData, category_description: e.target.value })}
                  placeholder="Brief description of this category"
                />
              </div>
              <div>
                <Label htmlFor="category_icon">Category Icon</Label>
                <Select
                  value={formData.category_icon}
                  onValueChange={(value) => setFormData({ ...formData, category_icon: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map((icon) => (
                      <SelectItem key={icon.value} value={icon.value}>
                        {icon.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="question_text">Question Text</Label>
                <Textarea
                  id="question_text"
                  value={formData.question_text}
                  onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                  placeholder="Enter the question text"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAdd}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Question
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          {Object.entries(groupedQuestions).map(([categoryId, category]) => (
            <Card key={categoryId}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {category.title}
                  <span className="text-sm text-muted-foreground">({category.icon})</span>
                </CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {category.questions.map((question) => (
                    <div key={question.id} className="flex items-center justify-between p-3 border rounded-lg">
                      {editingId === question.id ? (
                        <div className="flex-1 space-y-2">
                          <Textarea
                            value={formData.question_text}
                            onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                            className="min-h-[60px]"
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleEdit(question.id)}>
                              <Save className="h-4 w-4 mr-1" />
                              Save
                            </Button>
                            <Button size="sm" variant="outline" onClick={cancelEdit}>
                              <X className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <span className="flex-1">{question.question_text}</span>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => startEdit(question)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(question.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}