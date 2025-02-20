const { request, response } = require("express")
const { getRepository, Like } = require("typeorm");
const { Cargo } = require("../entity/cargo");
const { Departamento } = require("../entity/departamento");
const { Empleado } = require("../entity/empleado");
const { Empresa } = require("../entity/empresa");
const { Localidad } = require("../entity/localidad");
const { User } = require("../entity/user");
var nodemailer = require('nodemailer');

const getEmpleadosXEmpresa = async (req = request, res = response) => {
    try {
        const empleados = await getRepository(Empleado).find({ relations: ["cargo", "user", "empresa"], where: { empresa: req.params.empresa } });
        const empleadosComplete = await Promise.all(empleados.map(async e => {
            const locUser = await getRepository(User).findOne({ relations: ["localidad", "rol"], where: { id: e?.user?.id } })
            const localidad = await getRepository(Localidad).findOne({ relations: ["departamento"], where: { id: locUser?.localidad?.id } })
            return {
                ...e,
                user: { ...e.user, rol: locUser.rol },
                localidad
            }

        }))
        return res.json({
            ok: true,
            empleados: empleadosComplete
        })
    } catch (error) {
        console.log(error)
        res.json({ ok: false, msg: "Consulte con el desarrollador hermoso" })
    }
}
const insertEmpleado = async (req = request, res = response) => {
    try {
        const empresa = await getRepository(Empresa).findOne(req.body.empresa);
        const cargo = await getRepository(Cargo).findOne(req.body.cargo);
        const user = await getRepository(User).findOne(req.body.user);

        if (!user || !cargo || !empresa) {
            return res.json({
                ok: false,
                msg: "Empresa,cargo o usuario incorrecto"
            })
        }

        const empleado = await getRepository(Empleado).create(req.body);
        const resultado = await getRepository(Empleado).save(empleado);
        return (resultado) ?
            res.json({
                ok: true,
                msg: "Empleado añadido Correctamente a esta empresa"
            })
            :
            res.json({
                ok: false,
                msg: "No se pudo añadir su empleado a esta empresa"
            })

    } catch (error) {
        console.log(error)
        res.json({ ok: false, msg: "Consulte con el desarrollador hermoso" })
    }
}


const crearEmpleadoNuevo = async (req = request, res = response) => {
    try {
        console.log(req.body)
        const empresa = await getRepository(Empresa).findOne(req.body.empresa);
        const cargo = await getRepository(Cargo).findOne(req.body.cargo);
        const locality = await getRepository(Localidad).findOne(req.body.localidad);
        const userEmail = await getRepository(User).findOne({ email: req.body.email });
        if (userEmail) {
            return res.json({
                ok: false,
                msg: "El email ya existe"
            })
        }

        const Newuser = await getRepository(User).create({ ...req.body });
        const NewUserCreated = await getRepository(User).save(Newuser);

        if (!NewUserCreated || !cargo || !empresa || !locality) {
            return res.json({
                ok: false,
                msg: "Empresa,cargo o usuario incorrecto",

            })
        }
        const empleado = await getRepository(Empleado).create({ cargo: req.body.cargo, empresa: req.body.empresa, user: Newuser.id, estado: true });
        const resultado = await getRepository(Empleado).save(empleado);

        var transporter = nodemailer.createTransport({
            service: 'Gmail',
            host: 'smtp.gmail.com',
            port: 587,
            auth: {
                user: 'maximiliano.olivera@atticalabs.com',
                pass: 'olivermanmaxi'
            }
        });

        var mailOptions = {
            from: 'Remitente',
            to: req.body.email,
            html: `<div style="border-radius: 10px; color: white; width: 60%; margin: auto; max-width:100%;background: rgba(255, 255, 255, 0.585); border: solid 1px rgb(128, 128, 128); text-align: center;  font-family: sans-serif;">
        <div
            style="border-radius: 10px 10px 0 0; font-family: verdana;width: 100%; background: #3bc54b; display: flex;flex-direction: row;justify-content: center;">
            <h1 style="font-size: 20px;">¡Tu registro quedo correctamente!</h1>
        </div>
        <p style="border-radius: 5px 5px 0px 0px; border: solid 1px #3cb12f; padding: 10px;font-size: 17px; color: rgb(0, 0, 0);font-weight: 700;  padding: 20px 40px; background-color: #3bc54b; display: inline-flex;">Confirmacion Correo Electronico</p>
        <div >
            <img src="data:image/png;base64,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" alt="">
        </div>
        <div style="width: 60%;  padding: 10px;font-size: 17px; color: rgb(0, 0, 0);font-weight: 700; padding: 20px 40px; background-color: #3bc54b; display: inline-block; text-align: left;">
                ¡Recuerda no pasarle a nadie los siguientes datos!  <br/><br/><br/>
                Correo: ${req.body.email}  <br/><br/>
                Contraseña:${req.body.password} <br/>
        </div>
        <div style="padding: 10px;width: 100%;color: rgb(0, 0, 0);">
            Ya estas registrado en nuestra AppSocios <br/>
            Gracias por registrarte en nuestra AppSocio <br/>
            Contacto: info@ccisanjose.com.uy
        </div>
    </div>`

        };

        transporter.sendMail(mailOptions, function (error, info) {
            console.log(info)
            if (error) {
                console.log(error);
                return res.status(500).json({ error: error.message });
            } else {
                console.log("Email enviado");
                return res.status(500).json({ ok: true, msg: "Correo Enviado" });
            }
        });


        //send email
        return (resultado) ?
            res.json({
                ok: true,
                msg: "Empleado añadido Correctamente a esta empresa"
            })
            :
            res.json({
                ok: true,
                msg: "No se pudo añadir su empleado a esta empresa"
            })

    } catch (error) {
        console.log(error)
        res.json({ ok: false, msg: "Consulte con el desarrollador hermoso" })
    }
}

