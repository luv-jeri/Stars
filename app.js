const fs = require('fs');
const express = require('express');
const app = express();
app.use(express.json()); // to parse json

app.get('/', (req, res) => {
  fs.readFile('./database.json', 'utf8', (err, data) => {
    data = JSON.parse(data);
    res.send(data);
  });
});

app.post('/', (req, res) => {
  const { body } = req; //` user send  body

  const { name, email, code, person } = body; // destructuring for the safe side
  if (!name || !email || !code || !person) {
    res.status(400).json({
      status: 'error',
      message: 'Please provide all the fields i.e name, email, code, person',
    });
    return;
  }

  fs.readFile('./database.json', 'utf8', (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).json({
        status: 'error',
        message: 'Internal Server Error',
      });
    }

    data = JSON.parse(data); //` current data in database.json -> []

    const unique = data.find((item) => item.name === name);

    if (unique) {
      res.status(400).json({
        status: 'error',
        message: 'Name already exists',
      });
    }

    const newStar = { name, email, code, person };

    data.push(newStar);

    data = JSON.stringify(data);
    //* Make a custom function to write the data to the file
    fs.writeFile('./database.json', data, 'utf8', () => {
      res.status(201).json({
        status: 'success',
        message: `${body.name} added successfully`,
      });
    });
  });
});

app.patch('/', (req, res) => {
  const { to_update } = req.query; // name of the start to update

  fs.readFile('./database.json', 'utf8', (err, data) => {
    if (err) {
      _(err);
      res.status(500).json({
        status: 'error',
        message: 'Internal Server Error',
      });
    }

    data = JSON.parse(data); // ` data -> []

    const index = data.findIndex((item) => item.name === to_update); // find the index of the item to update

    if (index === -1) {
      res.status(400).json({
        status: 'error',
        message: `Star with name - ${to_update} not found`,
      });

      return;
    }

    if (data[index].code !== req.query.code) {
      res.status(400).json({
        status: 'error',
        message: `Code not matched`,
      });

      return;
    }

    const { name, email, code, person } = req.body; // destructuring for the safe side

    // creating a object to update
    const updatedStar = {
      name: name || data[index].name,
      email: email || data[index].email,
      code: code || data[index].code,
      person: person || data[index].person,
    };

    data[index] = updatedStar; // actual update

    data = JSON.stringify(data);

    fs.writeFile('./database.json', data, 'utf8', () => {
      res.status(200).json({
        status: 'success',
        message: `${to_update}  updated successfully`,
      });
    });
  });
});

app.delete('/', (req, res) => {
  const { to_delete } = req.query; // name of the start to delete
  console.log('to_delete', to_delete);
  fs.readFile('./database.json', 'utf8', (err, data) => {
    data = JSON.parse(data); // ` data -> []

    const index = data.findIndex((item) => item.name === to_delete); // find the index of the item to delete

    if (index === -1) {
      res.status(400).json({
        status: 'error',
        message: `Star with name - ${to_delete} not found`,
      });

      return;
    }

    if (data[index].code !== req.query.code) {
      res.status(400).json({
        status: 'error',
        message: `Code not matched`,
      });

      return;
    }

    data.splice(index, 1); // actual delete

    data = JSON.stringify(data);

    fs.writeFile('./database.json', data, 'utf8', () => {
      res.status(200).json({
        status: 'success',
        message: `${to_delete} deleted successfully`,
      });
    });
  });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
