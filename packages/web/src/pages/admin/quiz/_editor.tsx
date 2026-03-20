import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { quizzesApi } from "@quizio/web/features/admin/api/quizzes";
import QuestionEditor from "@quizio/web/features/admin/components/question/QuestionEditor";
import type { QuestionData } from "@quizio/web/features/admin/components/question/QuestionEditor";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

interface Props {
  mode: "new" | "edit";
  id?: string;
}

const defaultQuestion = (): QuestionData => ({
  question: "",
  answers: ["", ""],
  solution: 0,
  cooldown: 5,
  time: 20,
});

const QuizEditorPage = ({ mode, id }: Props) => {
  const navigate = useNavigate();
  const [subject, setSubject] = useState("");
  const [globalBackground, setGlobalBackground] = useState<
    string | undefined
  >(undefined);
  const [questions, setQuestions] = useState<QuestionData[]>([
    defaultQuestion(),
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === "edit" && id) {
      quizzesApi.getById(id).then((quiz) => {
        setSubject(quiz.subject);
        setGlobalBackground(quiz.background);
        setQuestions(quiz.questions as QuestionData[]);
      });
    }
  }, [mode, id]);

  const updateQuestion = (index: number, data: QuestionData) => {
    const next = [...questions];
    next[index] = data;
    setQuestions(next);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const next = [...questions];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    setQuestions(next);
  };

  const moveDown = (index: number) => {
    if (index === questions.length - 1) return;
    const next = [...questions];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    setQuestions(next);
  };

  const deleteQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const addQuestion = () => {
    setQuestions([...questions, defaultQuestion()]);
  };

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    try {
      const data = { subject, background: globalBackground || undefined, questions };
      if (mode === "new") {
        await quizzesApi.create(data);
      } else {
        await quizzesApi.update(id!, data);
      }
      navigate("/admin/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Label>Quiz name</Label>
        <Input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Enter quiz name..."
        />
      </div>

      <div className="space-y-4">
        {questions.map((q, i) => (
          <QuestionEditor
            key={i}
            index={i}
            data={q}
            total={questions.length}
            onChange={(data) => updateQuestion(i, data)}
            onMoveUp={() => moveUp(i)}
            onMoveDown={() => moveDown(i)}
            onDelete={() => deleteQuestion(i)}
            onApplyBackgroundToAll={(url) => {
              setGlobalBackground(url);
              setQuestions((prev) => prev.map((q) => ({ ...q, background: undefined })));
            }}
          />
        ))}
      </div>

      <Button variant="outline" onClick={addQuestion} className="w-full">
        + Add question
      </Button>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => navigate("/admin/dashboard")}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
};

export default QuizEditorPage;
