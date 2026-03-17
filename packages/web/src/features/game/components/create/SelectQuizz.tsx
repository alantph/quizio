import type { QuizzWithId } from "@quizio/common/types/game";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import clsx from "clsx";
import { useState } from "react";
import toast from "react-hot-toast";

type Props = {
  quizzList: QuizzWithId[];
  onSelect: (_id: string) => void;
};

const SelectQuizz = ({ quizzList, onSelect }: Props) => {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (id: string) => () => {
    setSelected(selected === id ? null : id);
  };

  const handleSubmit = () => {
    if (!selected) {
      toast.error("Please select a quiz");
      return;
    }
    onSelect(selected);
  };

  return (
    <Card className="z-10 w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-xl">Select a Quiz</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          <div className="flex flex-col gap-2 pr-3">
            {quizzList.map((quizz) => (
              <button
                key={quizz.id}
                className={clsx(
                  "flex w-full items-center justify-between rounded-md border px-4 py-3 text-left transition-colors",
                  selected === quizz.id
                    ? "border-primary bg-primary/10"
                    : "border-gray-200 hover:bg-gray-50",
                )}
                onClick={handleSelect(quizz.id)}
              >
                <span className="font-medium">{quizz.subject}</span>
                <Badge variant="secondary">{quizz.questions.length} questions</Badge>
              </button>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full bg-primary hover:bg-primary/90 text-white"
          onClick={handleSubmit}
          disabled={!selected}
        >
          Start Game
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SelectQuizz;
