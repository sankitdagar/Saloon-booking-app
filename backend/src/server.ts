import app from './app';
import { connectDatabase } from './config/database';
import { configureCloudinary } from './config/cloudinary';
import { env } from './config/env';
import { startReminderCron } from './jobs/reminderCron';

async function startServer(): Promise<void> {
  try {
    await connectDatabase();
    configureCloudinary();
    startReminderCron();

    app.listen(env.port, () => {
      console.log(`Server running on port ${env.port} [${env.nodeEnv}]`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
