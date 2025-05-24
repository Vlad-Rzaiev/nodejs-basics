import { UsersCollection } from '../db/models/user.model.js';

export const registerUser = async (payload) => {
  return await UsersCollection.create(payload);
};
