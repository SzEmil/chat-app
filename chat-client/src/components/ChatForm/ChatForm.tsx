import { useState, useEffect } from 'react';
import css from './ChatForm.module.css';
import { chatData } from '../../pages/ChatPage/ChatPage';

type userType = {
  id: number | null | undefined;
  username: string | null;
  email: string | null;
};
type messageType = {
  messageUser: string;
  userName: string;
  owner: number;
};

type chatProps = {
  socket: any;
  chat: chatData | null;
  userName: string | null | undefined;
  user: userType;
};

export const Chatform = ({ socket, chat, userName, user }: chatProps) => {
  const [messagesArr, setMessagesArr] = useState<messageType[]>([]);
  const [messageUser, setMessageUser] = useState('');

  useEffect(() => {
    socket.on('message', (message: messageType) => {
      setMessagesArr(prevValue => [...prevValue, message]);
    });

    socket.on('endChat', async (data: any) => {
      console.log('konczymy czat');
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
          owner: user!.id,
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
    <div className={css.chat} key={chat!.id}>
      <div className={css.chatMessageWrapper}>
        <div className={css.chatNav}>
          <p>{chat!.name}</p>
          {chat!.id !== '' && (
            <button onClick={() => handleCloseChat(chat!.id)}>
              Delete Chat
            </button>
          )}
        </div>
        {messagesArr.length === 0 && chat!.id ? (
          <p>Say hello</p>
        ) : (
          <ul className={css.messageList}>
            {messagesArr.map((message, index) => (
              <li
                className={`${css.messageBox} ${
                  user.id !== message.owner && css.messageFromGuest
                }`}
                key={index}
              >
                <div className={css.messageWrapper}>
                  <p>{message.userName}</p>
                  <p className={css.messageText}>{message.messageUser}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <form onSubmit={handleSubmit} className={css.sendMessageForm}>
        <input
          className={css.sendMessageInput}
          name="userMessage"
          type="text"
          placeholder="Enter your message"
          value={messageUser}
          onChange={e => setMessageUser(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};
