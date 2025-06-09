const Response = require('../utils/response.helper');
const { TechnologyResource,TechnologyListResource } = require('../resources/technology.resource');
const technologyService = require('../services/technology.service');

const createTechnology = async (req, res) => {
  try {
    const techData = req.body;
    const result = await technologyService.createTechnology(techData);

    return Response.created(res, result.message, TechnologyResource(result.data));
  } catch (error) {
    return Response.error(res, error.message, error.statusCode || 500);
  }
};

const getTechnologies = async (req, res) => {
  try {
    const technologies = await technologyService.getAllTechnologies();
    return Response.success(
      res,
      'Technologies retrieved successfully',
      TechnologyListResource(technologies)
    );
  } catch (error) {
    console.log(error.message);
    return Response.error(res, 'Error in retrving technologies.', error.statusCode || 500);
  }
};

module.exports = {
  createTechnology, getTechnologies,
};
