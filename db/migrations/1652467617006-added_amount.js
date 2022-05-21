module.exports = class added_amount1652467617006 {
  name = 'added_amount1652467617006'

  async up(db) {
    await db.query(`ALTER TABLE "transfer" ADD "amount" numeric NOT NULL`)
  }

  async down(db) {
    await db.query(`ALTER TABLE "transfer" DROP COLUMN "amount"`)
  }
}
