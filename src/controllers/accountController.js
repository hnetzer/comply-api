import models, { sequelize } from '../models';

const {
  Company,
  User
} = models;

const createAccount = async (req, res) => {
  console.log('In the create account endpoint...')
  console.log('Got body:', req.body);

  const body = req.body

  // TODO: Add validation here
  const user = await User.create({
    name: body.user.name,
    title: body.user.role,
    email: body.user.email,
    password: body.user.password,
  }, { raw: true })

  console.log(user)

  res.json(user);
}

export {
  createAccount
}
