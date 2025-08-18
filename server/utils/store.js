// Simple no-op persistence stubs to keep the in-memory demo stable.
// Some routes may import saveDb to persist state; in this demo it is a no-op.

export function saveDb() {
	// Intentionally empty; replace with real storage later
	return true;
}

export function loadDb() {
	// No persisted state; return nothing
	return null;
}
