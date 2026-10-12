import { databaseErrorResponse, getDb } from '../lib/db';

async function listInvoices() {
  const sql = getDb();
  const data = await sql`
    SELECT invoices.amount, customers.name
    FROM invoices
    JOIN customers ON invoices.customer_id = customers.id
    WHERE invoices.amount = 666;
  `;

  return data;
}

export async function GET() {
  try {
    return Response.json(await listInvoices());
  } catch (error) {
    return databaseErrorResponse(error);
  }
}
