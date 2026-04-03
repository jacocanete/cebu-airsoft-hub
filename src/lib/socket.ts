import { io } from "socket.io-client";

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:3001";

export const socket = io(BASE_URL, {
  autoConnect: false,
  withCredentials: true,
});
