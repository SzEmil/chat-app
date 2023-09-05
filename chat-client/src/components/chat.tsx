import { useState, useEffect } from 'react';
import { socket } from '../App';

export const Chat = () => {
  const [messageUser, setMessageUser] = useState('');
  const [messagesArr, setMessagesArr] = useState([]);
  const [users, setUsers] = useState([]);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    socket.on('message', message => {
      console.log(`Received message from server: ${message}`);
      setMessagesArr(prevValue => [...prevValue, message]);
    });

    // socket.on('user', data => {
    //   console.log(data);
    //   setUsers(data);
    // });

    return () => {
      socket.off('message');
      socket.off('user');
    };
  }, []);

  const handleSubmit = event => {
    event.preventDefault();

    if (messageUser.trim() !== '') {
      socket.emit('message', {
        messageUser,
        userName,
      });
      setMessageUser('');
    }
  };

  return (
    <div>
      <h2>Users</h2>
      {/* {users.map((user, index) => (
        <p key={index}>{user}</p>
      ))} */}
      <form onSubmit={handleSubmit}>
        <input
          name="userName"
          type="text"
          placeholder="Enter your name"
          value={userName}
          onChange={e => setUserName(e.target.value)}
        />
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
        <div key={index}>
          <p>{message.userName}</p>
          <p>{message.messageUser}</p>
        </div>
      ))}
    </div>
  );
};
