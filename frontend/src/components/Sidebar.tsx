import { useState, useEffect } from "react";
import axios from "axios";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Conversation, SideBarProps } from "../../types";

const Sidebar = ({
  userId,
  onSelectConversation,
  onDeleteConversation,
}: SideBarProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  // Fetch conversations from the backend when component mounts or userId changes
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await axios.get(
          `/api/assistant/getConversation?userId=${userId}`
        );
        setConversations(res.data);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      }
    };

    if (userId) {
      fetchConversations();
    }
  }, [userId]);

  // Helper function to shorten question text for display
  const shortenQuestion = (question: string): string => {
    const title = question.split(/\s+/).slice(0, 8).join(" ");
    return title.length > 50 ? `${title.substring(0, 47)}...` : title;
  };

  // Handle deletion of a conversation
  const handleDelete = async (id: string) => {
    try {
      await axios.post(`/api/assistant/deleteInteraction`, { id });
      // Update local state to reflect deleted conversation
      setConversations(conversations.filter((convo) => convo._id !== id));

      if (onDeleteConversation) onDeleteConversation(id); // Pass the `id` here
    } catch (error) {
      console.error("Error deleting conversation:", error);
      // Optionally, display an error message or notification to the user
    }
  };

  return (
    <div className="w-64 bg-gray-800 text-white p-4 sidebar">
      <h2 className="text-2xl font-bold mb-4">Conversations</h2>
      {conversations.map((convo) => (
        <div key={convo._id} className="mb-4">
          <div className="flex justify-between items-center">
            <div
              className="cursor-pointer"
              onClick={() => onSelectConversation(convo)}
            >
              {shortenQuestion(convo.question)}
            </div>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger className="text-white menu-button">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-6 h-6"
                >
                  <path d="M12 7a2 2 0 110-4 2 2 0 010 4zM12 13a2 2 0 110-4 2 2 0 010 4zM12 19a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content className="bg-gray-700 text-white p-2 rounded-md dropdown-menu">
                <DropdownMenu.Item
                  className="dropdown-item"
                  onSelect={() => handleDelete(convo._id)} // Pass conversation ID to handleDelete
                >
                  Delete
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Sidebar;
