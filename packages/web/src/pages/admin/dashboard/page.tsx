import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { quizzesApi } from "@quizio/web/features/admin/api/quizzes";
import QuizCard from "@quizio/web/features/admin/components/quiz/QuizCard";
import { useQuizzes } from "@quizio/web/features/admin/hooks/useQuizzes";
import { useAdminStore } from "@quizio/web/features/admin/stores/admin";
import { useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router";

const AdminDashboardPage = () => {
  const { token } = useAdminStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("updatedAt");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!token) return <Navigate to="/admin/login" replace />;

  const { quizzes, isLoading, refetch } = useQuizzes({ search, sort });

  const handleDelete = async (id: string) => {
    try {
      await quizzesApi.delete(id);
      refetch();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error");
    }
  };

  const handleExport = (id: string, subject: string) => {
    quizzesApi.exportJson(id, subject);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text) as unknown;
      await quizzesApi.import(data);
      refetch();
    } catch (err: unknown) {
      alert(
        "Import failed: " + (err instanceof Error ? err.message : "Error"),
      );
    }
    e.target.value = "";
  };

  const totalQuestions = quizzes.reduce((sum, q) => sum + q.questionCount, 0);

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <div className="text-2xl font-bold">{quizzes.length}</div>
          <div className="text-sm text-gray-500">Quiz</div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <div className="text-2xl font-bold">{totalQuestions}</div>
          <div className="text-sm text-gray-500">Total Questions</div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search quizzes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updatedAt">Latest</SelectItem>
            <SelectItem value="name">Name A-Z</SelectItem>
          </SelectContent>
        </Select>
        <input
          type="file"
          accept=".json"
          ref={fileInputRef}
          className="hidden"
          onChange={handleImport}
        />
        <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
          Import
        </Button>
        <Button onClick={() => navigate("/admin/quiz/new")}>
          + New Quiz
        </Button>
      </div>

      {isLoading ? (
        <div className="text-gray-500">Loading...</div>
      ) : quizzes.length === 0 ? (
        <div className="text-gray-500">No quizzes yet</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
            <QuizCard
              key={quiz.id}
              id={quiz.id}
              subject={quiz.subject}
              questionCount={quiz.questionCount}
              updatedAt={quiz.updatedAt}
              onDelete={handleDelete}
              onExport={handleExport}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
