import { Server } from "socket.io";
import { Server as HttpServer } from "http";

let io: Server;

const initSocket = (server: HttpServer): void => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log("A user connected");
  
    socket.on("error", (err) => {
      console.error("Socket error:", err);
    });
  
    socket.on("disconnect", (reason) => {
      console.log("User disconnected due to:", reason);
    });
  });  
};

const getIO = (): Server => {
  if (!io) {
    throw new Error("Socket.IO not initialized. Please ensure initSocket is called before accessing getIO.");
  }
  return io;
};

export { initSocket, getIO };