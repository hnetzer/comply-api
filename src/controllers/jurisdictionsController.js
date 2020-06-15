import models, { sequelize } from '../models';

const {
  Jurisdiction,
  Agency
} = models;


const getJurisdictions = async (req, res, next) => {
    const jurisdictions = await Jurisdiction.findAll({
      include: [{
        model: Agency,
        where: { disabled: false }
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

const deleteJurisdiction = async (req, res, next) => {
  const jurisdictionId = req.params.jurisdictionId
  const jurisdiction = await Jurisdiction.findOne({
    where: { id: jurisdictionId },
    include: [{
      model: Agency,
      where: { disabled: false}
    }]
  });


  if(jurisdiction.dataValues.agencies.length > 0) {
    return res.status(403).json({ message: "You cannot delete an jurisdiction with agencies"})
  }

  await Jurisdiction.update({
    disabled: true
  }, {
    where: { id: agencyId }
  });

  return res.status(200).send()
}


export {
  getJurisdictions,
  createJurisdiction,
  updateJurisdiction,
  deleteJurisdiction
}
