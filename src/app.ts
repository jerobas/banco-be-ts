import cors from "cors";
import express from "express";
import http from "http";
import "reflect-metadata";
import swaggerUi from "swagger-ui-express";
import generateSwaggerSpec from "./config/swagger";
import { AppDataSource } from "./db/ormconfig";
import { startChatHandler } from "./handlers/ChatHandler";
import { startGameHandler } from "./handlers/GameHandler";
import { startRoomHandler } from "./handlers/RoomsHandler";
import { socketHandler } from "./handlers/SocketHandler";
import socketMiddleware from "./middleware/socket";
import timeoutMiddleware from "./middleware/timeout";
import validateRefere from "./middleware/validateReferer";
import router from "./routes/router";
import { SocketService } from "./services/SocketService";

const initializeApp = async () => {
  AppDataSource.initialize();

  const app = express();
  const server = http.createServer(app);
  const socketService = new SocketService(server);

  const io = socketService.getIO();

  io.on("connection", async (socket) => {
    await Promise.all([
      socketHandler(socket),
      startRoomHandler(socket, io),
      startChatHandler(socket, io),
      startGameHandler(socket, io),
    ]);
  });

  app.use(cors());
  app.use(express.json());
  app.use(validateRefere);
  app.use(timeoutMiddleware(8000));
  app.use(socketMiddleware(io));

  app.use(router);

  const swaggerSpec = generateSwaggerSpec(app);

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  const PORT = process.env.PORT || 3333;
  server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
};

initializeApp().catch((error) => {
  console.error("Failed to initialize the app:", error);
});
