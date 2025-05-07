import { StudentCollection } from '../db/models/student.js';

export const getAllStudents = async () => {
  const students = await StudentCollection.find();

  return students;
};

export const getStudentById = async (studentId) => {
  const student = await StudentCollection.findById(studentId);

  return student;
};
