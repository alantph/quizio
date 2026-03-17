import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AnswerInputProps {
  answers: string[];
  solution: number;
  onChange: (answers: string[], solution: number) => void;
}

const COLORS = ["bg-red-500", "bg-blue-500", "bg-yellow-500", "bg-green-500"];

const AnswerInput = ({ answers, solution, onChange }: AnswerInputProps) => {
  const updateAnswer = (index: number, value: string) => {
    const next = [...answers];
    next[index] = value;
    onChange(next, solution);
  };

  const addAnswer = () => {
    if (answers.length < 4) onChange([...answers, ""], solution);
  };

  const removeAnswer = (index: number) => {
    if (answers.length <= 2) return;
    const next = answers.filter((_, i) => i !== index);
    onChange(next, solution >= next.length ? 0 : solution);
  };

  return (
    <div className="space-y-2">
      {answers.map((answer, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`h-4 w-4 rounded-sm ${COLORS[i]}`} />
          <Input
            value={answer}
            onChange={(e) => updateAnswer(i, e.target.value)}
            placeholder={`Đáp án ${i + 1}`}
            className="flex-1"
          />
          <input
            type="radio"
            checked={solution === i}
            onChange={() => onChange(answers, i)}
            title="Đáp án đúng"
          />
          {answers.length > 2 && (
            <Button size="sm" variant="ghost" onClick={() => removeAnswer(i)}>
              ✕
            </Button>
          )}
        </div>
      ))}
      {answers.length < 4 && (
        <Button size="sm" variant="outline" onClick={addAnswer}>
          + Thêm đáp án
        </Button>
      )}
    </div>
  );
};

export default AnswerInput;
