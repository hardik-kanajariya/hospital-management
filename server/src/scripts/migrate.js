import sequelize from '../config/database.js';
import '../models/index.js'; // This will load all models

const runMigrations = async () => {
    try {
        console.log('🔄 Starting database migrations...');

        // Force sync in development (be careful in production)
        if (process.env.NODE_ENV === 'development') {
            await sequelize.sync({ force: true });
            console.log('✅ Database tables created/updated successfully');
        } else {
            await sequelize.sync({ alter: true });
            console.log('✅ Database schema synchronized');
        }

        console.log('🎉 Migrations completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
};

runMigrations();
