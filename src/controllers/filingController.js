import models, { sequelize } from '../models';
import moment from 'moment';

const {
  Jurisdiction,
  Company,
  CompanyJurisdiction,
  Agency,
  Filing,
  FilingField
} = models;

const getFiling = async (req, res, next) => {
  const filingId = req.params.filingId
  const filing = await Filing.findOne({
    where: { id: filingId },
    include: [{
      model: Agency,
      include: [{
        model: Jurisdiction
      }]
    }, {
      model: FilingField,
      as: 'fields'
    }]
  });

  return res.status(200).json(filing)
}

const getAllFilings = async (req, res, next) => {
  const filings = await Filing.findAll({
    include: [{
      model: Agency,
      include: [{
        model: Jurisdiction
      }]
    }, {
      model: FilingField,
      as: 'fields'
    }]
  })

  return res.status(200).json(filings)
}


export {
  getFiling,
  getAllFilings
}
