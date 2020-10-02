import models, { sequelize } from '../models';
import moment from 'moment';
const {
  Jurisdiction,
  Agency,
  Company
} = models;


const getJurisdictions = async (req, res, next) => {
    const jurisdictions = await Jurisdiction.findAll({
      where: { disabled: false },
      include: [{
        model: Agency,
        where: { disabled: false },
        required: false
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
  const { name, state, type, llc_supported, corp_supported } = req.body

  const jurisdiction = await Jurisdiction.findOne({ where: { id: jurisdictionId } })

  if (!jurisdiction) {
    return res.status(404).json({ message: 'jurisdiction not found' })
  }

  if (!jurisdiction.llc_supported && llc_supported) {
    // Update all LLC agencies and filings that are in this jurisdiction
    await syncAllForSupportedJurisdiction(jurisdiction, 'LLC')
  }

  if (!jurisdiction.corp_supported && corp_supported) {
    // Update all Corp agencies and filings that are in this jurisdiction
    console.log(`Corps are now supported for ${jurisdiction.name}`)
    await syncAllForSupportedJurisdiction(jurisdiction, 'Corporation')
  }

  await jurisdiction.update({
    llc_supported: llc_supported,
    corp_supported: corp_supported
  })

  return res.status(200).json(jurisdiction)
}

const syncAllForSupportedJurisdiction = async (jurisdiction, type) => {
  console.log(`${type} are now supported for ${jurisdiction.name}`)
  const companies = await Company.findAllByJurisdictionType({
    jurisdictionId: jurisdiction.id,
    type: type
  })

  for (let i=0; i < companies.length; i++) {
    const company = companies[i];
    const companyAgencies = await company.syncAgencies(jurisdiction.id)

    for (let j=0; j < companyAgencies.length; j++) {
      const companyAgency = companyAgencies[j]

      // Create all of the company filings for 2020, 2021, 2022
      for (let y=2020; y <= 2022; y++) {
        const count = await companyAgency.syncFilings(y)
        console.log(`${count} filings created for company ${company.id}`)
      }
    }
  }
}



const deleteJurisdiction = async (req, res, next) => {
  const jurisdictionId = req.params.jurisdictionId
  const jurisdiction = await Jurisdiction.findOne({
    where: { id: jurisdictionId },
    include: [{
      model: Agency,
      where: { disabled: false },
      required: false
    }]
  });


  if(jurisdiction.dataValues.agencies.length > 0) {
    return res.status(403).json({ message: "You cannot delete an jurisdiction with agencies"})
  }

  await Jurisdiction.update({
    disabled: true
  }, {
    where: { id: jurisdictionId }
  });

  return res.status(200).send({ id: jurisdictionId })
}


export {
  getJurisdictions,
  createJurisdiction,
  updateJurisdiction,
  deleteJurisdiction
}
