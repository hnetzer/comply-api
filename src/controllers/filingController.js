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
      agency_id: filing.agency_id,
    });


    const due_dates = filing.due_dates.map(f => ({ ...f, filing_id: result.id }))
    await FilingDueDate.bulkCreate(due_dates)

    const fields = filing.fields.map(f => ({ ...f, filing_id: result.id }))
    await FilingField.bulkCreate(fields)

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
        agency_id: filing.agency_id
      }, {
        where: { id: filingId }
      });

      // Delete all of the existing company due dates, we'll recreate them
      await FilingDueDate.destroy({ where: { filing_id: filingId } })

      // Recreate the new due dates
      const due_dates = filing.due_dates.map(d => ({ ...d, filing_id: filingId }))
      await FilingDueDate.bulkCreate(due_dates)

      //  Update the fields (it's important to maintain the field id!)
      const updatedFields = filing.fields
      for (let i=0; i < updatedFields.length; i++) {
        const field = updatedFields[i]
        const update = {
          name: field.name,
          helper_text: field.helper_text,
          type: field.type,
          order: field.order
        }
        if (field.id) {
          await FilingField.upsert({
            ...update,
            id: field.id,
            filing_id: filingId
          })
        } else {
          await FilingField.create({
            ...update,
            filing_id: filingId
          })
        }
      }

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
