import { useState, useEffect } from 'react';
// import { socket } from '../App';
import css from './chat.module.css';

type messageType = {
  messageUser: string;
  userName: string;
};

type chatProps = {
  socket: any;
  userName: string;
  isLoggedin: boolean;
};

type onlineUsers = {
  id: number;
  userName: string;
};
export const Chat = ({ socket, userName, isLoggedin }: chatProps) => {
  const [messageUser, setMessageUser] = useState('');
  const [messagesArr, setMessagesArr] = useState<messageType[]>([]);
  const [users, setUsers] = useState<onlineUsers[] | []>([]);
  const [activeUsers, setActiveUsers] = useState(0);
  const [chatUsers, setChatUsers] = useState<string[] | number[]>([]);

  useEffect(() => {
    socket.on('message', (message: messageType) => {
      setMessagesArr(prevValue => [...prevValue, message]);
    });

    socket.on('activeUsers', (usersLogged: number) => {
      setActiveUsers(usersLogged);
    });

    socket.on('onlineUsers', (data: any) => {
      console.log(data);
      setUsers(data);
    });

    return () => {
      socket.off('message');
      socket.off('user');
      socket.emit('leave');
      socket.close();
    };
  }, []);

  const handleSubmit = (event: any) => {
    event.preventDefault();

    if (messageUser.trim() !== '') {
      socket.emit('message', {
        messageUser,
        userName,
      });
      setMessageUser('');
    }
  };

  const handleUserSelection = (userId: any) => {
    if (chatUsers.includes(userId)) {
      setChatUsers(chatUsers.filter(id => id !== userId));
    } else {
      setChatUsers([...chatUsers, userId]);
    }
  };
  const startChat = () => {
    setChatUsers([]);
  };
  return (
    <div>
      <button onClick={() => console.log(userName)}>CHECK USERS</button>
      <h2>Users</h2>
      <div>
        {users &&
          users.map(user => (
            <div key={user.id}>
              <input
                type="checkbox"
                onChange={() => handleUserSelection(user.id)}
                checked={chatUsers.includes(user.id)}
              />
              {user.userName}
            </div>
          ))}

        <button onClick={startChat}>Rozpocznij nowy czat</button>
      </div>
      <p>Users on chat: {activeUsers}</p>
      <form onSubmit={handleSubmit}>
        <input
          name="userMessage"
          type="text"
          placeholder="Enter your message"
          value={messageUser}
          onChange={e => setMessageUser(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>

      {messagesArr.map((message, index) => (
        <div className={css.messageBox} key={index}>
          <p>{message.userName}:</p>
          <p>{message.messageUser}</p>
        </div>
      ))}
    </div>
  );
};
