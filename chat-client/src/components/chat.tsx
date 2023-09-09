import { useState, useEffect } from 'react';
import { Chatform } from './ChatForm/ChatForm';
import { nanoid } from 'nanoid/async';
import css from './chat.module.css';

type chatProps = {
  socket: any;
  userName: string;
  isLoggedin: boolean;
  userId: string;
};

type onlineUsers = {
  id: string;
  userName: string;
};

type messageType = {
  messageUser: string;
  userName: string;
};
type member = {
  id: number | null | undefined;
  userName: string | null;
};
export type chatData = {
  name: ReactNode;
  id: string;
  owner: string | '';
  members: member[] | [];
  messages: messageType[] | [];
};

type errorType = {
  message: string;
  data: any;
  type: string;
};
export const Chat = ({ socket, userName, isLoggedin, userId }: chatProps) => {
  const [users, setUsers] = useState<onlineUsers[] | []>([]);
  const [activeUsers, setActiveUsers] = useState(0);
  const [error, setError] = useState<errorType | null>(null);
  const [chatUsers, setChatUsers] = useState<member[]>([
    { id: userId, userName: userName },
  ]);

  const [chats, setChats] = useState<chatData[] | []>([]);
  const [activeChat, setActiveChat] = useState<chatData | null>(null);

  useEffect(() => {
    socket.on('activeUsers', (usersLogged: number) => {
      setActiveUsers(usersLogged);
    });
    socket.on('chatError', (data: any) => {
      setError(data);
    });
    socket.on('onlineUsers', (data: any) => {
      console.log(data);
      setUsers(data);
    });

    socket.on('createChat', async (data: any) => {
      const chat: chatData = {
        id: data.roomName,
        owner: data.userId,
        members: data.chatUsers,
        messages: [],
      };
      setChats(prevVal => [...prevVal, chat]);
    });

    return () => {
      socket.off('message');
      socket.off('user');
      socket.emit('leave');
      socket.close();
    };
  }, []);

  const handleUserSelection = (member: member) => {
    if (chatUsers.some(u => u.id === member.id)) {
      setChatUsers(chatUsers.filter(m => m.id !== member.id));
    } else {
      setChatUsers([...chatUsers, member]);
    }
  };

  const createChat = async () => {
    const roomName = await nanoid();
    socket.emit('createChat', { userId, roomName, chatUsers });

    setChatUsers([{ id: userId, userName: userName }]);
  };

  const handleStartChat = async (chatId: string) => {
    const chatToActive = chats.find(chat => chat.id === chatId);

    const data = {
      userId: userId,
      roomName: chatToActive?.id,
      chatUsers: chatToActive?.members,
    };
    await socket.emit('openChat', data);
    if (chatToActive) setActiveChat(chatToActive);
  };
  return (
    <div className={css.chatWrapper}>
      <div>
        {error && <p>{error.message}</p>}
        <p>Users Chats:</p>
        {chats.length === 0 ? (
          <p>Start new conversation</p>
        ) : (
          <ul>
            {chats.map(chat => (
              <li key={chat.id}>
                <p>{chat.id}</p>
                <ul>
                  {chat.members?.map(member => (
                    <li key={member.id}>{member.userName}</li>
                  ))}
                </ul>
                <button onClick={() => handleStartChat(chat!.id)}>
                  START CHAT
                </button>
              </li>
            ))}
          </ul>
        )}

        <h2>Users</h2>
        <p>Users online: {activeUsers}</p>
        <div>
          {users &&
            users.map(user => (
              <div key={user.id}>
                <input
                  type="checkbox"
                  onChange={() => handleUserSelection(user)}
                  checked={
                    chatUsers.some(u => u.id === user.id) || user.id === userId
                  }
                />
                {user.userName}
              </div>
            ))}

          <button onClick={createChat}>Rozpocznij nowy czat</button>
        </div>
      </div>
      {activeChat && (
        <Chatform socket={socket} chat={activeChat} userName={userName} />
      )}
    </div>
  );
};
