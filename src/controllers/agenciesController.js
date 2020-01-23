import models, { sequelize } from '../models';

const {
  Company,
  CompanyJurisdiction,
  Jurisdiction,
  User,
  Office,
  Agency,
} = models;

// Gets agencies based on a company's jurisdictions
const getAgencies = async (req, res, next) => {
  const companyId = req.query.companyId;

  try {
    const jIds = await CompanyJurisdiction.findAll({
      attributes: ['jurisdictionId'],
      where: { companyId: companyId },
      raw: true,
    });

    const jurisdictionIds = jIds.reduce((acc, j) => {
      acc.push(j.jurisdictionId)
      return acc
    }, [])

    const agencies = await Agency.findAll({
      where: { jurisdiction_id: jurisdictionIds },
      include: [{
        model: Jurisdiction,
        attributes: ['name']
      }],
      raw: true
    });

    res.status(200).json(agencies)
  } catch (err) {
    // console.log(err)
    res.status(500).send()
  }
}

export {
  getAgencies
}
