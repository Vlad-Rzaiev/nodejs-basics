import { SORT_ORDER } from '../constants/index.js';
import { StudentCollection } from '../db/models/student.model.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';

export const getAllStudents = async ({
  page = 1,
  perPage = 10,
  sortOrder = SORT_ORDER.ASC,
  sortBy = '_id',
  filter = {},
}) => {
  const limit = perPage;
  const skip = (page - 1) * perPage;

  const studentsQuery = StudentCollection.find();

  if (filter.gender) {
    studentsQuery.where('gender').equals(filter.gender);
  }
  if (filter.maxAge) {
    studentsQuery.where('age').lte(filter.maxAge);
  }
  if (filter.minAge) {
    studentsQuery.where('age').gte(filter.minAge);
  }
  if (filter.maxAvgMark) {
    studentsQuery.where('avgMark').lte(filter.maxAvgMark);
  }
  if (filter.minAvgMark) {
    studentsQuery.where('avgMark').gte(filter.minAvgMark);
  }

  // const studentsCount = await StudentCollection.find()
  //   .merge(studentsQuery)
  //   .countDocuments();

  // const students = await studentsQuery
  //   .skip(skip)
  //   .limit(limit)
  //   .sort({ [sortBy]: sortOrder })
  //   .exec();

  const [studentsCount, students] = await Promise.all([
    StudentCollection.find().merge(studentsQuery).countDocuments(),
    studentsQuery
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortOrder })
      .exec(),
  ]);

  const paginationData = calculatePaginationData(studentsCount, perPage, page);

  return {
    data: students,
    ...paginationData,
  };
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
