exports.UserResource = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
});
exports.UserListResource = (users) => {
  return users.map((user) => ({
     id: user._id,
    name: user.name,
    email: user.email,
  }));
};
