const { request, response } = require("express")
const { User } = require("../entity/user")
const { Localidad } = require("../entity/localidad")
const { getRepository, Like } = require("typeorm");
const { Departamento } = require("../entity/departamento");


const getDepartamento = async (req = request, res = response) => {
    try {

        const departamentos = await getRepository(Departamento).find();
        return res.json({
            ok: true,
            departamentos
        })

    } catch (error) {
        console.log(error)
        res.json({ ok: false, msg: "Consulte con el desarrollador hermoso" })
    }
}
const insertDepartamento = async (req = request, res = response) => {
    try {
        const departamento = await getRepository(Departamento).create(req.body)
        const resultado = await getRepository(Departamento).save(departamento);
        return (resultado.id) ?
            res.json({
                ok: true,
                msg: "Departamento añadido Correctamente"
            })
            :
            res.json({
                ok: true,
                msg: "No se pudo añadir su Departamento"
            })

    } catch (error) {
        console.log(error)
        res.json({ ok: false, msg: "Consulte con el desarrollador hermoso" })
    }
}
const updateDepartamento = async (req = request, res = response) => {
    try {
        res.json({
            ok: true
        })
    } catch (error) {
        console.log(error)
        res.json({ ok: false, msg: "Consulte con el desarrollador hermoso" });

    }
}
const deleteDepartamento = async (req = request, res = response) => {
    try {
        const departamento = await getRepository(Departamento).delete(req.params.id);
        res.json({
            ok: true,
            msg: "Departamento eliminado correctamente"
        })
    } catch (error) {
        console.log(error)
        res.json({ ok: false, msg: "Consulte con el desarrollador hermoso" })
    }
}


module.exports = {
    getDepartamento,
    insertDepartamento,
    updateDepartamento,
    deleteDepartamento,
}
