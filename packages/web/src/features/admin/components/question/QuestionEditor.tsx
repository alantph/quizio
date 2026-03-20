import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import AnswerInput from "./AnswerInput";
import MediaPicker from "./MediaPicker";
import BackgroundPicker from "../quiz/BackgroundPicker";

export interface QuestionData {
  question: string;
  answers: string[];
  solution: number;
  cooldown: number;
  time: number;
  image?: string;
  video?: string;
  audio?: string;
  background?: string;
}

interface QuestionEditorProps {
  index: number;
  data: QuestionData;
  total: number;
  onChange: (data: QuestionData) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  onApplyBackgroundToAll?: (url: string | undefined) => void;
}

const QuestionEditor = ({
  index,
  data,
  total,
  onChange,
  onMoveUp,
  onMoveDown,
  onDelete,
  onApplyBackgroundToAll,
}: QuestionEditorProps) => {
  const update = (patch: Partial<QuestionData>) =>
    onChange({ ...data, ...patch });

  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <span className="font-semibold">Question {index + 1}</span>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={onMoveUp}
            disabled={index === 0}
          >
            ↑
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onMoveDown}
            disabled={index === total - 1}
          >
            ↓
          </Button>
          <Button size="sm" variant="ghost" onClick={onDelete}>
            Delete
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Question</Label>
          <Textarea
            value={data.question}
            onChange={(e) => update({ question: e.target.value })}
            placeholder="Enter question..."
            rows={2}
          />
        </div>

        <MediaPicker
          value={data.image || ""}
          onChange={(url) => update({ image: url || undefined })}
          label="Image"
        />
        <MediaPicker
          value={data.video || ""}
          onChange={(url) => update({ video: url || undefined })}
          label="Video"
        />
        <MediaPicker
          value={data.audio || ""}
          onChange={(url) => update({ audio: url || undefined })}
          label="Audio"
        />

        <div>
          <Label>Background</Label>
          <BackgroundPicker
            value={data.background}
            onChange={(url) => update({ background: url })}
            onApplyToAll={onApplyBackgroundToAll ?? (() => {})}
          />
        </div>

        <div className="flex gap-4">
          <div>
            <Label>Cooldown (seconds)</Label>
            <Input
              type="number"
              min={1}
              max={30}
              value={data.cooldown}
              onChange={(e) =>
                update({ cooldown: parseInt(e.target.value) || 5 })
              }
              className="w-24"
            />
          </div>
          <div>
            <Label>Answer time (seconds)</Label>
            <Input
              type="number"
              min={5}
              max={120}
              value={data.time}
              onChange={(e) => update({ time: parseInt(e.target.value) || 20 })}
              className="w-24"
            />
          </div>
        </div>

        <div>
          <Label>Answers (select the correct answer)</Label>
          <AnswerInput
            answers={data.answers}
            solution={data.solution}
            onChange={(answers, solution) => update({ answers, solution })}
          />
        </div>
      </div>
    </div>
  );
};

export default QuestionEditor;
