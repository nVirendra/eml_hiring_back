exports.UserResource = (user) => ({
  id: user._id,
  fullName: user.fullName,
  email: user.email,
});
exports.UserListResource = (users) => {
  return users.map((user) => ({
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  }));
};
