/**
 * Script para crear un restaurante de prueba rápidamente
 * Uso: node scripts/crear-restaurante.js
 */

const bcrypt = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n🍽️  CREADOR DE RESTAURANTE - MenusCarta\n');
console.log('Este script te ayudará a generar el hash de contraseña y el SQL para insertar tu restaurante.\n');

const pregunta = (texto) => {
  return new Promise((resolve) => {
    rl.question(texto, resolve);
  });
};

async function main() {
  try {
    // Obtener datos del usuario
    const nombre = await pregunta('Nombre del restaurante: ');
    const slug = await pregunta('Slug/URL (ej: mirestaurante, solo minúsculas sin espacios): ');
    const password = await pregunta('Contraseña de acceso: ');

    // Validar slug
    if (!/^[a-z0-9-]+$/.test(slug)) {
      console.error('\n❌ Error: El slug solo puede contener letras minúsculas, números y guiones.');
      process.exit(1);
    }

    // Generar hash
    console.log('\n⏳ Generando hash de contraseña...');
    const hash = await bcrypt.hash(password, 10);

    // Generar SQL
    console.log('\n✅ ¡Hash generado!\n');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📋 COPIA Y EJECUTA ESTE SQL EN SUPABASE SQL EDITOR:');
    console.log('═══════════════════════════════════════════════════════════════\n');

    const sql = `
-- Insertar restaurante: ${nombre}
INSERT INTO public.restaurants (name, slug, password_hash, owner_id, theme_id, is_active)
VALUES (
  '${nombre.replace(/'/g, "''")}',
  '${slug}',
  '${hash}',
  '00000000-0000-0000-0000-000000000000',
  (SELECT id FROM public.themes WHERE name = 'Classic Elegance' LIMIT 1),
  true
);
    `.trim();

    console.log(sql);
    console.log('\n═══════════════════════════════════════════════════════════════\n');

    console.log('📝 CREDENCIALES DE ACCESO:');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`   URL: http://localhost:3000/clientes`);
    console.log(`   Slug: ${slug}`);
    console.log(`   Contraseña: ${password}`);
    console.log('═══════════════════════════════════════════════════════════════\n');

    console.log('🔗 MENÚ PÚBLICO:');
    console.log(`   http://localhost:3000/${slug}\n`);

    console.log('✨ Pasos siguientes:');
    console.log('   1. Copia el SQL de arriba');
    console.log('   2. Ve a Supabase > SQL Editor');
    console.log('   3. Pega y ejecuta el SQL');
    console.log('   4. Accede con las credenciales mostradas\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();
