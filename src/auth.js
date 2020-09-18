
const userCanAccessCompany = (user, companyId) => {
  const id = parseInt(companyId)
  const userCompanyIds = user.companies.map(c => c.id)
  return userCompanyIds.indexOf(id) > -1;
}

export {
  userCanAccessCompany
}
