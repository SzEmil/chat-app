import { useState, useEffect, useRef } from 'react';
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
  created_at: string;
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

  const lastMessageRef = useRef<HTMLLIElement>(null);

  const cutDate = (date: string | null | undefined) => {
    const year = date!.slice(0, 10);
    const time = date!.slice(11, 16);

    return `${year}  ${time}`;
  };

  useEffect(() => {
    if (lastMessageRef.current) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            console.log('widze wiadomość');
            socket.emit('newMessageChecked', chat!.id, user.id);
          }
        });
      });

      observer.observe(lastMessageRef.current);

      return () => {
        observer.disconnect();
      };
    }
  }, [messagesArr]);

  useEffect(() => {
    socket.emit('getChatMessages', chat!.id);
  }, [chat]);

  useEffect(() => {
    socket.on('message', (message: messageType) => {
      setMessagesArr(prevValue => [...prevValue, message]);
    });

    socket.on('getChatMessages', async (data: any) => {
      setMessagesArr(data);
    });

    socket.on('endChat', async () => {
      setMessagesArr([]);
    });
  }, []);

  const handleSubmit = (event: any) => {
    event.preventDefault();

    if (messageUser.trim() !== '') {
      const roomName = chat!.id;
      const chatMembers = chat?.members;
      socket.emit(
        'message',
        {
          chatId: chat?.id,
          owner: user!.id,
          messageUser,
          userName: userName,
        },
        roomName,
        chatMembers
      );
      setMessageUser('');
    }
  };

  return (
    <div className={css.chat} key={chat!.id}>
      <div className={css.chatMessageWrapper}>
        <div className={css.chatNav}>
          {chat!.name !== '' ? (
            <p>{chat!.name}</p>
          ) : (
            <ul className={css.chatUsers}>
              {chat?.members.map((member, index) => (
                <li key={index}>{member.userName}</li>
              ))}
            </ul>
          )}
        </div>
        {chat!.id !== null && (
          <>
            {messagesArr.length === 0 && chat!.id ? (
              <p>Say hello</p>
            ) : (
              <ul className={css.messageList}>
                {messagesArr.map((message, index) => (
                  <li
                    className={`${css.messageBox}`}
                    key={index}
                    ref={
                      index === messagesArr.length - 1 ? lastMessageRef : null
                    }
                  >
                    <div className={css.messageWrapper}>
                      <div className={css.message}>
                        <p>{message.userName}</p>
                        <p className={css.messageText}>{message.messageUser}</p>
                      </div>
                      <p>{cutDate(message.created_at)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
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
