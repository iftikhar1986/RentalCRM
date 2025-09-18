import 'dotenv/config';
import { db } from './server/db';
import { vehicleTypes, vehicleMakes, vehicleModels, vehiclePlates } from './shared/schema';

async function seedVehicleData() {
  try {
    console.log('Starting vehicle data seeding...');

    // 1. Insert Vehicle Types
    const types = await db.insert(vehicleTypes).values([
      { name: 'SUV', description: 'Sport Utility Vehicle', isActive: true },
      { name: 'Sedan', description: 'Four-door passenger car', isActive: true },
      { name: 'Hatchback', description: 'Compact car with rear door', isActive: true },
      { name: 'Pickup', description: 'Pickup truck', isActive: true },
      { name: 'Van', description: 'Commercial van', isActive: true }
    ]).onConflictDoNothing().returning();
    
    console.log('Vehicle types created:', types.length);

    // Get all types for reference
    const allTypes = await db.select().from(vehicleTypes);
    
    // 2. Insert Vehicle Makes
    const makes = [];
    for (const type of allTypes) {
      if (type.name === 'SUV') {
        makes.push(
          { name: 'Toyota', typeId: type.id, isActive: true },
          { name: 'Honda', typeId: type.id, isActive: true },
          { name: 'Nissan', typeId: type.id, isActive: true }
        );
      } else if (type.name === 'Sedan') {
        makes.push(
          { name: 'Toyota', typeId: type.id, isActive: true },
          { name: 'Honda', typeId: type.id, isActive: true },
          { name: 'Hyundai', typeId: type.id, isActive: true }
        );
      } else if (type.name === 'Hatchback') {
        makes.push(
          { name: 'Honda', typeId: type.id, isActive: true },
          { name: 'Nissan', typeId: type.id, isActive: true }
        );
      }
    }

    let insertedMakes = [];
    if (makes.length > 0) {
      insertedMakes = await db.insert(vehicleMakes).values(makes).onConflictDoNothing().returning();
    }
    console.log('Vehicle makes created:', insertedMakes.length);

    // Get all makes for reference
    const allMakes = await db.select().from(vehicleMakes);

    // 3. Insert Vehicle Models
    const models = [];
    for (const make of allMakes) {
      if (make.name === 'Toyota') {
        models.push(
          { name: 'Prado', makeId: make.id, year: 2024, isActive: true },
          { name: 'Camry', makeId: make.id, year: 2024, isActive: true },
          { name: 'Corolla', makeId: make.id, year: 2023, isActive: true }
        );
      } else if (make.name === 'Honda') {
        models.push(
          { name: 'CR-V', makeId: make.id, year: 2024, isActive: true },
          { name: 'Civic', makeId: make.id, year: 2024, isActive: true },
          { name: 'Accord', makeId: make.id, year: 2023, isActive: true }
        );
      } else if (make.name === 'Nissan') {
        models.push(
          { name: 'X-Trail', makeId: make.id, year: 2024, isActive: true },
          { name: 'Altima', makeId: make.id, year: 2023, isActive: true }
        );
      }
    }

    const insertedModels = await db.insert(vehicleModels).values(models).onConflictDoNothing().returning();
    console.log('Vehicle models created:', insertedModels.length);

    // Get all models for reference
    const allModels = await db.select().from(vehicleModels);

    // 4. Insert Vehicle Plates
    const plates = [];
    let plateCounter = 1;
    
    for (const model of allModels.slice(0, 10)) { // Just add 10 sample plates
      plates.push({
        plateNumber: `ABC-${String(plateCounter).padStart(3, '0')}`,
        modelId: model.id,
        color: ['White', 'Black', 'Silver', 'Red', 'Blue'][plateCounter % 5],
        status: 'available',
        isActive: true
      });
      plateCounter++;
    }

    const insertedPlates = await db.insert(vehiclePlates).values(plates).onConflictDoNothing().returning();
    console.log('Vehicle plates created:', insertedPlates.length);

    console.log('Vehicle data seeding completed successfully!');
    console.log(`Summary:
    - Types: ${types.length}
    - Makes: ${insertedMakes.length}
    - Models: ${insertedModels.length}
    - Plates: ${insertedPlates.length}`);

  } catch (error) {
    console.error('Error seeding vehicle data:', error);
  }
}

seedVehicleData().then(() => {
  console.log('Seeding process finished');
  process.exit(0);
}).catch(error => {
  console.error('Seeding failed:', error);
  process.exit(1);
});