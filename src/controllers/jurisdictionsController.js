import models, { sequelize } from '../models';

const {
  Jurisdiction,
  Agency
} = models;


const getJurisdictions = async (req, res, next) => {
    const jurisdictions = await Jurisdiction.findAll({
      include: [{
        model: Agency
      }]
    });
    return res.status(200).json(jurisdictions)
}

const createJurisdiction = async (req, res, next) => {
    const { name, state, type } = req.body
    const jurisdiction = await Jurisdiction.create({
      name: name,
      state: state,
      type: type
    });
    return res.status(200).json(jurisdiction)
}

const updateJurisdiction = async (req, res, next) => {
  const jurisdictionId = req.params.jurisdictionId
  const { name, state, type } = req.body
  await Jurisdiction.update({
    name: name,
    state: state,
    type: type
  }, {
    where: { id: jurisdictionId }
  });

  const jurisdiction = await Jurisdiction.findOne({
    where: { id: jurisdictionId },
    raw: true
  });

  return res.status(200).json(jurisdiction)
}


export {
  getJurisdictions,
  createJurisdiction,
  updateJurisdiction
}
