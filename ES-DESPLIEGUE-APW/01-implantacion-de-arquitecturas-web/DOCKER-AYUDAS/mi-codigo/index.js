/*
para poder ejecutar hay que hacer npm init, que creará el package.json. El package.json ayuda a controlar las dependencias
*/
import express from 'express'
import mongoose from 'mongoose'

const Animal = mongoose.model('Animal', 
    new mongoose.Schema({
    tipo: String,
    estado: String
}))

const app = express()

// -e MONGO_INITDB_ROOT_USERNAME=alumno
// -e MONGO_INITDB_ROOT_PASSWORD=contra
// se crea una base de datos nueva_bd

mongoose.connect('mongodb://alumno:contra@localhost:27017/nueva_bd?authSource=admin')

app.get('/', async (_req, res) => {
    console.log('listando')
    const animales = await Animal.find();
    return res.send(animales)
})

app.get('/crear', async (_req, res)=>{
    console.log('creando')
    await Animal.create(
        {
            tipo: 'Mono',
            estado: 'Feliz'
        }
    )
})

app.listen(3000, ()=> console.log('escuchando'))

//PARA PROBAR
/*
- npm init -y
- npm install para instalar las dependencias de package.json (también puedes instalarlas una a una especificando el nombre, se agregan al package.json)
- node index.js