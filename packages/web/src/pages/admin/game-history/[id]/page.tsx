import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  gameResultsApi,
  type GameResultDetail,
} from "@quizio/web/features/admin/api/gameResults";
import { useAdminStore } from "@quizio/web/features/admin/stores/admin";
import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router";

const ANSWER_COLORS = [
  "text-red-500",
  "text-blue-500",
  "text-yellow-500",
  "text-green-500",
];

const GameDetailPage = () => {
  const { token } = useAdminStore();
  if (!token) return <Navigate to="/admin/login" replace />;

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<GameResultDetail | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState("0");

  useEffect(() => {
    if (id) {
      gameResultsApi.getById(id).then(setResult);
    }
  }, [id]);

  if (!result) return <p className="text-gray-500">Loading...</p>;

  const currentQ = result.questions[parseInt(selectedQuestion)];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold">{result.quizzSubject}</h1>
          <p className="text-sm text-gray-500">
            {new Date(result.playedAt).toLocaleString("en-US")} ·{" "}
            {result.totalPlayers} players · Manager: {result.createdBy}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() =>
              gameResultsApi.exportCsv(
                result._id,
                result.quizzSubject,
                new Date(result.playedAt).toISOString().split("T")[0],
              )
            }
          >
            Export CSV
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate("/admin/game-history")}
          >
            ← Back
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="questions">By Question</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Total Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.players
                .sort((a, b) => a.rank - b.rank)
                .map((p) => (
                  <TableRow key={p.username}>
                    <TableCell>
                      <Badge variant={p.rank <= 3 ? "default" : "secondary"}>
                        #{p.rank}
                      </Badge>
                    </TableCell>
                    <TableCell>{p.username}</TableCell>
                    <TableCell>{p.totalPoints}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="questions">
          <div className="space-y-4">
            <Select
              value={selectedQuestion}
              onValueChange={setSelectedQuestion}
            >
              <SelectTrigger className="w-60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {result.questions.map((q, i) => (
                  <SelectItem key={i} value={String(i)}>
                    Q{i + 1}: {q.questionText.slice(0, 40)}...
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {currentQ && (
              <div className="space-y-3">
                <p className="font-medium">{currentQ.questionText}</p>
                <div className="flex flex-wrap gap-2">
                  {currentQ.answers.map((a, i) => (
                    <span
                      key={i}
                      className={`rounded px-2 py-1 text-sm ${ANSWER_COLORS[i]} ${
                        i === currentQ.correctAnswerIndex
                          ? "font-bold underline"
                          : ""
                      }`}
                    >
                      {a}
                    </span>
                  ))}
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Answer</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead>Points</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentQ.playerResults.map((pr) => (
                      <TableRow key={pr.username}>
                        <TableCell>{pr.username}</TableCell>
                        <TableCell>
                          {pr.answerId !== null ? (
                            <span className={ANSWER_COLORS[pr.answerId]}>
                              {currentQ.answers[pr.answerId]}
                            </span>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell>
                          {pr.correct ? (
                            <span className="font-semibold text-green-500">Correct</span>
                          ) : (
                            <span className="font-semibold text-red-500">Incorrect</span>
                          )}
                        </TableCell>
                        <TableCell>{pr.points}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GameDetailPage;
