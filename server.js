const express = require('express');
const cors = require('cors');
const knex = require('knex');
const bcrypt = require('bcrypt-nodejs');

const db = knex({
    client: 'pg',
    connection: {
        connectionString: 'postgres://smartbraindb_tyjw_user:fjHi3JQSzGucGVyPlKB5Po7rHQYUSlsv@dpg-cgjia8u4dadak461gbug-a/smartbraindb_tyjw',
        ssl: { rejeectUnauthorized: false },
        host: 'dpg-cgjia8u4dadak461gbug-a',
        port: 5432,
        user: 'smartbraindb_tyjw_user',
        password: 'fjHi3JQSzGucGVyPlKB5Po7rHQYUSlsv',
        database: 'smartbraindb_tyjw'
    }
});


const app = express();
app.use(cors())
app.use(express.json());

app.get('/', (req, res) => {
    res.json('success');
})

//post user sign in
app.post('/signin', (req, res) => {
    const { email, name, password } = req.body;
    
    if (!email || !name || !password) {
        return res.status(400).json('incorrect form submission');
    }
    const hash = bcrypt.hashSync(password);
    db.transaction(trx => {
        trx.insert({
            hash: hash,
            email: email
        })
            .into('login')
            .returning('email')
            .then(loginEmail => {
                return trx('users')
                    .returning('*')
                    .insert({
                        email: loginEmail[0].email,
                        name: name,
                        joined: new Date()
                    })
                    .then(user => {
                        res.json(user[0]);
                    })
            })
            .then(trx.commit)
            .catch(trx.rollback)
    })
        .catch(err => res.status(400).json('unable to register'))
})

//update entries count
app.put('/image', (req, res) => {
    const { id } = req.body;
    db('users').where('id', '=', id)
        .increment('entries', 1)
        .returning('entries')
        .then(entries => {
            res.json(entries[0].entries)
        })
        .catch(err => res.status(400).json('unable to get entries'))
})

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`app is working ON ${port}`);
})

