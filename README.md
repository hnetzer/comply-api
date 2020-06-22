# Comply API
API to support Comply Hub and Comply Admin portal

### Dependencies
- Postgres
- Node (10.x)

### Environment vars
```
PORT=8080
DATABASE=comply
DATABASE_USER=henry
```

### Database setup & seed data
```
sequelize db:migrate
sequelize db:seed:all
```

### Install & start
```
npm install
npm start
```

### Test accounts

User
- test_a@corp.com / test
- test_b@corp.com / test
- test_c@corp.com / test

Admin
- admin@comply.co / test

### Creating Admin accounts
```
npm run create-admin [first_name] [last_name] [email] [password]
```
