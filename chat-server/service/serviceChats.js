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
    const [createdChat] = await database.promise().query(queryNewChat, [chatId]);

    return createdChat[0];
  } catch (e) {
    console.log(e);
    throw e;
  }
};

const getUserChats = async userId => {
  const query = `
      SELECT c.* 
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

const serviceChats = {
  createNewChat,
  getUserChats,
};

export default serviceChats;
