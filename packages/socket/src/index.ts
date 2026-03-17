import http from "http";
import express from "express";
import cors from "cors";
import { Server as ServerIO } from "socket.io";
import type { Server, Socket } from "@quizio/common/types/game/socket";
import { inviteCodeValidator } from "@quizio/common/validators/auth";
import { connectDB } from "@quizio/socket/db/client";
import { Quiz } from "@quizio/socket/db/models/quiz";
import Game from "@quizio/socket/services/game";
import Registry from "@quizio/socket/services/registry";
import { userService } from "@quizio/socket/services/userService";
import { withGame } from "@quizio/socket/utils/game";
import adminRouter from "@quizio/socket/routes/index";
import type { QuizzWithId } from "@quizio/common/types/game";

const WS_PORT = parseInt(process.env.WS_PORT || "3001");

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

const httpServer = http.createServer(app);

const io: Server = new ServerIO(httpServer, {
  path: "/ws",
  cors: { origin: "*" },
}) as unknown as Server;

app.use("/api/admin", adminRouter);

const registry = Registry.getInstance();

async function main() {
  httpServer.listen(WS_PORT, "0.0.0.0", () => {
    console.log(`Socket server running on port ${WS_PORT}`);
  });
  await connectDB();
}

io.on("connection", (socket: Socket) => {
  console.log(
    `A user connected: socketId: ${socket.id}, clientId: ${socket.handshake.auth.clientId}`,
  );

  socket.on("player:reconnect", ({ gameId }) => {
    const game = registry.getPlayerGame(gameId, socket.handshake.auth.clientId);

    if (game) {
      game.reconnect(socket);

      return;
    }

    socket.emit("game:reset", "Game not found");
  });

  socket.on("manager:reconnect", ({ gameId }) => {
    const game = registry.getManagerGame(
      gameId,
      socket.handshake.auth.clientId,
    );

    if (game) {
      game.reconnect(socket);

      return;
    }

    socket.emit("game:reset", "Game expired");
  });

  socket.on("manager:auth", async ({ username, password }) => {
    try {
      const user = await userService.findByUsername(username);
      if (!user) {
        socket.emit("manager:errorMessage", "Invalid credentials");
        return;
      }
      const valid = await userService.verifyPassword(user, password);
      if (!valid) {
        socket.emit("manager:errorMessage", "Invalid credentials");
        return;
      }
      (socket as any).data = {
        user: { userId: user._id.toString(), username: user.username },
      };
      const quizzDocs = await Quiz.find().lean();
      const formattedList: QuizzWithId[] = quizzDocs.map((q: any) => ({
        id: q._id.toString(),
        subject: q.subject,
        questions: q.questions,
      }));
      socket.emit("manager:quizzList", formattedList);
    } catch (error) {
      console.error("Failed to auth manager:", error);
      socket.emit("manager:errorMessage", "Authentication failed");
    }
  });

  socket.on("game:create", async (quizzId) => {
    try {
      const quizzDoc = (await Quiz.findById(quizzId).lean()) as any;
      if (!quizzDoc) {
        socket.emit("game:errorMessage", "Quizz not found");
        return;
      }
      const quizz: QuizzWithId = {
        id: quizzDoc._id.toString(),
        subject: quizzDoc.subject,
        questions: quizzDoc.questions,
      };
      const createdBy = (socket as any).data?.user?.username || "";
      const game = new Game(
        io,
        socket,
        quizz,
        quizzDoc._id.toString(),
        createdBy,
      );
      registry.addGame(game);
    } catch (err) {
      console.error("game:create error:", err);
      socket.emit("game:errorMessage", "Failed to create game");
    }
  });

  socket.on("player:join", (inviteCode) => {
    const result = inviteCodeValidator.safeParse(inviteCode);

    if (result.error) {
      socket.emit("game:errorMessage", result.error.issues[0].message);

      return;
    }

    const game = registry.getGameByInviteCode(inviteCode);

    if (!game) {
      socket.emit("game:errorMessage", "Game not found");

      return;
    }

    socket.emit("game:successRoom", game.gameId);
  });

  socket.on("player:login", ({ gameId, data }) =>
    withGame(gameId, socket, (game) => game.join(socket, data.username)),
  );

  socket.on("manager:kickPlayer", ({ gameId, playerId }) =>
    withGame(gameId, socket, (game) => game.kickPlayer(socket, playerId)),
  );

  socket.on("manager:startGame", ({ gameId }) =>
    withGame(gameId, socket, (game) => game.start(socket)),
  );

  socket.on("player:selectedAnswer", ({ gameId, data }) =>
    withGame(gameId, socket, (game) =>
      game.selectAnswer(socket, data.answerKey),
    ),
  );

  socket.on("manager:abortQuiz", ({ gameId }) =>
    withGame(gameId, socket, (game) => game.abortRound(socket)),
  );

  socket.on("manager:nextQuestion", ({ gameId }) =>
    withGame(gameId, socket, (game) => game.nextRound(socket)),
  );

  socket.on("manager:showLeaderboard", ({ gameId }) =>
    withGame(gameId, socket, (game) => game.showLeaderboard()),
  );

  socket.on("disconnect", () => {
    console.log(`A user disconnected : ${socket.id}`);

    const managerGame = registry.getGameByManagerSocketId(socket.id);

    if (managerGame) {
      managerGame.manager.connected = false;
      registry.markGameAsEmpty(managerGame);

      if (!managerGame.started) {
        console.log("Reset game (manager disconnected)");
        managerGame.abortCooldown();
        io.to(managerGame.gameId).emit("game:reset", "Manager disconnected");
        registry.removeGame(managerGame.gameId);

        return;
      }
    }

    const game = registry.getGameByPlayerSocketId(socket.id);

    if (!game) {
      return;
    }

    const player = game.players.find((p) => p.id === socket.id);

    if (!player) {
      return;
    }

    if (!game.started) {
      game.players = game.players.filter((p) => p.id !== socket.id);

      io.to(game.manager.id).emit("manager:removePlayer", player.id);
      io.to(game.gameId).emit("game:totalPlayers", game.players.length);

      console.log(`Removed player ${player.username} from game ${game.gameId}`);

      return;
    }

    player.connected = false;
    io.to(game.gameId).emit("game:totalPlayers", game.players.length);
  });
});

process.on("SIGINT", () => {
  Registry.getInstance().cleanup();
  process.exit(0);
});

process.on("SIGTERM", () => {
  Registry.getInstance().cleanup();
  process.exit(0);
});

main().catch(console.error);
