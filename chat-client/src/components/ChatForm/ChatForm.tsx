import { useState, useEffect } from 'react';
import css from './ChatForm.module.css';
import { chatData } from '../chat';

type messageType = {
  messageUser: string;
  userName: string;
};

type chatProps = {
  socket: any;
  chat: chatData | null;
  userName: string | null | undefined;
};

export const Chatform = ({ socket, chat, userName }: chatProps) => {
  const [messagesArr, setMessagesArr] = useState<messageType[]>([]);
  const [messageUser, setMessageUser] = useState('');

  useEffect(() => {
    socket.on('message', (message: messageType) => {
      setMessagesArr(prevValue => [...prevValue, message]);
    });

    socket.on('endChat', async (data: any) => {
      setMessagesArr([]);
    });
  }, []);

  const handleSubmit = (event: any) => {
    event.preventDefault();

    if (messageUser.trim() !== '') {
      const roomName = chat!.id;
      socket.emit(
        'message',
        {
          messageUser,
          userName: userName,
        },
        roomName
      );
      setMessageUser('');
    }
  };
  const handleCloseChat = (chatId: string) => {
    socket.emit('endChat', chatId);
  };

  return (
    <div key={chat!.id}>
      <button onClick={() => handleCloseChat(chat!.id)}>Delete Chat</button>
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
