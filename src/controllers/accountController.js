import models, { sequelize } from '../models';

const {
  Company,
  User
} = models;

const createAccount = async (req, res) => {
  // console.log('In the create account endpoint...')
  // console.log('Got body:', req.body);

  const user = req.body.user;
  const company = req.body.company;

  const comp = await Company.create({
    name: company.name,
    phone: company.phone
  });

  // TODO: Add validation here
  const u = await User.create({
    name: user.name,
    title: user.role,
    email: user.email,
    password: user.password,
    company_id: comp.id
  })

  res.json(u);
}

export {
  createAccount
}
