import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  gameResultsApi,
  type GameResultListItem,
} from "@quizio/web/features/admin/api/gameResults";
import { useAdminStore } from "@quizio/web/features/admin/stores/admin";
import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router";

const GameHistoryPage = () => {
  const { token } = useAdminStore();
  if (!token) return <Navigate to="/admin/login" replace />;

  const navigate = useNavigate();
  const [results, setResults] = useState<GameResultListItem[]>([]);
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await gameResultsApi.list({
        from: from || undefined,
        to: to || undefined,
      });
      setResults(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = results.filter((r) =>
    r.quizzSubject.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Lịch sử game</h1>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Tìm theo tên quiz..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-56"
        />
        <Input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="w-40"
        />
        <Input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="w-40"
        />
        <Button onClick={load}>Lọc</Button>
      </div>

      {loading ? (
        <p className="text-gray-500">Đang tải...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Quiz</TableHead>
              <TableHead>Ngày chơi</TableHead>
              <TableHead>Số người</TableHead>
              <TableHead>Manager</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((r) => (
              <TableRow key={r._id}>
                <TableCell>{r.quizzSubject}</TableCell>
                <TableCell>
                  {new Date(r.playedAt).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </TableCell>
                <TableCell>{r.totalPlayers}</TableCell>
                <TableCell>{r.createdBy}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => navigate(`/admin/game-history/${r._id}`)}
                    >
                      Xem
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        gameResultsApi.exportCsv(
                          r._id,
                          r.quizzSubject,
                          new Date(r.playedAt).toISOString().split("T")[0],
                        )
                      }
                    >
                      Export
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-500">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default GameHistoryPage;
