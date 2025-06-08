import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { UsersCollection } from '../db/models/user.model.js';
import { SessionsCollection } from '../db/models/session.model.js';
import {
  FIFTEEN_MINUTES,
  ONE_DAY,
  SMTP,
  TEMPLATES_DIR,
} from '../constants/index.js';
import { getEnvVar } from '../utils/getEnvVar.js';
import { sendEmail } from '../utils/sendmail.js';
import path from 'path';
import fs from 'node:fs/promises';
import handlebars from 'handlebars';
import {
  getFullNameFromGoogleTokenPayload,
  validateCode,
} from '../utils/googleOAuth2.js';

export const registerUser = async (payload) => {
  const user = await UsersCollection.findOne({
    email: payload.email,
  });
  if (user) throw createHttpError(409, 'This email is already in use.');

  const encryptedPassword = await bcrypt.hash(payload.password, 10);

  return await UsersCollection.create({
    ...payload,
    password: encryptedPassword,
  });
};

export const loginUser = async (payload) => {
  const user = await UsersCollection.findOne({
    email: payload.email,
  });
  if (!user)
    throw createHttpError(404, `User with email ${payload.email} not found.`);

  const isEqual = await bcrypt.compare(payload.password, user.password);
  if (!isEqual)
    throw createHttpError(
      401,
      'Incorrect email or password, check it and try again.',
    );

  await SessionsCollection.deleteOne({ userId: user._id });

  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');

  return await SessionsCollection.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + ONE_DAY),
  });
};

export const logoutUser = async (sessionId) => {
  await SessionsCollection.deleteOne({ _id: sessionId });
};

const createSession = () => {
  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');

  return {
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + ONE_DAY),
  };
};

export const refreshUsersSession = async ({ sessionId, refreshToken }) => {
  const session = await SessionsCollection.findOne({
    _id: sessionId,
    refreshToken,
  });
  if (!session) throw createHttpError(401, 'Session not found');

  const isSessionTokenExpired =
    new Date() > new Date(session.refreshTokenValidUntil);
  if (isSessionTokenExpired)
    throw createHttpError(401, 'Session token expired');

  const newSession = createSession();
  await SessionsCollection.deleteOne({ _id: sessionId, refreshToken });

  return await SessionsCollection.create({
    userId: session.userId,
    ...newSession,
  });
};

export const requestResetToken = async (email) => {
  const user = await UsersCollection.findOne({ email });

  if (!user) throw createHttpError(404, 'User not found.');

  const resetToken = jwt.sign(
    {
      sub: user._id,
      email,
    },
    getEnvVar('JWT_SECRET'),
    {
      expiresIn: '15m',
    },
  );

  const resetPasswordTemplatePath = path.join(
    TEMPLATES_DIR,
    'reset-password-email.hbs',
  );

  const templateSource = (
    await fs.readFile(resetPasswordTemplatePath)
  ).toString();

  const template = handlebars.compile(templateSource);

  const html = template({
    name: user.name,
    link: `${getEnvVar('APP_DOMAIN')}/reset-password?token=${resetToken}`,
  });

  await sendEmail({
    from: getEnvVar(SMTP.SMTP_FROM),
    to: email,
    subject: 'Request for reset your password',
    html,
  });
};

export const resetPassword = async (payload) => {
  try {
    const entries = jwt.verify(payload.token, getEnvVar('JWT_SECRET'));

    const user = await UsersCollection.findOne({
      email: entries.email,
      _id: entries.sub,
    });

    if (!user) {
      throw createHttpError(404, 'User not found');
    }

    const isEqual = await bcrypt.compare(payload.password, user.password);
    if (isEqual) {
      throw createHttpError(
        400,
        'New password cannot be the same as the current password.',
      );
    }

    const encryptedPassword = await bcrypt.hash(payload.password, 10);

    await UsersCollection.findOneAndUpdate(
      { _id: user._id },
      { password: encryptedPassword },
    );
  } catch (err) {
    if (err.status) throw err;
    if (err instanceof Error) throw createHttpError(401, err.message);
    throw err;
  }
};

export const loginOrSignupWithGoogle = async (code) => {
  const loginTicket = await validateCode(code);
  const payload = loginTicket.getPayload();
  if (!payload) throw createHttpError(401, 'Unauthorized');

  let user = await UsersCollection.findOne({ email: payload.email });
  if (!user) {
    const password = await bcrypt.hash(randomBytes(10), 10);
    user = await UsersCollection.create({
      email: payload.email,
      name: getFullNameFromGoogleTokenPayload(payload),
      password,
      role: 'parent',
    });
  }

  const newSession = createSession();

  return await SessionsCollection.create({
    userId: user._id,
    ...newSession,
  });
};
