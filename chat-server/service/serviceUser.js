import database from '../helpers/dbConnection.js';

const getUsers = async () => {
  const query = 'SELECT * FROM users';
  try {
    const [rows] = await database.promise().query(query);

    return rows;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

const findUserById = async userId => {
  const query = 'SELECT * FROM users WHERE id = ?';
  try {
    const [rows] = await database.promise().query(query, [userId]);

    if (rows.length === 0) {
      return null;
    }
    return rows[0];
  } catch (e) {
    console.log(e);
    throw e;
  }
};

const findUserByEmail = async email => {
  const query = 'SELECT * FROM users WHERE email = ?';
  try {
    const [results] = await database.promise().query(query, [email]);
    if (results.length === 0) return null;
    return results[0];
  } catch (e) {
    console.log(e);
    throw e;
  }
};

const updateUserToken = async (userId, token) => {
  const query = 'UPDATE users SET token = ? WHERE id = ?';
  try {
    const [results] = await database.promise().query(query, [token, userId]);

    if (results.affectedRows === 0) {
      return null;
    }
    return results[0];
  } catch (e) {
    console.log(e);
    throw e;
  }
};

const serviceUser = {
  findUserById,
  findUserByEmail,
  updateUserToken,
  getUsers,
};

export default serviceUser;
