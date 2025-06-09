exports.TechnologyResource = (technology) => ({
  id: technology._id,
  name: technology.name,
  isActive: technology.isActive,
});
exports.TechnologyListResource = (technologies) => {
  return technologies.map((technology) => ({
    id: technology._id,
    name: technology.name,
    isActive: technology.isActive,
  }));
};
