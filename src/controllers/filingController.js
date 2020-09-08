import models, { sequelize } from '../models';
import moment from 'moment';
import { Op } from 'sequelize';

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
    }, {
      model: FilingDueDate,
      as: 'due_dates'
    }]
  });

  return res.status(200).json(filing)
}

const getAllFilings = async (req, res, next) => {
  const filings = await Filing.findAll({
    where: { disabled: false },
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
  })

  return res.status(200).json(filings)
}


const createFiling = async (req, res, next) => {
    const filing = req.body

    const result = await Filing.create({
      name: filing.name,
      occurrence: filing.occurrence,
      website: filing.website,
      description: filing.description,
      agency_id: filing.agency_id,
      for_corp: filing.for_corp,
      for_llc: filing.for_llc
    });

    const due_dates = filing.due_dates.map(f => ({ ...f, filing_id: result.id }))
    await FilingDueDate.bulkCreate(due_dates)

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

const updateFiling = async (req, res, next) => {
    const filingId = req.params.filingId
    const filing = req.body

    try {
      await Filing.update({
        name: filing.name,
        occurrence: filing.occurrence,
        website: filing.website,
        description: filing.description,
        agency_id: filing.agency_id,
        for_corp: filing.for_corp,
        for_llc: filing.for_llc
      }, {
        where: { id: filingId }
      });

      const dueDateIds = [];

      for (let i=0; i< filing.due_dates.length; i++) {
        const filingDueDate = filing.due_dates[i];
        const [record, created] = await FilingDueDate.upsert({
          id: filingDueDate.id,
          filing_id: filingId,
          offset_type: filingDueDate.offset_type,
          fixed_month: filingDueDate.fixed_month,
          fixed_day: filingDueDate.fixed_day,
          month_offset: filingDueDate.month_offset,
          day_offset: filingDueDate.day_offset,
          month_end: filingDueDate.month_end
        }, { returning: true });
        dueDateIds.push(record.id)
      }

      // Delete all of the other due dates for this filing
      await FilingDueDate.destroy({
        where: {
          filing_id: filingId,
          id: { [Op.notIn]: dueDateIds }
        }
      })
    } catch (err) {
      console.log(err)
      return res.status(500).send()
    }

    const updatedFiling = await Filing.findOne({
      where: { id: filingId },
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

    return res.status(200).json(updatedFiling)
}

const deleteFiling = async (req, res, next) => {
  const filingId = req.params.filingId
  try {
    await Filing.update({
      disabled: true
    }, {
      where: { id: filingId }
    });

    return res.status(200).send({})

  } catch(err) {
    console.log(err)
    return res.status(500).send()
  }
}

export {
  getFiling,
  getAllFilings,
  createFiling,
  updateFiling,
  deleteFiling
}