// router.post("/:text", searchUser);


const allowEmployed = async (req = request, res = response) => {
    try {
        const empresa = await getRepository(Empresa).findOne(req.body.empresa);
        const cargo = await getRepository(Cargo).findOne(req.body.cargo);
        const user = await getRepository(User).findOne(req.body.user);

        if (!user || !cargo || !empresa) {
            return res.json({
                ok: false,
                msg: "Empresa,cargo o usuario incorrecto"
            })
        }
        else {
            await getRepository(Empleado).update({ user: req.body.user, empresa: req.body.empresa, cargo: req.body.cargo }, { ...req.body, estado: true });
            return res.json({ ok: true, msg: "Empleado añadido a la empresa" })
        }
    } catch (error) {
        console.log(error)
    }
}


const searchEmpleado = async (req = request, res = response) => {
    const { text, empresa } = req.body;
    try {
        const usuarios = await getRepository(User).find({ relations: ["rol", "localidad"], where: [{ name: Like(`%${text}%`) }, { email: Like(`%${text}%`) }, { last_name: Like(`%${text}%`) }, { rol: Like(`%${text}%`) }, { localidad: Like(`%${text}%`) }] })
        const empleadosFIlter = Promise.all(usuarios.map(async e => {
            console.log(e)
            const empleado = await getRepository(Empleado).findOne({ where: { user: e.id, empresa: empresa }, relations: ["user", "cargo", "empresa"] })
            return (empleado) ? { empleado, rol: e.rol, localidad: e.localidad } : null
        }))
        const empleados = await (await empleadosFIlter).filter(e => e != null);
        res.json({ ok: true, empleados })
    } catch (error) {
        console.log(error);
        return res.json({ ok: false, msg: "Contacte con el desarrollador" })
    }

}


const deleetEmpleado = async (req = request, res = response) => {
    try {
        const empresaRubro = await getRepository(Empleado).createQueryBuilder()
            .delete()
            .where("user = :id and empresa= :id2 and cargo = :id3", { id: req.body.user, id2: req.body.empresa, id3: req.body.cargo })
            .execute();
        res.json({
            ok: true,
            msg: "Empleado eliminado correctamente"
        })
    } catch (error) {
        console.log(error)
        res.json({ ok: false, msg: "Consulte con el desarrollador hermoso" })
    }
}


const getEmpleadoSolicitudes = async (req = request, res = response) => {
    try {
        const empleos = await getRepository(Empleado).find({ relations: ["empresa"], where: { user: req.params.user } })
        return res.json({
            ok: true,
            empleos
        })
    } catch (error) {
        console.log(error)
        res.json({ ok: false, msg: "Consulte con el desarrollador hermoso" })
    }
}

const upadteEmpleado = async (req = request, res = response) => {
    try {
        const usuario = await getRepository(User).findOne({ where: { id: req.body.user }, relations: ["rol", "localidad"] });
        if (!usuario) {
            return res.json({
                ok: false,
                msg: "No existe el usuario que desea editar"
            })
        } else {
            await getRepository(Empleado).update({ user: req.body.user, cargo: req.body.cargo, empresa: req.body.empresa }, { ...req.body });

            const newUser = await getRepository(User).findOne({ where: { id: req.params.id }, relations: ["rol", "localidad"] });

            return res.json({ ok: true, newUser })
        }
    } catch (error) {
        console.log(error)
        return res.json({ ok: false, msg: "Contacte con el desarrollador" })
    }
}

module.exports = {
    getEmpleadosXEmpresa,
    insertEmpleado,
    deleetEmpleado,
    crearEmpleadoNuevo,
    getEmpleadoSolicitudes,
    allowEmployed,
    searchEmpleado,
    upadteEmpleado
}
