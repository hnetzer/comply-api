import models, { sequelize } from '../models';
import moment from 'moment';

const {
  Jurisdiction,
  Company,
  CompanyJurisdiction,
  Agency,
  Filing
} = models;

const getFiling = async (req, res, next) => {
  const filingId = req.params.filingId
  const filing = await Filing.findOne({
    where: { id: filingId },
    raw: true
  });

  const agency = await Agency.findOne({
    where: { id: filing.agency_id },
    raw: true
  });

  const jurisdiction = await Jurisdiction.findOne({
    where: { id: agency.jurisdiction_id },
    raw: true
  });

  filing.agency = agency;
  filing.jurisdiction = jurisdiction;

  return res.status(200).json(filing)
}

const getAllFilings = async (req, res, next) => {
  const filings = await Filing.findAll({
    include: [{
      model: Agency,
      include: [{
        model: Jurisdiction
      }]
    }]
  })

  return res.status(200).json(filings)
}


export {
  getFiling,
  getAllFilings
}
