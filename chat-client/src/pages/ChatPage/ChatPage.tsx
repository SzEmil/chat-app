import { useState, useEffect } from 'react';
import { Chatform } from '../../components/ChatForm/ChatForm';
import { nanoid } from 'nanoid/async';
import { selectAuthUserUsername } from '../../redux/user/userSelectors';
import { selectAuthUserId } from '../../redux/user/userSelectors';
import { selectAuthUserIsLoggedIn } from '../../redux/user/userSelectors';
import { useSelector } from 'react-redux';
import css from './ChatPage.module.css';
import { getSocket } from '../../services/socketService';
import { selectAuthUserData } from '../../redux/user/userSelectors';
import { logOut } from '../../redux/user/userOperations';
import { AppDispatch } from '../../redux/store';
import { useDispatch } from 'react-redux';
import { initializeSocket } from '../../services/socketService';

type onlineUsers = {
  id: number | null | undefined;
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
export const ChatPage = () => {
  const dispatch: AppDispatch = useDispatch();
  const socket = getSocket();
  // const socketReady = useSelector(selectSocketReady);
  const userName = useSelector(selectAuthUserUsername);
  const userId = useSelector(selectAuthUserId);
  const isLoggedIn = useSelector(selectAuthUserIsLoggedIn);
  const user = useSelector(selectAuthUserData);

  const [socketReady, setSocketReady] = useState(false);
  const [users, setUsers] = useState<onlineUsers[] | []>([]);
  const [activeUsers, setActiveUsers] = useState(0);
  const [error, setError] = useState<errorType | null>(null);
  const [chatUsers, setChatUsers] = useState<member[]>([
    { id: userId, userName: userName },
  ]);

  const [chats, setChats] = useState<chatData[] | []>([]);
  const [activeChat, setActiveChat] = useState<chatData | null>(null);

  useEffect(() => {
    const initializeSocketAndRedux = async () => {
      if (isLoggedIn) {
        const socket = initializeSocket({ userName, userId });
        await new Promise<void>(resolve => {
          socket.on('connect', () => {
            resolve();
          });
        });

        if (socket !== undefined) {
          setSocketReady(true);
        }
      }
    };

    initializeSocketAndRedux();
    // if (socketReady) navigate('/chat');
  }, [isLoggedIn]);
  useEffect(() => {
    socket?.emit('userRooms', userId);
  }, [socket]);
  useEffect(() => {
    if (socket) {
      socket!.on('activeUsers', (usersLogged: number) => {
        setActiveUsers(usersLogged);
      });
      socket!.on('chatError', (data: any) => {
        setError(data);
      });
      socket!.on('onlineUsers', (data: any) => {
        console.log(data);
        setUsers(data);
      });

      socket.on('userRooms', (data: any) => {
        const chatsData = data.map((chat: any) => {
          const newChat: chatData = {
            id: chat.id,
            owner: chat.owner,
            members: chat.clients,
            messages: [],
          };
          return newChat;
        });
        setChats(chatsData);
        console.log('userRoomsd', chatsData);
      });

      socket.on('endChat', (data: any) => {
        const indexToDelette = chats.findIndex(
          chat => chat.id === data.roomName
        );
        const newChats = chats.splice(indexToDelette, 1);
        console.log(newChats);
        setChats(newChats);
        setActiveChat(null);
      });

      socket!.on('createChat', async (data: any) => {
        const chat: chatData = {
          id: data.roomName,
          owner: data.userId,
          members: data.chatUsers,
          messages: [],
        };
        setChats(prevVal => [...prevVal, chat]);
      });

      // return () => {
      //   socket!.off('message');
      //   socket!.off('user');
      //   socket!.emit('leave');
      //   socket!.close();
      // };
    }
  }, [socket]);

  const handleUserSelection = (member: member) => {
    if (chatUsers.some(u => u.id === member.id)) {
      setChatUsers(chatUsers.filter(m => m.id !== member.id));
    } else {
      setChatUsers([...chatUsers, member]);
    }
  };

  const createChat = async () => {
    if (socket) {
      const roomName = await nanoid();
      socket!.emit('createChat', { userId, roomName, chatUsers });

      setChatUsers([{ id: userId, userName: userName }]);
    }
  };

  const handleStartChat = async (chatId: string) => {
    if (socket) {
      const chatToActive = chats.find(chat => chat.id === chatId);

      const data = {
        userId: userId,
        roomName: chatToActive?.id,
        chatUsers: chatToActive?.members,
      };
      await socket!.emit('openChat', data);
      if (chatToActive) setActiveChat(chatToActive);
    }
  };

  const handleLogOut = () => {
    if (socket) {
      dispatch(logOut());
      socket.emit('leaveServer');
    }
  };
  return (
    <div className={css.chatWrapper}>
      <button onClick={() => console.log(chats)}>chaty</button>
      <div>
        USER: {user.email}{' '}
        <button onClick={() => handleLogOut()}>LOGOUT</button>
      </div>
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
                    chatUsers.some(u => u.id === user.id) || user.id == userId
                  }
                />
                {user.userName}
              </div>
            ))}

          <button onClick={createChat}>Rozpocznij nowy czat</button>
        </div>
      </div>
      {activeChat && socket && (
        <Chatform socket={socket} chat={activeChat} userName={userName} />
      )}
    </div>
  );
};
