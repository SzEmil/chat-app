import { useState, useEffect } from 'react';
import { Chatform } from '../../components/ChatForm/ChatForm';
import { nanoid } from 'nanoid/async';
import { selectAuthUserUsername } from '../../redux/user/userSelectors';
import { selectAuthUserId } from '../../redux/user/userSelectors';
import { selectAuthUserIsLoggedIn } from '../../redux/user/userSelectors';
import { useSelector } from 'react-redux';
import css from './ChatPage.module.css';
import { getSocket, resetSocket } from '../../services/socketService';
import { selectAuthUserData } from '../../redux/user/userSelectors';
import { logOut } from '../../redux/user/userOperations';
import { AppDispatch } from '../../redux/store';
import { useDispatch } from 'react-redux';
import { initializeSocket } from '../../services/socketService';
import { BiLogOut } from 'react-icons/bi';
import Notiflix from 'notiflix';

type onlineUsers = {
  id: number | null | undefined;
  username: string;
  userName: string;
};

type messageType = {
  messageUser: string;
  userName: string;
};
type member = {
  id: number | null | undefined;
  userName?: string | null;
  username?: string | null;
};
export type chatData = {
  id: string | null;
  name: string;
  owner: string | '';
  members: member[] | [];
  messages: messageType[] | [];
  lastMessage: {
    newMessage: string;
    user: string;
  };
  isNewMessageArrived?: boolean;
};

