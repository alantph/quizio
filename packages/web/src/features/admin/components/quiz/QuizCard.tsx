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
          <Badge variant="secondary">{questionCount} câu</Badge>
          <span className="text-xs text-gray-500">
            {new Date(updatedAt).toLocaleDateString("vi-VN")}
          </span>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button size="sm" onClick={() => navigate(`/admin/quiz/${id}`)}>
          Sửa
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
              Xóa
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xóa quiz?</AlertDialogTitle>
              <AlertDialogDescription>
                Hành động này không thể hoàn tác. Quiz "{subject}" sẽ bị xóa
                vĩnh viễn.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(id)}>
                Xóa
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
};

export default QuizCard;
