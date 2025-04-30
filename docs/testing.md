# Testing
To run the tests you will need to configure a `.env.test` file at the root of the project.
You will need the dotenv library installed and on your path.
Create a psql database called: `invoice_generator_test`:
```
npm run test:migrate
```

Now you are ready to start testing:
```
npm test
```
