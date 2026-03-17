import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "react-router";

interface QuizCardProps {
  id: string;
  subject: string;
  questionCount: number;
  updatedAt: string;
  onDelete: (id: string) => void;
  onExport: (id: string, subject: string) => void;
}

const QuizCard = ({
  id,
  subject,
  questionCount,
  updatedAt,
  onDelete,
  onExport,
}: QuizCardProps) => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{subject}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{questionCount} questions</Badge>
          <span className="text-xs text-gray-500">
            {new Date(updatedAt).toLocaleDateString("en-US")}
          </span>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button size="sm" onClick={() => navigate(`/admin/quiz/${id}`)}>
          Edit
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onExport(id, subject)}
        >
          Export
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="sm" variant="destructive">
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete quiz?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. Quiz "{subject}" will be
                permanently deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(id)}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
};

export default QuizCard;
