import bcrypt from 'bcrypt';
import database from '../../helpers/dbConnection.js';

const User = {
  createUser: async (username, email, password) => {
    try {
      const hash = await bcrypt.hash(password, 10);
      const query =
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
      const [results] = await database
        .promise()
        .query(query, [username, email, hash]);
      return results.insertId;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  validatePassword: async (user, password) => {
    try {
      const isValid = await bcrypt.compare(password, user.password);
      return isValid;
    } catch (error) {
      throw error;
    }
  },
};

export default User;
