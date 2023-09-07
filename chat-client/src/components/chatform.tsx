import { useState, useEffect } from 'react';
import css from 
type messageType = {
  messageUser: string;
  userName: string;
};

type chatProps = {
  socket: any;
  userName: string;
  userId: string;
};

export const chatform = ({ socket, userName, userId }: chatProps) => {
  const [messagesArr, setMessagesArr] = useState<messageType[]>([]);
  const [messageUser, setMessageUser] = useState('');

  useEffect(() => {
    socket.on('message', (message: messageType) => {
      setMessagesArr(prevValue => [...prevValue, message]);
    });
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

  return (
    <div>
      chat
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
