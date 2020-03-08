import models, { sequelize } from '../models';
import { Op } from 'sequelize';

const {
  Company,
  CompanyJurisdiction,
  Jurisdiction,
  User,
  Office,
  Agency,
} = models;

// Gets agencies based on a company's jurisdictions
const getAgenciesForCompany = async (req, res, next) => {
  const companyId = req.query.companyId;

  try {
    const jIds = await CompanyJurisdiction.findAll({
      where: { companyId: companyId },
      raw: true,
    });

    const jurisdictionIds = jIds.reduce((acc, j) => {
      acc.push(j.jurisdictionId)
      return acc
    }, [])

    const agencies = await Agency.findAll({
      where: { jurisdiction_id: jurisdictionIds },
      raw: true
    });

    const jurisdictions = await Jurisdiction.findAll({
      raw: true
    });

    const jMap = jurisdictions.reduce((acc, j) => {
      acc[j.id] = j;
      return acc;
    }, {});

    const agenciesWithJurisdictions = agencies.map(a => {
      a.jurisdiction = jMap[a.jurisdiction_id]
      return a;
    })

    return res.status(200).json(agenciesWithJurisdictions)
  } catch (err) {
    console.log(err)
    return res.status(500).send()
  }
}

const getAgencies = async (req, res, next) => {
  const agencies = await Agency.findAll({
    include: {
      model: Jurisdiction
    }
  });

  return res.status(200).send(agencies)
}

const createAgency = async (req, res, next) => {
    const { name, jurisdiction_id } = req.body
    const result = await Agency.create({
      name: name,
      jurisdiction_id: jurisdiction_id
    });

    const agency = await Agency.findOne({
      where: { id: result.id },
      include: {
        model: Jurisdiction
      }
    });

    return res.status(200).json(agency)
}


export {
  getAgenciesForCompany,
  getAgencies,
  createAgency
}
