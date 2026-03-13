import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Suppress Firebase connection errors in console
const originalError = console.error;
console.error = (...args: any[]) => {
  // Filter out Firebase Listen channel termination errors
  const errorMessage = args[0]?.toString() || '';
  if (
    errorMessage.includes('ERR_INTERNET_DISCONNECTED') ||
    errorMessage.includes('Listen') ||
    errorMessage.includes('WebChannelConnection') ||
    errorMessage.includes('firestore.googleapis.com')
  ) {
    // Silently ignore these Firebase connection errors
    return;
  }
  // Log other errors normally
  originalError.apply(console, args);
};

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