type errorType = {
  message: string;
  data: any;
  type: string;
};
export const ChatPage = () => {
  const dispatch: AppDispatch = useDispatch();

  const [socket, setSocket] = useState(getSocket());
  const userName = useSelector(selectAuthUserUsername);
  const userId = useSelector(selectAuthUserId);
  const isLoggedIn = useSelector(selectAuthUserIsLoggedIn);
  const user = useSelector(selectAuthUserData);

  const [users, setUsers] = useState<onlineUsers[] | []>([]);
  const [onlineUsers, setOnlineUsers] = useState<onlineUsers[] | []>([]);
  const [chatName, setChatName] = useState('');
  const [error, setError] = useState<errorType | null>(null);
  const [chatUsers, setChatUsers] = useState<member[]>([
    { id: userId, username: userName },
  ]);

  const [chats, setChats] = useState<chatData[] | []>([]);
  const [activeChat, setActiveChat] = useState<chatData | null>({
    id: null,
    owner: '',
    name: '',
    members: [],
    messages: [],
    lastMessage: {
      newMessage: '',
      user: '',
    },
    isNewMessageArrived: false,
  });
  const [chatsFilter, setChatsFilter] = useState('');
  const [usersFilter, setUsersFilter] = useState('');
  const filteredChats = chats.filter(chat => {
    if (chat.members && chat.members.length > 0) {
      return chat.members.some(member => {
        return member
          .username!.toLowerCase()
          .includes(chatsFilter.toLowerCase());
      });
    }
    return false;
  });

  const filteredUsers = users.filter(user =>
    user.username!.toLowerCase().includes(usersFilter.toLowerCase())
  );

  useEffect(() => {
    const initializeSocketAndRedux = async () => {
      if (isLoggedIn && userName !== null && userId !== null) {
        const socketNET = await initializeSocket({ userName, userId });
        await new Promise<void>(resolve => {
          socketNET!.on('connect', () => {
            resolve();
          });
        });

        if (socketNET) {
          setSocket(socketNET);
        }
      }
    };

    initializeSocketAndRedux();
  }, [isLoggedIn]);

  useEffect(() => {
    if (socket != null) {
      socket?.emit('userRooms', userId);
      socket?.emit('getLoggedUsers');
      socket?.emit('getAllUsers');
    }
  }, [socket]);
  useEffect(() => {
    if (socket) {
      socket!.on('chatError', (data: any) => {
        setError(data);
        console.error(error);
        Notiflix.Notify.info(data.message);
      });
      socket!.on('getAllUsers', (data: any) => {
        setUsers(data.allUsers);
      });
      socket!.on('onlineUsers', (data: any) => {
        setOnlineUsers(data.onlineUsers);
      });

      socket.on('userRooms', async (data: any) => {

        const chatsData = data.map((chat: any) => {
          const newChat: chatData = {
            id: chat.id,
            name: chat.chatName,
            owner: chat.owner,
            members: JSON.parse(chat.clients),
            messages: [],
            lastMessage: chat.lastMessage,
            isNewMessageArrived: chat.newMessage,
          };
          return newChat;
        });
        setChats(chatsData);
      });

      socket!.on('createChat', async (data: any) => {
        const chat: chatData = {
          id: data.roomName,
          name: data.chatName,
          owner: data.userId,
          members: data.chatUsers,
          messages: [],
          lastMessage: {
            newMessage: '',
            user: '',
          },
        };
        setChats(prevVal => [...prevVal, chat]);
      });
    }
  }, [socket]);
  useEffect(() => {
    if (chats.length > 0) {
      socket!.on('newMessageDataArrived', (data: any) => {
        const foundChat = chats.find(chat => chat.id == data.chatId);
        if (chats && foundChat) {
          foundChat!.lastMessage = data.messageData;
          const indexOfChat = chats.findIndex(chat => chat.id == foundChat.id);
          chats.splice(indexOfChat, 1, foundChat);
          setChats([...chats]);
        }
      });

      socket!.on('newMessageArrived', (data: any) => {
        const foundChat = chats.find(chat => chat.id == data.chatId);
        if (chats && foundChat) {
          foundChat!.isNewMessageArrived = data.isNewMessageArrived;
          const indexOfChat = chats.findIndex(chat => chat.id == foundChat.id);
          chats.splice(indexOfChat, 1, foundChat);
          setChats([...chats]);
        }
      });

      socket!.on('newMessageChecked', (data: any) => {
        const foundChat = chats.find(chat => chat.id == data.chatId);
        if (chats && foundChat) {
          const newMessageFlag = false;
          foundChat!.isNewMessageArrived = newMessageFlag;
          const indexOfChat = chats.findIndex(chat => chat.id == foundChat.id);
          chats.splice(indexOfChat, 1, foundChat);
          setChats([...chats]);
        }
      });
    }
  }, [chats]);
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

      setChatUsers([{ id: userId, username: userName }]);
    }
  };

  const handleStartChat = async (chatId: string | null) => {
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
      setSocket(null);
      resetSocket();
    }
  };

  return (
    <div className={css.chatWrapper}>
      <div className={css.chatBox}>
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
                  className={`${css.userChatsItem} ${
                    chat.id == activeChat?.id && css.activeChat
                  }`}
                  key={chat.id}
                  onClick={() => handleStartChat(chat.id)}
                >
                  {chat.name !== '' ? <p>{chat.name}</p> : null}
                  <ul className={css.userChatMembers}>
                    {chat.members?.map(member => (
                      <li key={member.id}>
                        <p>{member.username}</p>
                      </li>
                    ))}
                  </ul>
                  {chat.lastMessage && (
                    <p
                      className={`${css.newMessageText} ${
                        chat.isNewMessageArrived && css.newMessage
                      }`}
                    >
                      {chat.lastMessage.user}: {chat.lastMessage.newMessage}
                    </p>
                  )}
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
          <p>Users online: {onlineUsers.length}</p>

          <div className={css.users}>
            {users &&
              filteredUsers.map(user => (
                <div className={css.loggedUser} key={user.id}>
                  <input
                    type="checkbox"
                    onChange={() => handleUserSelection(user)}
                    checked={
                      chatUsers.some(u => u.id === user.id) || user.id == userId
                    }
                  />
                  <div className={css.userChat}>
                    <p>{user.username}</p>
                    {onlineUsers.some(
                      onlineUser => onlineUser.id == user.id
                    ) ? (
                      <span className={css.logged}></span>
                    ) : (
                      <span className={css.notLogged}></span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
        <div>
          <input
            className={css.chatNameInput}
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
