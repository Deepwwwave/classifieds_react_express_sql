import express from "express";
import mysql from "mysql2/promise"; // npm i mysl2;
import path from "path";
import { fileURLToPath } from "url";
import cors from 'cors';
import "dotenv/config";


const app = express();
const routes = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || process.env.SERVER_LOCAL_PORT;

const { HOSTNAME_DB, NAME_DB, USERNAME_DB, PASSWORD_DB } = process.env;

const pool = mysql.createPool({
  host: HOSTNAME_DB,
  database: NAME_DB,
  user: USERNAME_DB,
  password: PASSWORD_DB,
  waitForConnections: true,
  connectionLimit: 10000,
  queueLimit: 0,
});

app.use(express.static(path.join(__dirname + "/public")));
app.use(cors());
app.use(express.urlencoded({extended: true })); // for parsing application/x-www-form-urlencoded
app.use(express.json());
// app.use(fileUpload({createParentPath: true}));
app.use("/api/v1", routes);

pool.getConnection().then((res) => {
  console.log(`Bien connecté à la BDD --> ${res.config.database}!`);
});

// GET PRODUCT
routes.get("/product", async (req, res) => {
  const [result, fields] = await pool.execute(
    "SELECT * FROM user JOIN product ON product.id_user = user.id"
  );
  console.log(result);
});

// ADD PRODUCT
routes.post("/product/add", async (req, res) => {
  try {
    const result1 = await pool.execute(
      "INSERT INTO user (`alias`,`password`,`role`,`creation_timestamp`) VALUES (?,?,?,NOW())",
      [req.body.alias, req.body.password, req.body.role]
    );
    const result2 = await pool.execute(
      "INSERT INTO product (`title`,`description`, `image`,`creation_timestamp`,`type`, `id_user`,`id_category`) VALUES (?,?,?,NOW(),?,?,?)",
      [
        req.body.title,
        req.body.description,
        req.body.image,
        req.body.type,
        req.body.id_user,
        req.body.id_category,
      ]
    );
    console.log(result1, result2);
  } catch (err) {
    console.log(err);
  }
});

// DELETE
routes.post("/product/delete/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const result = await pool.execute("DELETE FROM product WHERE id = ?", [id]);
    console.log(result);
    console.log(id);
  } catch (err) {
    console.log(err);
  }
});

// UPDATE
routes.put("/product/update/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const result = await pool.execute(
      "UPDATE product SET id = ? , title = ?, description = ?, image = ?, creation_timestamp = NOW(), type = ?, id_user=?, id_category = ? WHERE id = ?",
      [
        id,
        req.body.title,
        req.body.description,
        req.body.image,
        req.body.type,
        req.body.id_user,
        req.body.id_category,
        id
      ]
    );
    console.log(result);
  } catch (err) {
    console.log(err);
  }
});

// ADD IMAGE

// routes.post('/product/addImage', async (req, res) => {
//   req.files.image.mv(`public/images/${req.files.image.name}`);
//   console.log('Loaded image ! ^^')
// })



app.listen(PORT, () => {
  console.log(`Listening at http://localhost:${PORT}`);
});
