exports.getHome = (req, res) => {
  res.status(200).json({
    success: true,
    message: "render to home page dear "
  });
};