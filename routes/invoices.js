const express = require("express");
const { NotFoundError, BadRequestError } = require("../expressError");

const router = new express.Router();
const db = require("../db");

//route to show all invoices
router.get("/", async function(req, res, next) {
  const results = await db.query(
    `Select id, comp_code, amt, paid, add_date, paid_date
    FROM invoices
    ORDER by add_date
     `
  );
  const invoices = results.rows;
  return res.json({ invoices })
});

//return a specific invoice relative to ID
router.get("/:id", async function(req, res, next) {
  let id = req.params.id;

  const results = await db.query(
    `SELECT id, comp_code, amt, paid, add_date, paid_date, name, description
    FROM invoices 
    Join companies on companies.code = invoices.comp_code
    WHERE id = $1`,
    [id]
  );
  
  const invoice = results.rows[0];
  if(!invoice) throw new NotFoundError(`Invoice does not exist`);
  
  const invoiceData = {invoice: {
      id: invoice.id,
      amt: invoice.amt,
      paid: invoice.paid,
      add_date: invoice.add_date,
      paid_date: invoice.paid_date,
      company: {
        code: invoice.comp_code,
        name: invoice.name,
        description: invoice.description
      }
    }
  }
    return res.json(invoiceData);
});

//Adding an invoice through post route.
router.post("/", async function(req, res, next) {
  let { comp_code, amt } = req.body;

  const results = await db.query(
   `INSERT INTO invoices (comp_code, amt)
    VALUES ($1, $2)
    RETURNING id, comp_code, amt, paid, add_date, paid_date
    `,
    [comp_code, amt]
  );
  
  const invoice = results.rows[0];
  if(!invoice) throw BadRequestError("Unable to add invoice to database");
  return res.status(201).json({invoice});
});

//Updating an invoice
router.put("/:id", async function(req, res, next) {
  let id = req.params.id;
  let {amt} = req.body;

  const results = await db.query(
   `UPDATE invoices
    SET amt = $1
    WHERE id = $2
    RETURNING id, comp_code, amt, paid, add_date, paid_date`,
    [amt, id]
  );

  const invoice = results.rows[0];
  
  if(!invoice) throw new NotFoundError(`No such invoice`);

  return res.status(404).json({ invoice });

});

//delete an invoice
router.delete("/:id", async function(req,res, next) {
  let id = req.params.id;

  const results = await db.query(
    `DELETE
      FROM invoices
      WHERE id = $1
      RETURNING id`,
      [id]
  );
  
  const invoice = results.rows[0];

  if(!invoice) throw new NotFoundError(`No such invoice`);

  return res.json({status: "deleted"});
});

  
module.exports = router;