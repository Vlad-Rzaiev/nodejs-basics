import { StudentCollection } from '../db/models/student.js';

export const getAllStudents = async () => {
  const students = await StudentCollection.find();

  return students;
};

export const getStudentById = async (studentId) => {
  const student = await StudentCollection.findById(studentId);

  return student;
};

export const createStudent = async (payload) => {
  const student = await StudentCollection.create(payload);

  return student;
};

export const deleteStudent = async (studentId) => {
  const student = await StudentCollection.findOneAndDelete({
    _id: studentId,
  });

  return student;
};

export const upsertStudent = async (studentId, payload, options = {}) => {
  const data = await StudentCollection.findOneAndUpdate(
    {
      _id: studentId,
    },
    payload,
    {
      new: true,
      includeResultMetadata: true,
      ...options,
    },
  );

  if (!data || !data.value) return null;

  return {
    student: data.value,
    isNew: Boolean(data?.lastErrorObject?.upserted),
  };
};
