const {
  createOnUpdateTrigger,
  dropOnUpdateTrigger,
} = require("../util/db-util");

exports.up = async function(knex) {
  if (!(await knex.schema.hasTable("urls"))) {
    await knex.schema.createTable("urls", (t) => {
      t.uuid("id", { primaryKey: true }).defaultTo(knex.fn.uuid());
      t.text("original_url").notNullable();
      t.string("short_code", 8).notNullable().unique();
      t.string("custom_slug", 50).nullable();
      t.timestamp("expiration_date").nullable();
      t.jsonb("utm_parameters").nullable();
      t.integer("click_count").defaultTo(0).notNullable();
      t.timestamps(true, true, true);
      
      t.index("short_code");
      t.index("custom_slug");
      t.index("expiration_date");
    });

    await createOnUpdateTrigger(knex, "urls");
  }
};

exports.down = async function(knex) {
  if (await knex.schema.hasTable("urls")) {
    await dropOnUpdateTrigger(knex, "urls");
    await knex.schema.dropTable("urls");
  }
};
