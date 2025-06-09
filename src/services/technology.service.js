const TechnologyModel = require('../models/TechnologyModel');

const AppError = require('../utils/appError.helper');

exports.createTechnology = async (techData) => {
  // Check if user already exists
  const techExist = await TechnologyModel.findOne({ name: techData.name });
  if (techExist) {
    throw new AppError('Tech already exists', 409);
  }

  // Destructure and normalize input
  const {
   name,
  } = techData;

 
  // Create user document
  const newTech = new TechnologyModel({
   name
  });

  // Save to DB
  const savedTech = await newTech.save();

  return { message: 'TechnologyModel created successfully', data: savedTech };
};

exports.getAllTechnologies = async () => {
  const technologies = await TechnologyModel.find();
  if (!technologies) {
    throw new AppError('No technologies found', 404);
  }
  return technologies;
};
