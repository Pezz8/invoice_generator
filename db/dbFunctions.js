import pool from "./db.js";

// Add a unit
export async function addUnit(unitNumber) {
  const result = await pool.query(
    "INSERT INTO units (unit_number) VALUES ($1) RETURNING *",
    [unitNumber]
  );
  return result.rows[0];
}

// Add a person
export async function addPerson(name, email) {
  const result = await pool.query(
    "INSERT INTO people (name, email) VALUES ($1, $2) RETURNING *",
    [name, email]
  );
  return result.rows[0];
}

// Update a person
export async function updatePerson(personId, newName, newEmail) {
  const result = await pool.query(
    `UPDATE people
     SET name = $1, email = $2
     WHERE id = $3
     RETURNING *`,
    [newName, newEmail, personId]
  );
  return result.rows[0];
}

// Delete a person
export async function deletePerson(personId) {
  await pool.query(
    `DELETE FROM people
     WHERE id = $1`,
    [personId]
  );
}

// Assign a person to a unit
export async function assignPersonToUnit(
  unitId,
  personId,
  role,
  startDate = null
) {
  const result = await pool.query(
    `INSERT INTO unit_assignments (unit_id, person_id, role, active, start_date)
     VALUES ($1, $2, $3, true, $4) RETURNING *`,
    [unitId, personId, role, startDate]
  );
  return result.rows[0];
}

// Update an assignment (role and active status)
export async function updateAssignment(assignmentId, newRole, newActiveStatus) {
  const result = await pool.query(
    `UPDATE unit_assignments
     SET role = $1, active = $2
     WHERE id = $3
     RETURNING *`,
    [newRole, newActiveStatus, assignmentId]
  );
  return result.rows[0];
}

// Create an invoice
export async function createInvoice({
  unitId,
  assignmentId,
  invoiceType,
  laborHours,
  laborCost,
  partsCost,
  jobDate,
}) {
  const result = await pool.query(
    `INSERT INTO invoices 
     (unit_id, assignment_id, invoice_type, labor_hours, labor_cost, parts_cost, job_date)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      unitId,
      assignmentId,
      invoiceType,
      laborHours,
      laborCost,
      partsCost,
      jobDate,
    ]
  );
  return result.rows[0];
}

// Update an invoice (labor hours, labor cost, invoice type, job date)
export async function updateInvoice(
  invoiceId,
  { laborHours, laborCost, invoiceType, jobDate }
) {
  const result = await pool.query(
    `UPDATE invoices
     SET labor_hours = $1,
         labor_cost = $2,
         invoice_type = $3,
         job_date = $4
     WHERE id = $5
     RETURNING *`,
    [laborHours, laborCost, invoiceType, jobDate, invoiceId]
  );
  return result.rows[0];
}

// Delete an invoice
export async function deleteInvoice(invoiceId) {
  await pool.query(
    `DELETE FROM invoices
     WHERE id = $1`,
    [invoiceId]
  );
}

/*
// Add a part to an invoice
export async function addInvoicePart(invoiceId, partName, quantity, unitCost) {
  const result = await pool.query(
    `INSERT INTO invoice_parts
     (invoice_id, part_name, quantity, unit_cost)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [invoiceId, partName, quantity, unitCost]
  );
  return result.rows[0];
}
  */

export async function updatePartsCost(invoiceId) {
  const result = await pool.query(
    `
      UPDATE invoices
      SET parts_cost = (
        SELECT COALESCE(SUM(total_cost), 0)
        FROM invoice_parts
        WHERE invoice_id = $1
      )
      WHERE id = $1
      RETURNING *;
      `,
    [invoiceId]
  );
  return result.rows[0];
}

// Add a part to an invoice and auto-update the parts_cost
export async function addInvoicePart(invoiceId, partName, quantity, unitCost) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Insert the new part
    const partResult = await client.query(
      `INSERT INTO invoice_parts
       (invoice_id, part_name, quantity, unit_cost)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [invoiceId, partName, quantity, unitCost]
    );

    // Update the total parts cost in the invoice
    await client.query(
      `
      UPDATE invoices
      SET parts_cost = (
        SELECT COALESCE(SUM(total_cost), 0)
        FROM invoice_parts
        WHERE invoice_id = $1
      )
      WHERE id = $1
      `,
      [invoiceId]
    );

    await client.query("COMMIT");

    return partResult.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

// Update a part of an invoice
export async function updateInvoicePart(
  partId,
  newPartName,
  newQuantity,
  newUnitCost
) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const result = await client.query(
      `UPDATE invoice_parts
       SET part_name = $1,
           quantity = $2,
           unit_cost = $3
       WHERE id = $4
       RETURNING *`,
      [newPartName, newQuantity, newUnitCost, partId]
    );

    // Update the related invoice's parts_cost after modifying a part
    const invoiceIdResult = await client.query(
      `SELECT invoice_id FROM invoice_parts WHERE id = $1`,
      [partId]
    );
    const invoiceId = invoiceIdResult.rows[0].invoice_id;

    await client.query(
      `
      UPDATE invoices
      SET parts_cost = (
        SELECT COALESCE(SUM(total_cost), 0)
        FROM invoice_parts
        WHERE invoice_id = $1
      )
      WHERE id = $1
      `,
      [invoiceId]
    );

    await client.query("COMMIT");

    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

// Delete a part from an invoice
export async function deleteInvoicePart(partId) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Get the invoice_id linked to the part
    const invoiceIdResult = await client.query(
      `SELECT invoice_id FROM invoice_parts WHERE id = $1`,
      [partId]
    );
    const invoiceId = invoiceIdResult.rows[0]?.invoice_id;

    if (!invoiceId) {
      throw new Error(`Invoice part with id ${partId} not found.`);
    }

    // Delete the part
    await client.query(
      `DELETE FROM invoice_parts
       WHERE id = $1`,
      [partId]
    );

    // Update the invoice's parts_cost
    await client.query(
      `
      UPDATE invoices
      SET parts_cost = (
        SELECT COALESCE(SUM(total_cost), 0)
        FROM invoice_parts
        WHERE invoice_id = $1
      )
      WHERE id = $1
      `,
      [invoiceId]
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function findInvoicesByUnitNumber(unitNumber) {
  const result = await pool.query(
    `
    SELECT invoices.*
    FROM invoices
    JOIN units ON invoices.unit_id = units.id
    WHERE units.unit_number = $1
    ORDER BY invoices.created_at DESC
    `,
    [unitNumber]
  );
  return result.rows;
}
