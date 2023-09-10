import database from '../helpers/dbConnection.js';

const createNewChat = async (chatName, clients, owner) => {
  const clientsJson = JSON.stringify(clients);
  const query = 'INSERT INTO chats (chatName, clients, owner) VALUES (?, ?, ?)';
  try {
    const [rows] = await database
      .promise()
      .query(query, [chatName, clientsJson, owner]);

    const chatId = rows.insertId;

    for (const client of clients) {
      const { id: userId } = client;
      const addUserToChatQuery =
        'INSERT INTO user_chat (user_id, chat_id) VALUES (?, ?)';
      await database.promise().query(addUserToChatQuery, [userId, chatId]);
    }

    const queryNewChat = 'SELECT * FROM chats WHERE id = ?';
    const [createdChat] = await database
      .promise()
      .query(queryNewChat, [chatId]);

    return createdChat[0];
  } catch (e) {
    console.log(e);
    throw e;
  }
};

const getUserChats = async userId => {
  const query = `
      SELECT c.*, uc.newMessage
      FROM chats c
      JOIN user_chat uc ON c.id = uc.chat_id
      WHERE uc.user_id = ?;
    `;

  try {
    const [rows] = await database.promise().query(query, [userId]);

    return rows;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

const createMessage = async (chatId, owner, messageUser, userName) => {
  const query =
    'INSERT INTO messages (owner, messageUser, userName, chat_id) VALUES (?, ?, ?, ?)';
  const [rows] = await database
    .promise()
    .query(query, [owner, messageUser, userName, chatId]);

  const queryChatMessage = 'UPDATE chats SET lastMessage = ? WHERE id = ?';
  await database.promise().query(queryChatMessage, [messageUser, chatId]);

  const messageId = rows.insertId;

  const queryNewMessage = 'SELECT * FROM messages WHERE id = ?';
  const [createdMessage] = await database
    .promise()
    .query(queryNewMessage, [messageId]);

  return createdMessage[0];
};

const newMessageArrived = async (chatId, userId) => {
  const userIdNum = Number(userId);
  const newMessage = true;

  const query =
    'UPDATE user_chat SET newMessage = ? WHERE chat_id = ? AND user_id = ?';
  await database.promise().query(query, [newMessage, chatId, userIdNum]);

  const selectQuery =
    'SELECT newMessage FROM user_chat WHERE chat_id = ? AND user_id = ?';
  const [rows] = await database
    .promise()
    .query(selectQuery, [chatId, userIdNum]);


  return rows[0];
};

const newMessageChecked = async (chatId, userId) => {
  const userIdNum = Number(userId);
  const newMessage = false;
  const query =
    'UPDATE user_chat SET newMessage = ? WHERE id = ? AND user_id = ?';
  await database.promise().query(query, [newMessage, chatId, userIdNum]);

  const selectQuery =
    'SELECT newMessage FROM chat_user WHERE id = ? AND user_id = ?';
  const [rows] = await database
    .promise()
    .query(selectQuery, [chatId, userIdNum]);
  return rows[0];
};

const getChatMessages = async chatId => {
  const query = 'SELECT * FROM messages WHERE chat_id = ?';
  try {
    const [rows] = await database.promise().query(query, [chatId]);
    return rows;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const serviceChats = {
  createNewChat,
  getUserChats,
  createMessage,
  getChatMessages,
  newMessageArrived,
  newMessageChecked,
};

export default serviceChats;
