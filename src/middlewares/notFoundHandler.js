export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    status: 404,
    message: 'Requested resource could not be found. 😐',
  });
};
