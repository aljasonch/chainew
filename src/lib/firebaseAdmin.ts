import "server-only";

import { App, cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function getServerEnv(name: string): string | undefined {
    const value = process.env[name];
    if (!value) {
        return undefined;
    }
    return value;
}

function hasServiceAccountKey(privateKey: string | undefined): privateKey is string {
    if (!privateKey) {
        return false;
    }

    return (
        privateKey.includes("BEGIN PRIVATE KEY") &&
        privateKey.includes("END PRIVATE KEY") &&
        !privateKey.includes("YOUR_PRIVATE_KEY")
    );
}

function getFirebaseAdminApp(): App {
    if (getApps().length) {
        return getApp();
    }

    const projectId = getServerEnv("FIREBASE_PROJECT_ID");
    const clientEmail = getServerEnv("FIREBASE_CLIENT_EMAIL");
    const privateKey = getServerEnv("FIREBASE_PRIVATE_KEY")?.replace(/\\n/g, "\n");

    if (projectId && clientEmail && hasServiceAccountKey(privateKey)) {
        return initializeApp({
            credential: cert({
                projectId,
                clientEmail,
                privateKey,
            }),
        });
    }

    // Allow local builds to complete when .env.local contains placeholders.
    return initializeApp(projectId ? { projectId } : {});
}

const firebaseAdminApp = getFirebaseAdminApp();
export const adminDb = getFirestore(firebaseAdminApp);
export const adminAuth = getAuth(firebaseAdminApp);
