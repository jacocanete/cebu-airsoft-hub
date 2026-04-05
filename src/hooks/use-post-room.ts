import { useEffect } from "react";
import { socket } from "@/lib/socket";

// Single owner of the socket connection and post:{postId} room lifecycle.
// Mount this once on the post detail page. useComments and usePostDetail
// add their own event listeners independently without managing the room.
export function usePostRoom(postId: string) {
  useEffect(() => {
    const wasConnected = socket.connected;
    if (!wasConnected) socket.connect();
    socket.emit("post:join", postId);

    return () => {
      socket.emit("post:leave", postId);
      if (!wasConnected) socket.disconnect();
    };
  }, [postId]);
}
