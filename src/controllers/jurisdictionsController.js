import models, { sequelize } from '../models';

const {
  Jurisdiction
} = models;


const getJurisdictions = async (req, res, next) => {
    const jurisdictions = await Jurisdiction.findAll({ raw: true });
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


export {
  getJurisdictions,
  createJurisdiction
}