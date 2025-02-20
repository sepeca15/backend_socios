const { request, response } = require("express")
const { User } = require("../entity/user")
const { Localidad } = require("../entity/localidad")
const { getRepository, Like } = require("typeorm");
const { RubroA } = require("../entity/rubro_actividad");


const getRubroA = async (req = request, res = response) => {
    try {

        const rubrosA = await getRepository(RubroA).find();
        return res.json({
            ok: true,
            rubros: rubrosA
        })

    } catch (error) {
        console.log(error)
        res.json({ ok: false, msg: "Consulte con el desarrollador hermoso" })
    }
}
const insertRubroA = async (req = request, res = response) => {
    try {
        const rubroA = await getRepository(RubroA).create(req.body)
        const resultado = await getRepository(RubroA).save(rubroA);
        return (resultado.id) ?
            res.json({
                ok: true,
                msg: "Rubro añadido Correctamente"
            })
            :
            res.json({
                ok: true,
                msg: "No se pudo añadir su Rubro"
            })

    } catch (error) {
        console.log(error)
        res.json({ ok: false, msg: "Consulte con el desarrollador hermoso" })
    }
}
const updateRubroA = async (req = request, res = response) => {
    try {
        res.json({
            ok: true
        })
    } catch (error) {
        console.log(error)
        res.json({ ok: false, msg: "Consulte con el desarrollador hermoso" });

    }
}
const deleteRubroA = async (req = request, res = response) => {
    try {
        const empresaRubro = await getRepository(Empleado).createQueryBuilder()
            .delete()
            .where("empresa = :id and rubroA= :id2 ", { id: req.body.empresa, id2: req.body.rubroA })
            .execute();
        res.json({
            ok: true,
            msg: "Empleado eliminado correctamente"
        })
    } catch (error) {
        console.log(error)
        res.json({ ok: false, msg: "Consulte con el desarrollador hermoso" })
    }



    try {
        const rubroA = await getRepository(RubroA).delete(req.body.rubroA, req.body.empresa);
        res.json({
            ok: true,
            msg: "Rubro eliminado correctamente"
        })
    } catch (error) {
        console.log(error)
        res.json({ ok: false, msg: "Consulte con el desarrollador hermoso" })
    }
}


module.exports = {
    getRubroA,
    insertRubroA,
    updateRubroA,
    deleteRubroA,
}
