import { Op } from 'sequelize';
import moment from 'moment';
import models, { sequelize } from '../models';


const getCompanyJurisdictions = async (req, res, next) => {
  const companyId = req.params.companyId;
  if (req.user.company_id != companyId) {
    return res.status(401).send()
  }

  const { Jurisdiction, CompanyJurisdiction } = models;

  try {
    const companyJurisdictions = await Jurisdiction.findAll({
      include: [{
        model: models.Company,
        required: true,
        where: { id: companyId  }
      }, {
        model: models.Agency
      }]
    })

   return res.status(200).json(companyJurisdictions)
 } catch(err) {
   console.log(err)
   return res.status(500).send()
 }
}


export {
  getCompanyJurisdictions
}
