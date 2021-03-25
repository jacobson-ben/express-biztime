/** Routes about cats. */

const express = require("express");
const { NotFoundError, BadRequestError } = require("../expressError");

const router = new express.Router();
const db = require("../db");

/** GET / returns all companies */

router.get("/", async function(req, res, next) {
  const results = await db.query("SELECT code, name, description FROM companies")
  const companies = results.rows;
  return res.json({ companies });
});

/** GET / get information about one company */

router.get("/:code", async function(req, res, next) {
  const code = req.params.code;
  const results = await db.query(
    "SELECT code, name, description FROM companies WHERE id = $1", [code])
  const company = results.rows[0];

  if(!company) {
    throw new NotFoundError(`No matching company: ${code}`)
  }
  return res.json({ company })
});

/** POST / add a company to the database */

router.post("/", async function(req, res, next) {
  const results = await db.query(
    `INSERT INTO companies (name, description)
        VALUES ($1, $2)
        RETURNING code, name, despription`, [req.body.name, req.body.description])
  const company = results.rows[0];
  if(!company) {
    throw new NotFoundError(`Unable to add company: ${code}`)
  }
  return res.status(201).json({ company })
});

/** PUT / edit an existing company in the database */

router.put("/:code", async function(req, res, next) {
  // if ("code" in req.body) throw new BadRequestError("Not allowed"); // Ask instructors about this
  
  const code = req.params.code
  const results = await db.query(
    `UPDATE companies
        SET name=$1, description=$2
        WHERE code=$3
        RETURNING code, name, desription`, [req.body.name, req.body.description, code])
  const company = results.rows[0];

  if(!company) {
    throw new NotFoundError(`No matching company: ${code}`)
  }
  return res.json({ company })
});

/** DELETE / Deletes a company from the database */

router.delete("/:code", async function(req, res, next) {
  const code = req.params.code
  const results = await db.query(
    `DELETE FROM companies where code=$1`, [code])
  const company = results.rows[0];
  
  if(!company) {
    throw new NotFoundError(`No matching company: ${code}`)
  }
  return res.json({ status: `deleted` })
});


module.exports = router;






