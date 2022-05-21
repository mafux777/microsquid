module.exports = class xtokens1652811384763 {
  name = 'xtokens1652811384763'

  async up(db) {
    await db.query(`CREATE TABLE "x_transfer" ("id" character varying NOT NULL, "token" character varying(4) NOT NULL, "from_chain" integer NOT NULL, "to_chain" integer NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "amount" numeric NOT NULL, "from_id" character varying NOT NULL, "to_id" character varying NOT NULL, "height_id" character varying NOT NULL, CONSTRAINT "PK_fd38f82e5a5b696f53e44cdc2fc" PRIMARY KEY ("id"))`)
    await db.query(`CREATE INDEX "IDX_26ddf463d69b3576af4ab6902f" ON "x_transfer" ("from_id") `)
    await db.query(`CREATE INDEX "IDX_4bfe71c32c6f0dcc45f7550609" ON "x_transfer" ("to_id") `)
    await db.query(`CREATE INDEX "IDX_13862d6f8da8d7682252e1412d" ON "x_transfer" ("height_id") `)
    await db.query(`ALTER TABLE "x_transfer" ADD CONSTRAINT "FK_26ddf463d69b3576af4ab6902fd" FOREIGN KEY ("from_id") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
    await db.query(`ALTER TABLE "x_transfer" ADD CONSTRAINT "FK_4bfe71c32c6f0dcc45f7550609a" FOREIGN KEY ("to_id") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
    await db.query(`ALTER TABLE "x_transfer" ADD CONSTRAINT "FK_13862d6f8da8d7682252e1412d7" FOREIGN KEY ("height_id") REFERENCES "height"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
  }

  async down(db) {
    await db.query(`DROP TABLE "x_transfer"`)
    await db.query(`DROP INDEX "public"."IDX_26ddf463d69b3576af4ab6902f"`)
    await db.query(`DROP INDEX "public"."IDX_4bfe71c32c6f0dcc45f7550609"`)
    await db.query(`DROP INDEX "public"."IDX_13862d6f8da8d7682252e1412d"`)
    await db.query(`ALTER TABLE "x_transfer" DROP CONSTRAINT "FK_26ddf463d69b3576af4ab6902fd"`)
    await db.query(`ALTER TABLE "x_transfer" DROP CONSTRAINT "FK_4bfe71c32c6f0dcc45f7550609a"`)
    await db.query(`ALTER TABLE "x_transfer" DROP CONSTRAINT "FK_13862d6f8da8d7682252e1412d7"`)
  }
}
