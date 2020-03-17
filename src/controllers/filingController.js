import models, { sequelize } from '../models';
import moment from 'moment';

const {
  Jurisdiction,
  Company,
  CompanyJurisdiction,
  Agency,
  Filing,
  FilingField,
  FilingDueDate
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


const createFiling = async (req, res, next) => {
    const filing = req.body
    console.log('GOT FILING ON THE SERVER!')
    console.log(filing)

    const result = await Filing.create({
      name: filing.name,
      occurrence: filing.occurrence,
      agency_id: filing.agency_id,
    });

    await FilingDueDate.bulkCreate(filing.due_dates.map(f => {
      f.filing_id = result.id;
      return f
    }))

    await FilingField.bulkCreate(filing.fields.map(f => {
      f.filing_id = result.id;
      return f
    }))

    const newFiling = await Filing.findOne({
      where: { id: result.id },
      include: [{
        model: Agency,
        include: [{
          model: Jurisdiction
        }]
      }, {
        model: FilingField,
        as: 'fields'
      }, {
        model: FilingDueDate,
        as: 'due_dates'
      }]
    });

    return res.status(200).json(newFiling)
}


export {
  getFiling,
  getAllFilings,
  createFiling
}
