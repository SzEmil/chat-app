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
import { BiLogOut } from 'react-icons/bi';
import Notiflix from 'notiflix';

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
  name: string;
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
  //dodać fetcha wszystkich userów zamiast tylko tych zalogowanych, Ci zalogowani beda wykorzsytywaani by dodać że są zalgoowani poprzez wyszukanie ich w chatUsers
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
  const [chatName, setChatName] = useState('');
  const [error, setError] = useState<errorType | null>(null);
  const [chatUsers, setChatUsers] = useState<member[]>([
    { id: userId, userName: userName },
  ]);

  const [chats, setChats] = useState<chatData[] | []>([]);
  const [activeChat, setActiveChat] = useState<chatData | null>({
    id: '',
    owner: '',
    name: '',
    members: [],
    messages: [],
  });
  const [chatsFilter, setChatsFilter] = useState('');
  const [usersFilter, setUsersFilter] = useState('');
  const filteredChats = chats.filter(chat => {
    if (chat.members && chat.members.length > 0) {
      return chat.members.some(member => {
        return member
          .userName!.toLowerCase()
          .includes(chatsFilter.toLowerCase());
      });
    }
    return false;
  });

  const filteredUsers = users.filter(user =>
    user.userName!.toLowerCase().includes(usersFilter.toLowerCase())
  );
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
        Notiflix.Notify.info(data.message);
      });
      socket!.on('onlineUsers', (data: any) => {
        console.log(data);
        setUsers(data);
      });

      socket.on('userRooms', (data: any) => {
        console.log(data);
        const chatsData = data.map((chat: any) => {
          const newChat: chatData = {
            id: chat.id,
            name: chat.chatName,
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
        setActiveChat({
          id: '',
          name: '',
          owner: '',
          members: [],
          messages: [],
        });
      });

      socket!.on('createChat', async (data: any) => {
        const chat: chatData = {
          id: data.roomName,
          name: data.chatName,
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
      socket!.emit('createChat', { userId, roomName, chatUsers, chatName });

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
      <div className={css.chatBox}>
        {/* <button onClick={() => console.log(filteredChats)}>chaty</button> */}

        <ul className={css.userNav}>
          <li>
            <p>{user.username}</p>
          </li>
          <li>
            <button className={css.btn} onClick={() => handleLogOut()}>
              <BiLogOut size={34} />
            </button>
          </li>
        </ul>

        <div className={css.chatsWrapper}>
          <input
            className={css.chatsInput}
            type="text"
            placeholder="Search for chat"
            name="chatName"
            onChange={e => setChatsFilter(e.target.value)}
            value={chatsFilter}
          />
          {chats.length === 0 ? (
            <p>Start new conversation</p>
          ) : (
            <ul className={css.userChats}>
              {filteredChats.map(chat => (
                <li
                  className={css.userChatsItem}
                  key={chat.id}
                  onClick={() => handleStartChat(chat!.id)}
                >
                  <ul className={css.userChatMembers}>
                    {chat.members?.map(member => (
                      <li key={member.id}>
                        <p>{member.userName}</p>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </div>
        {activeChat && socket && (
          <Chatform
            socket={socket}
            chat={activeChat}
            userName={userName}
            user={user}
          />
        )}
      </div>
      <div className={css.newChatBox}>
        <div>
          <h2>Users</h2>
          <input
            type="text"
            placeholder="Search for users"
            name="chatName"
            onChange={e => setUsersFilter(e.target.value)}
            value={usersFilter}
          />
          <p>Users online: {activeUsers}</p>

          <div className={css.users}>
            {users &&
              filteredUsers.map(user => (
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
          </div>
        </div>
        <div>
          <input
            type="text"
            placeholder="Chat name"
            name="newChatName"
            onChange={e => setChatName(e.target.value)}
            value={chatName}
          />
          <button onClick={createChat}>New Chat</button>
        </div>
      </div>
    </div>
  );
};
