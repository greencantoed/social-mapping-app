exports.up = function(knex) {
    return knex.schema.createTable('reports', table => {
      table.increments('id').primary();
      table.text('description').notNullable();
      table.specificType('location', 'geography(POINT, 4326)').notNullable();
      table.text('imageUrl').notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('reports');
  };
  