import cors from "cors";
import express from "express";
import http from "http";
import "reflect-metadata";
import swaggerUi from "swagger-ui-express";
import cookieParser from "cookie-parser";

import generateSwaggerSpec from "./config/swagger";
import { initializeDatabase } from "./db/ormconfig";
import { startChatHandler } from "./handlers/ChatHandler";
import { startGameHandler } from "./handlers/GameHandler";
import { startRoomHandler } from "./handlers/RoomsHandler";
import { socketHandler } from "./handlers/SocketHandler";
import socketMiddleware from "./middleware/socket";
import timeoutMiddleware from "./middleware/timeout";
import router from "./routes/router";
import { SocketService } from "./services/SocketService";

const initializeApp = async () => {
  await initializeDatabase();

  const app = express();
  const server = http.createServer(app);
  const socketService = new SocketService(server);

  const io = socketService.getIO();
  app.set("trust proxy", true);

  io.on("connection", async (socket) => {
    await Promise.all([
      socketHandler(socket),
      startRoomHandler(socket, io),
      startChatHandler(socket, io),
      startGameHandler(socket, io),
    ]);
  });

  app.use(
    cors({
      origin:
        process.env.ENV == "dev"
          ? "http://localhost:3000"
          : `${process.env.AWS_HOST}:${process.env.PORT_FE}`,
      credentials: true,
    })
  );
  app.use(cookieParser());
  app.use(express.json());
  app.use(timeoutMiddleware(8000));
  app.use(socketMiddleware(io));

  app.use(router);

  const swaggerSpec = generateSwaggerSpec(app);

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  const PORT = process.env.PORT || 3333;
  if (process.env.ENV == "dev")
    server.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log(`Swagger is running on http://localhost:${PORT}/api-docs`);
    });
  else
    server.listen(PORT, () => {
      console.log(`Server is running on ${process.env.AWS_HOST}:${PORT}`);
      console.log(
        `Swagger is running on ${process.env.AWS_HOST}:${PORT}/api-docs`
      );
    });
};

initializeApp().catch((error) => {
  console.error("Failed to initialize the app:", error);
});
